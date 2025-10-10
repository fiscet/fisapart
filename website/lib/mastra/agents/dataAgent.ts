import { Agent } from '@mastra/core/agent';
// import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
// import { groq } from '@ai-sdk/groq';
import { fetchApartmentsByFilters } from '@/lib/mastra/tools/fetchApartmentsByFilters';
import { memory } from '@/lib/mastra/memory';

// const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// const fastModel = groq('llama-3.1-8b-instant');
const modelGemini = google('gemini-2.5-flash-lite');

export const dataAgent = new Agent({
  name: 'apartment-data-agent',
  description: 'Fetches apartments from Sanity via tools.',
  instructions: `When given an object of filters (city or experienceCategory, capacity, checkin, checkout),
    call the fetchApartmentsByFilters tool with the same fields.
    Return ONLY the apartments data from the tool result - do not generate or suggest fake apartments.
    If there's an error, return a helpful message explaining what went wrong.
    If no apartments are found, inform the user that no apartments match their criteria.
    Be aware today is ${new Date().toISOString()}`,
  model: modelGemini, //openai(DEFAULT_MODEL),
  memory,
  tools: {
    fetchApartmentsByFilters,
  },
});
