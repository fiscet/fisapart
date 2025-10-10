import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { searchAgent } from '@/lib/mastra/agents/searchAgent';
import { dataAgent } from '@/lib/mastra/agents/dataAgent';
import { createApartmentSearchRuntimeContext } from '@/lib/mastra/runtime-context';
import { client } from '@/lib/sanity/client';
import { fetchApartments } from '@/lib/sanity/actions';
import { calculateTotalPrice } from '@/lib/mastra/tools/fetchApartmentsByFilters';
import { QUERY_EXPERIENCE_CATEGORIES, QUERY_CITIES } from '@/lib/sanity/queries';
import type { ApartmentListFilters } from '@/providers/ApartmentFiltersProvider';
import type { ApartmentData } from '@/types/apartment';

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']).default('user'),
        content: z.string(),
      })
    )
    .or(z.string()),
  threadId: z.string().optional(),
  resourceId: z.string().optional(),
  // Optional direct filters to bypass LLM extraction when provided
  filters: z
    .object({
      city: z.string().nullable().optional(),
      experienceCategory: z.string().nullable().optional(),
      capacity: z.number().nullable().optional(),
      checkin: z.string().nullable().optional(),
      checkout: z.string().nullable().optional(),
    })
    .optional(),
  runtimeContext: z.object({
    'available-cities': z.array(z.object({
      _id: z.string(),
      name: z.string(),
      slug: z.string(),
      description: z.string().nullable().optional(),
    })).optional(),
    'available-experience-categories': z.array(z.object({
      _id: z.string(),
      name: z.string(),
      slug: z.string(),
      description: z.string().nullable().optional(),
    })).optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { messages, threadId, resourceId, runtimeContext: runtimeContextData, filters: bodyFilters } = BodySchema.parse(json);

    // Create runtime context and populate with data from request
    const runtimeContext = createApartmentSearchRuntimeContext();

    if (runtimeContextData) {
      // Use data from request if available
      if (runtimeContextData['available-cities']) {
        runtimeContext.set('available-cities', runtimeContextData['available-cities']);
      }
      if (runtimeContextData['available-experience-categories']) {
        runtimeContext.set('available-experience-categories', runtimeContextData['available-experience-categories']);
      }
    } else {
      // Fallback: fetch data if not provided (for backward compatibility)
      const [experienceCategories, cities] = await Promise.all([
        client.fetch(QUERY_EXPERIENCE_CATEGORIES),
        client.fetch(QUERY_CITIES),
      ]);
      runtimeContext.set('available-experience-categories', experienceCategories || []);
      runtimeContext.set('available-cities', cities || []);
    }

    let text = '';
    let filters: Partial<ApartmentListFilters> | undefined = undefined;
    let toolCalls: unknown[] | undefined = undefined;

    if (bodyFilters) {
      filters = bodyFilters as Partial<ApartmentListFilters>;
    } else {
      const response = await searchAgent.generate(messages, {
        memory: threadId && resourceId ? { thread: threadId, resource: resourceId } : undefined,
        maxSteps: 3,
        toolChoice: 'auto',
        runtimeContext,
        structuredOutput: {
          schema: z.object({
            city: z
              .string()
              .nullable()
              .optional()
              .describe('The city where the user wants to find an apartment'),
            experienceCategory: z
              .string()
              .nullable()
              .optional()
              .describe('The experience category the user is interested in'),
            capacity: z.number().nullable().optional().describe('Number of guests/people'),
            checkin: z
              .string()
              .nullable()
              .optional()
              .describe('Check-in date in YYYY-MM-DD format'),
            checkout: z
              .string()
              .nullable()
              .optional()
              .describe('Check-out date in YYYY-MM-DD format'),
          }),
          model: openai(process.env.OPENAI_MODEL || 'gpt-4o-mini'),
          errorStrategy: 'warn',
        },
      });

      text = response.text ?? '';
      toolCalls = response.toolCalls;
      filters = response.object;
    }

    // Sanitize filters by removing null/undefined values before using them
    function removeNullish<T extends Record<string, unknown>>(obj: T): Partial<T> {
      const cleaned: Partial<T> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined) {
          cleaned[key as keyof T] = value as T[keyof T];
        }
      }
      return cleaned;
    }
    const cleanedFilters: Partial<ApartmentListFilters> | undefined =
      filters ? (removeNullish(filters) as Partial<ApartmentListFilters>) : undefined;

    type DataAgentResult = { text?: string; toolCalls?: unknown[]; apartments?: ApartmentData[]; };
    let dataAgentResult: DataAgentResult | undefined = undefined;

    // Only call data agent if we have meaningful search criteria
    // Require: (city OR experienceCategory) AND dates AND guests
    // If city is provided, experienceCategory is optional
    const hasLocation = Boolean(
      cleanedFilters && (cleanedFilters.city || cleanedFilters.experienceCategory)
    );
    const hasDates = Boolean(
      cleanedFilters && cleanedFilters.checkin && cleanedFilters.checkout
    );
    const hasGuests = Boolean(
      cleanedFilters && typeof cleanedFilters.capacity === 'number' && cleanedFilters.capacity > 0
    );
    const hasSearchCriteria = hasLocation && hasDates && hasGuests;

    if (hasSearchCriteria) {
      // Pass filters to data agent which will use tool to fetch data
      const dataRes = await dataAgent.generate(
        [
          { role: 'system', content: 'Use the tool with the provided filters.' },
          { role: 'user', content: JSON.stringify(cleanedFilters) },
        ],
        {
          memory: threadId && resourceId ? { thread: threadId, resource: resourceId } : undefined,
          toolChoice: 'required',
          maxSteps: 3,
        }
      );

      // Extract apartments from tool results (Mastra places them under toolResults[].result)
      let apartments: ApartmentData[] = [];
      type ToolResult = { toolName?: string; result?: { apartments?: ApartmentData[]; }; };
      const toolResults = (dataRes as { toolResults?: ToolResult[]; }).toolResults;

      if (Array.isArray(toolResults)) {
        const first = toolResults.find(
          (tr) =>
            tr?.toolName === 'fetchApartmentsByFilters' && Array.isArray(tr?.result?.apartments)
        );
        if (first?.result?.apartments) {
          apartments = first.result.apartments;
        }
      }

      // Fallback: if tool results are empty, fetch directly to avoid LLM/tool wiring issues
      if (apartments.length === 0) {
        const fetched = await fetchApartments({
          city: cleanedFilters?.city,
          experienceCategory: cleanedFilters?.experienceCategory,
          capacity: cleanedFilters?.capacity,
          checkin: cleanedFilters?.checkin,
          checkout: cleanedFilters?.checkout,
        });
        apartments = fetched.map(apartment => {
          if (cleanedFilters?.checkin && cleanedFilters?.checkout && apartment.pricePeriods) {
            const { totalPrice, totalDays } = calculateTotalPrice(
              cleanedFilters.checkin,
              cleanedFilters.checkout,
              apartment.pricePeriods
            );
            return { ...apartment, totalPrice, totalDays } as ApartmentData;
          }
          return apartment;
        });
        console.log('[agent-search] Fallback fetchApartments count:', apartments.length);
      } else {
        console.log('[agent-search] Tool apartments count:', apartments.length);
      }

      dataAgentResult = { text: dataRes.text, toolCalls: dataRes.toolCalls, apartments };
    }

    // Messages are automatically saved by Mastra's Memory system when using agents

    return NextResponse.json({ text, toolCalls, filters, dataAgentResult });
  } catch (e: unknown) {
    console.error('Search API error:', e);
    const message = e instanceof Error ? e.message : 'Bad Request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
