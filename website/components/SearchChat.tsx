'use client';

import React from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useSearchResults } from '@/providers/SearchResultsProvider';
import { useRuntimeContext } from '@/providers/RuntimeContextProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroInput } from '@/components/ui/hero-input';
import { ChevronUp, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { ApartmentData } from '@/types/apartment';

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-lg font-bold mb-2">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-base font-semibold mb-2 mt-3">{children}</h2>
  ),
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li className="text-sm">{children}</li>,
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold">{children}</strong>
  ),
};

function MarkdownBubble({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none prose-headings:text-current prose-p:text-current prose-strong:text-current prose-ul:text-current prose-li:text-current">
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
}

export default function SearchChat() {
  const { setApartments, setIsSearchActive } = useSearchResults();
  const { cities, experienceCategories } = useRuntimeContext();
  const [input, setInput] = React.useState('');
  const [isExpanded, setIsExpanded] = React.useState(true);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const loading = status === 'submitted' || status === 'streaming';

  const welcomeMessage = React.useMemo(() => {
    const citiesList = cities.map((c) => c.name).join(', ');
    const categoriesList = experienceCategories.map((c) => c.name).join(', ');

    return `# Welcome! 🏠

Tell me what you need and I will narrow apartments for you. You can mention:

- **City**
  ${citiesList}
- **Experience type** (what you want to do)
  ${categoriesList}
- **Dates** (check-in and check-out)
- **Number of guests**

Just tell me your preferences and I'll find the perfect apartment for you! 🎯`;
  }, [cities, experienceCategories]);

  // Push apartment results from the latest searchApartments tool output into the
  // results provider. Each tool result is processed only once (keyed by toolCallId)
  // so calling setApartments here can't re-trigger this effect into a render loop.
  const lastToolCallIdRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const parts = messages[i].parts;
      for (let j = parts.length - 1; j >= 0; j--) {
        const part = parts[j] as {
          type: string;
          state?: string;
          toolCallId?: string;
          output?: { apartments?: ApartmentData[] };
        };
        if (part.type === 'tool-searchApartments' && part.state === 'output-available') {
          const id = part.toolCallId ?? `${messages[i].id}:${j}`;
          if (lastToolCallIdRef.current === id) return; // already handled
          lastToolCallIdRef.current = id;
          const apartments = part.output?.apartments ?? [];
          if (apartments.length > 0) {
            setApartments(apartments);
            setIsSearchActive(true);
          }
          return;
        }
      }
    }
  }, [messages, setApartments, setIsSearchActive]);

  // Auto-scroll to bottom when new messages are added
  React.useEffect(() => {
    if (messagesContainerRef.current && isExpanded) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isExpanded]);

  function handleSend() {
    const content = input.trim();
    if (!content || loading) return;
    sendMessage({ text: content });
    setInput('');
  }

  return (
    <Card className="search-shadow border-gray-600 bg-white w-full" data-testid="card-search-chat">
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          {/* Toggle Button */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
              data-testid="toggle-chat-view"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span className="text-xs">Compress</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span className="text-xs">Expand</span>
                </>
              )}
            </Button>
          </div>

          {/* Chat Messages - Only show when expanded */}
          {isExpanded && (
            <div
              ref={messagesContainerRef}
              className="h-64 space-y-2 overflow-y-auto pr-2 scroll-smooth"
            >
              {/* Static welcome message */}
              <div className="text-left">
                <div className="inline-block rounded-xl px-3 py-2 max-w-[80%] break-words bg-muted text-foreground">
                  <MarkdownBubble content={welcomeMessage} />
                </div>
              </div>

              {messages.map((m) => {
                const textContent = m.parts
                  .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                  .map((p) => p.text)
                  .join('');
                if (!textContent) return null;
                return (
                  <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                    <div
                      className={`inline-block rounded-xl px-3 py-2 max-w-[80%] break-words ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}
                    >
                      {m.role === 'assistant' ? (
                        <MarkdownBubble content={textContent} />
                      ) : (
                        textContent
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Input Section - Always visible */}
          {/* suppressHydrationWarning: password-manager extensions (e.g. ProtonPass)
              inject attributes like data-protonpass-form on the form wrapper,
              causing a harmless hydration mismatch. */}
          <div className="flex gap-2 w-full" suppressHydrationWarning>
            <HeroInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={loading ? 'Searching...' : 'Ask about apartments...'}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1"
            />
            <Button disabled={loading} onClick={handleSend} className="px-4 md:px-6 flex-shrink-0">
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
