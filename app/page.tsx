"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";

type Message = {
  id: string;
  content: string;
  role: "user" | "openai" | "gemini";
  timestamp: Date;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationCount, setConversationCount] = useState(50);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInput.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: userInput,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      // Start the conversation between AIs
      await simulateAIConversation(userMessage.content, conversationCount);
    } catch (error) {
      console.error("Error in AI conversation:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "An error occurred during the AI conversation.",
          role: "openai",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAIConversation = async (
    initialPrompt: string,
    turns: number
  ) => {
    let currentPrompt = initialPrompt;
    let currentSpeaker: "openai" | "gemini" = "openai"; // Start with OpenAI

    for (let i = 0; i < turns; i++) {
      // Call the appropriate API based on current speaker
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentPrompt,
          service: currentSpeaker,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.response;

      // Add AI message to the conversation
      const aiMessage: Message = {
        id: Date.now().toString() + i,
        content: aiResponse,
        role: currentSpeaker,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Switch speakers and use the last response as the next prompt
      currentPrompt = aiResponse;
      currentSpeaker = currentSpeaker === "openai" ? "gemini" : "openai";

      // Add a small delay to make the conversation feel more natural
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            AI Conversation Simulator
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground">Exchanges:</div>
            <Input
              type="number"
              min="1"
              max="100"
              value={conversationCount}
              onChange={(e) =>
                setConversationCount(
                  Math.min(
                    100,
                    Math.max(1, Number.parseInt(e.target.value) || 1)
                  )
                )
              }
              className="w-16 h-8"
            />
          </div>
        </CardHeader>

        <CardContent className="h-[60vh] overflow-y-auto space-y-4 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Start a conversation</h3>
                <p className="text-sm text-muted-foreground">
                  Enter a prompt below to start a conversation between OpenAI
                  and Gemini
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.role === "openai"
                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                      : "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
                  }`}
                >
                  <div className="mb-1 text-xs font-semibold">
                    {message.role === "user"
                      ? "You"
                      : message.role === "openai"
                      ? "OpenAI"
                      : "Gemini"}
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="mt-1 text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                <div className="animate-pulse">Thinking...</div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your prompt to start the AI conversation..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Starting..." : "Start Conversation"}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
