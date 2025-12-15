"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useUsername } from "@/hooks/use-username";
import { api } from "@/lib/api";
import { useRealtime } from "@/lib/realtime-client";
import { copyToClipboard } from "@/utils/copy-to-clipboard";
import { format } from "date-fns";

const RoomPage = () => {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const { data: ttlData } = useQuery({
    queryKey: ["ttl", roomId],
    queryFn: async () => {
      const res = await api.room.ttl.get({
        query: { roomId },
      });
      return res.data;
    },
  });

  const { username } = useUsername();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: sendMessage, isPending: isMessagePending } = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      await api.messages.post(
        { sender: username, text },
        { query: { roomId } },
      );

      setInputValue("");
    },
  });

  const onCopyClick = () => {
    const url = window.location.href;
    copyToClipboard(url);
    toast.success("Copied", { icon: null });
  };

  const isSubmitDisabled = inputValue.trim().length === 0 && !isMessagePending; // Fixed logic

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: async () => {
      const res = await api.messages.get({ query: { roomId } });
      return res.data;
    },
  });

  useRealtime({
    channels: [roomId],
    events: ["chat.message", "chat.destroy"],
    onData: ({ event }) => {
      if (event === "chat.message") {
        refetchMessages();
      }
      if (event === "chat.destroy") {
        router.push("/?errors=destroyed");
      }
    },
  });

  useEffect(() => {
    if (ttlData?.ttl !== undefined) {
      setTimeRemaining(ttlData.ttl);
    }
  }, [ttlData]);
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (newTime <= 0) {
          clearInterval(interval);
          router.push("/?error=destroyed");
          return 0;
        }
        const newTime = prev - 1;

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, router]);

  const { mutate: destroyRoom } = useMutation({
    mutationFn: async () => {
      await api.room.delete(null, { query: { roomId } });
    },
  });

  return (
    <main className="flex flex-col h-dvh max-h-dvh overflow-hidden bg-base text-foreground">
      <header className="border-b border-surface-1 p-4 flex items-center justify-between bg-surface-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-surface-2 uppercase font-mono">
              ROOM ID
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-subtext-0 font-mono">
                {roomId}
              </span>
              <button
                className="text-[12px] bg-surface-2 rounded py-0.5 px-2 text-subtext-0 hover:bg-surface-1 hover:text-subtext-0/50 transition-colors cursor-pointer flex items-center gap-1 font-mono"
                onClick={onCopyClick}
              >
                Copy
              </button>
            </div>
          </div>
          <div className="h-8 w-px bg-overlay-2" />
          <div className="flex flex-col">
            <span className="text-xs text-subtext-0 uppercase font-mono">
              Self Destruct
            </span>
            <span
              className={`text-sm font-bold flex items-center gap-2 font-mono
                ${timeRemaining !== null && timeRemaining < 60 ? "text-red-500" : "text-amber-500"}
              `}
            >
              {timeRemaining !== null ? formatTime(timeRemaining) : "--:--"}
            </span>
          </div>
        </div>
        <button
          className="text-sm bg-crust uppercase px-3 py-1.5 rounded text-color-foreground hover:bg-color-mantle font-bold transition-all group flex items-center gap-2 disabled:opacity-50 font-mono disabled:cursor-not-allowed cursor-pointer"
          onClick={() => destroyRoom()}
        >
          <span className="animate-pulse size-2 rounded-full bg-red-500" />
          Destroy Now
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-color-mantle">
        {messages?.messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-surface-2 text-sm">No messages yet</p>
          </div>
        )}

        {messages?.messages.map((msg) => (
          <div key={msg.id} className="flex flex-col items-start">
            <div className="max-w-[80%] goup">
              <div className="flex items-baseline gap-3 mb-1">
                <span
                  className={`text-xs font-bold ${msg.sender === username ? "text-surface-2" : "text-foreground"}`}
                >
                  {msg.sender === username ? "YOU" : msg.sender}
                </span>
                <span className="text-[10px] text-crust-2">
                  {format(msg.timestamp, "HH:mm")}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed break-all"></p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-color-subtext-0 bg-color-surface-0 shrink-0">
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 animate-pulse text-color-surface-2 font-mono">
              #
            </span>
            <input
              className="w-full bg-color-base border border-color-surface-2 focus:border-color-overlay-0 focus:outline-none transition-colors text-color-foreground py-3 pl-10 pr-4 text-sm font-mono placeholder:text-color-overlay-1"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              ref={inputRef}
              autoFocus
              placeholder="Type a message..."
              onKeyDown={(e) => {
                // send on enter
                if (e.key === "Enter" && inputValue.trim()) {
                  // send message
                  sendMessage({ text: inputValue });
                  inputRef.current?.focus();
                }
              }}
            />
          </div>
          <button
            className="text-base bg-overlay-2 hover:bg-overlay-1 px-6 font-bold rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono"
            disabled={isSubmitDisabled}
            onClick={() => {
              sendMessage({ text: inputValue });
              inputRef.current?.focus();
            }}
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
};

export default RoomPage;
