"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-surface-2)",
            color: "var(--color-foreground)",
            border: "2px solid var(--color-surface-1)",
            fontSize: "var(--text-xs)",
            padding: "2"
          },
          duration: 500,
        }}
      />
    </QueryClientProvider>
  );
};
