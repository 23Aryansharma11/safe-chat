import { Home } from "@/components/home";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="flex h-dvh flex-col items-center justify-center p-4 bg-crust text-color-foreground">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold font-mono"># Safe Chat</h1>
            <div className="text-subtext-0">Connecting...</div>
          </div>
        </main>
      }
    >
      <Home />
    </Suspense>
  );
}
