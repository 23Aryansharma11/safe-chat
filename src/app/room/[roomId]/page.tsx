"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useUsername } from "@/hooks/use-username";
import { api } from "@/lib/api";
import { useRealtime } from "@/lib/realtime-client";
import { copyToClipboard } from "@/utils/copy-to-clipboard";
import { formatTime } from "@/utils/format-time";
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
        router.push("/?error=destroyed");
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
        const newTime = prev - 1;

        if (newTime <= 0) {
          clearInterval(interval);
          router.push("/?error=destroyed");
          return 0;
        }
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
      <header className="border-b border-surface-1 p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-surface-0">
        {/* Left: Room ID + Timer - Stack on mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-subtext-0 uppercase font-mono">ROOM ID</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-subtext-0 font-mono truncate text-sm ">
                {roomId}
              </span>
              <button
                className="text-[11px] sm:text-[12px] bg-surface-2 rounded py-0.5 px-1.5 sm:px-2 text-subtext-0 hover:bg-surface-1 hover:text-subtext-0/50 transitions cursor-pointer flex items-center gap-1 font-mono shrink-0"
                onClick={onCopyClick}
              >
                Copy
              </button>
            </div>
          </div>
          
          <div className="flex flex-col items-end sm:items-center min-w-0">
            <span className="text-xs text-subtext-0 uppercase font-mono">Self Destruct</span>
            <span
              className={`text-sm font-bold flex items-center gap-2 font-mono truncate
                ${timeRemaining !== null && timeRemaining < 60 ? "text-red-500" : "text-amber-500"}
              `}
            >
              {timeRemaining !== null ? formatTime(timeRemaining) : "--:--"}
            </span>
          </div>
        </div>
      
        {/* Right: Destroy Button - Full width on mobile */}
        <div className="flex justify-end sm:justify-center">
          <button
            className="w-full sm:w-auto text-xs sm:text-sm bg-crust uppercase px-3 py-1.5 rounded text-foreground hover:bg-mantle font-bold transition-all group flex items-center justify-center gap-2 disabled:opacity-50 font-mono disabled:cursor-not-allowed cursor-pointer flex-1 sm:flex-none max-w-40"
            onClick={() => destroyRoom()}
          >
            <span className="animate-pulse size-2 rounded-full bg-red-500" />
            Destroy Now
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-mantle">
        {messages?.messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-surface-2 text-sm font-mono">No messages yet</p>
          </div>
        )}

        {messages?.messages.map((msg) => {
          const isOwnMessage = msg.sender === username;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} w-full`}
            >
              <div
                className={`max-w-[80%] flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
              >
                <div
                  className={`flex items-baseline gap-3 mb-1 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                >
                  <span
                    className={`text-xs font-bold font-mono ${
                      isOwnMessage ? "text-overlay-2" : "text-foreground"
                    }`}
                  >
                    {isOwnMessage ? "YOU" : msg.sender}
                  </span>
                  <span className="text-[10px] text-overlay-1 font-mono">
                    {format(msg.timestamp, "HH:mm")}
                  </span>
                </div>
                <div
                  className={`group p-3 rounded-2xl max-w-md leading-relaxed wrap-break-word shadow-lg ${
                    isOwnMessage
                      ? "bg-surface-1 text-foreground rounded-br-sm"
                      : "bg-surface-0 text-foreground rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-subtext-0 bg-surface-0 shrink-0">
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 animate-pulse text-surface-2 font-mono">
              #
            </span>
            <input
              className="w-full bg-base border border-surface-2 focus:border-overlay-0 focus:outline-none transitions text-foreground py-3 pl-10 pr-4 text-sm font-mono placeholder:text-overlay-1"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              ref={inputRef}
              autoFocus
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputValue.trim()) {
                  sendMessage({ text: inputValue });
                  inputRef.current?.focus();
                }
              }}
            />
          </div>
          <button
            className="text-base bg-overlay-2 hover:bg-overlay-1 px-6 font-bold rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transitions font-mono min-w-16"
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
