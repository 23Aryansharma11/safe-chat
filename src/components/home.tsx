"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

import { useUsername } from "@/hooks/use-username";
import { api } from "@/lib/api";

const ERROR_MESSAGES: Record<string, string> = {
  "invalid-url": "Invalid room URL.",
  "room-not-found": "This room does not exist.",
  "room-full": "Room is full!",
  destroyed: "Room was destroyed",
};

export function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { username } = useUsername();
  // Handle all ?error=... from middleware
  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;

    const message =
      ERROR_MESSAGES[error] ?? "Something went wrong. Please try again.";

    toast.error(message, { icon: null });

    // Remove the query param so it doesn't retrigger
    router.replace("/");
  }, [searchParams, router]);

  const { mutate: createRoom, isPending: isCreateRoomPending } = useMutation({
    mutationFn: async () => {
      const res = await api.room.create.post();
      console.log(res);
      if (res.status === 201 && res.data?.roomId) {
        router.push(`/room/${res.data.roomId}`);
      } else {
        toast.error("Failed to create room. Please try again.", {
          icon: null,
        });
      }
    },
  });

  return (
    <main className="flex h-dvh flex-col items-center justify-center p-4 bg-crust">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            # Safe Chat
          </h1>
          <p className="text-sm text-subtext-0">
            Realtime | Safe | Self-Destructing
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
            <button
              className="w-full bg-surface-1 text-subtext p-3 text-sm font-bold hover:bg-surface-0 hover:text-overlay-1 transition-colors mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => createRoom()}
              disabled={isCreateRoomPending}
            >
              Create Secure Room
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
