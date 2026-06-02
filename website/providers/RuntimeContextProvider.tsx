'use client';

import React from 'react';
import type { SuggestionItem } from '@/types/suggestion';

interface RuntimeContextProviderProps {
  children: React.ReactNode;
  cities: SuggestionItem[];
  experienceCategories: SuggestionItem[];
}

type RuntimeContextValue = {
  cities: SuggestionItem[];
  experienceCategories: SuggestionItem[];
};

const RuntimeContextContext = React.createContext<RuntimeContextValue | null>(null);

export function RuntimeContextProvider({
  children,
  cities,
  experienceCategories,
}: RuntimeContextProviderProps) {
  const value = React.useMemo(
    () => ({ cities, experienceCategories }),
    [cities, experienceCategories]
  );

  return (
    <RuntimeContextContext.Provider value={value}>{children}</RuntimeContextContext.Provider>
  );
}

export function useRuntimeContext() {
  const context = React.useContext(RuntimeContextContext);
  if (!context) {
    throw new Error('useRuntimeContext must be used within RuntimeContextProvider');
  }
  return context;
}
