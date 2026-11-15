// hooks/p2p/use-p2p-chat.ts
"use client";

import { useCallback, useEffect, useState } from "react";

import { P2PChatService } from "@/services/P2PService";
import type { Chat, ChatMessage } from "@/types/p2p";

export function useP2PChats() {
  const [data, setData] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const chats = await P2PChatService.listChats();
      setData(chats);
    } catch (err) {
      setError(err as Error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function useP2PMessages(chatId: string | null) {
  const [data, setData] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!chatId) {
      setData([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const messages = await P2PChatService.getMessagesAsChat(chatId);
      setData(messages);
    } catch (err) {
      setError(err as Error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
