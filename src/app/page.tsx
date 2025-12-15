"use client";

import { usernameKey } from "@/utils/constants";
import { generateUserName } from "@/utils/generate-user-name";
import { useEffect, useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fn = () => {
      const storedUserName = localStorage.getItem(usernameKey);
      if (storedUserName) {
        setUsername(storedUserName);
        return;
      }
      const newUsername = generateUserName();
      localStorage.setItem(usernameKey, newUsername);
      setUsername(newUsername);
    };
    fn();
  }, []);

  return (
    <main className="flex h-dvh flex-col items-center justify-center p-4 bg-crust">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            # Safe Chat
          </h1>
          <p className="text-sm text-subtext-0">
            Realtime | Safe | self destructing chat room
          </p>
        </div>
        <div className="border border-overlay-0 bg-base/90 p-6 backdrop-blur-md">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center text-overlay-1">
                Your Name
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-mantle border border-surface-1 p-3 text-sm text-subtext-0">
                  {username}
                </div>
              </div>
            </div>
            <button className="w-full bg-surface-1 text-overlay-2 p-3 text-sm font-bold hover:bg-surface-0 hover:text-overlay-1 transition-colors mt-2 cursor-pointer disabled:opacity-50">
              Create Secure Room
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
