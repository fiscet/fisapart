# FisApart

**AI DEMO SITE — Holiday apartment rentals. Easy search, easy booking.**

A demo holiday-rental site where the search is a conversation. Instead of fiddling
with filters, you tell an AI assistant what you want in your own words and it finds
matching apartments. Data is local mock data, but the search and the assistant's
reasoning are fully dynamic.

## Functional features

- **Conversational AI search** — Describe your trip in plain language; the assistant
  understands it and finds matching apartments. No forms, no filter panels.
- **Natural-language understanding** — Mention a **city** (Rome, Florence, Venice,
  Milan, Positano, Ogliastra, Jesolo, Levanzo, Rimini, Alberobello) *or* an
  **experience** (Sea, City, Wellness, Food & Wine), **dates**, and the **number of
  guests** — in any order, in your own words.
- **Understands relative dates** — Phrases like *"end of June"*, *"next weekend"*,
  *"tomorrow for 3 nights"* are converted to real check-in / check-out dates.
- **Smart follow-up questions** — If something is missing (location, dates, or
  guests), the assistant asks a short follow-up before searching, and suggests valid
  options from the real catalogue.
- **Availability & price aware** — Results are filtered by date availability and by
  guest capacity, and the **total price for your stay** is computed night by night.
- **Live streaming answers** — Replies stream in as they are generated; the chat
  input refocuses automatically when the assistant is done so you can keep typing.
- **Browse by destination & experience** — Featured cities and experience categories
  on the home page for quick exploration.
- **Apartment details** — Each apartment has photos, amenities, a description,
  capacity and seasonal pricing.

## Try saying things like…

You don't need to phrase it any special way — just talk to it. For example:

- *"I'm looking for a place by the sea for me and my wife at the end of June"*
- *"Cerco un posto al mare per me e mia moglie a fine giugno"*
- *"Something in the mountains-feel coast of Sardinia for 2, first week of August"*
- *"A wellness retreat for two in early September"*
- *"We're 3 foodies — find us a place in Tuscany for a long weekend in May"*
- *"Family beach apartment in Jesolo for 5, mid-July"*
- *"Un weekend romantico a Venezia per due a settembre"*
- *"Apartments in Rome for 2 guests, July 10 to 14"*

The assistant figures out the city or experience, the dates and the number of
guests — and asks you if anything is still missing.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **Vercel AI SDK** with the **Groq** provider for streaming chat and tool calling
- **Tailwind CSS v4** + Radix UI primitives
- Local **JSON mock data** (`website/data/db.json`) as the content source

## Getting started

```bash
cd website
npm install
# set GROQ_API_KEY (and optionally GROQ_MODEL) in .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
