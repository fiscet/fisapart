'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sparkles,
  MessagesSquare,
  CalendarDays,
  HelpCircle,
  BadgeEuro,
  Compass,
} from 'lucide-react';

type Feature = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: MessagesSquare,
    title: 'Conversational AI search',
    description:
      'Describe your trip in plain language and the assistant finds matching apartments — no forms, no filter panels.',
  },
  {
    icon: Compass,
    title: 'Say a city or a vibe',
    description:
      'Mention a city (Rome, Venice, Positano…) or an experience (Sea, City, Wellness, Food & Wine), in any order.',
  },
  {
    icon: CalendarDays,
    title: 'Understands relative dates',
    description:
      '“End of June”, “next weekend”, “tomorrow for 3 nights” are turned into real check-in / check-out dates.',
  },
  {
    icon: HelpCircle,
    title: 'Smart follow-up questions',
    description:
      'If the location, dates or number of guests are missing, the assistant asks a short question before searching.',
  },
  {
    icon: BadgeEuro,
    title: 'Availability & price aware',
    description:
      'Results are filtered by availability and capacity, and the total price for your stay is computed night by night.',
  },
];

const examples = [
  "I'm looking for a place by the sea for me and my wife at the end of June",
  'Cerco un posto al mare per me e mia moglie a fine giugno',
  'A wellness retreat for two in early September',
  "We're 3 foodies — find us a place in Tuscany for a long weekend in May",
  'Family beach apartment in Jesolo for 5, mid-July',
  'Un weekend romantico a Venezia per due a settembre',
  'Apartments in Rome for 2 guests, July 10 to 14',
];

export function FeaturesModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="How this AI demo works"
          className="animate-heartbeat group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-fuchsia-600 to-indigo-600 px-6 py-3 font-semibold text-white hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          data-testid="features-modal-trigger"
        >
          {/* Pulsing halos to draw attention */}
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-indigo-500/50" />
          <span className="absolute inset-0 -z-10 animate-pulse rounded-full bg-fuchsia-500/30" />
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span>How it works</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            Search by simply talking to it
          </DialogTitle>
          <DialogDescription>
            This is an AI demo: the apartment data is mock data, but the search and the
            assistant&apos;s reasoning are fully dynamic. Tell it what you want in your own
            words and it does the rest.
          </DialogDescription>
        </DialogHeader>

        <ul className="mt-2 space-y-4">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-3">
              <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-lg border bg-muted/40 p-4">
          <p className="mb-3 font-semibold text-foreground">Try saying things like…</p>
          <ul className="space-y-2">
            {examples.map((example) => (
              <li
                key={example}
                className="rounded-md bg-background px-3 py-2 text-sm italic text-foreground/80 shadow-sm"
              >
                “{example}”
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            You don&apos;t need any special wording — just talk to it. The assistant
            figures out the city or experience, the dates and the number of guests, and
            asks you if anything is still missing.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
