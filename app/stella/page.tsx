"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import avatarImg from "@/public/new-stella.png";
import { startCall, endCall, toggleMute } from "@/lib/callFunctions";
import { Role } from "ultravox-client";
import { IoCallOutline } from "react-icons/io5";
import { demoConfig } from "../dentalDemoConfig";

interface Message {
  speaker: "agent";
  text: string;
  timestamp: string;
}

export default function StellaPage() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [agentStatus, setAgentStatus] = useState("Disconnected");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [debugMessages, setDebugMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [conversation, isTyping]);

  const handleStatusChange = useCallback((status: string) => {
    setAgentStatus(status ?? "Ready to connect");
  }, []);

  const typeText = async (fullText: string) => {
    setIsTyping(true);

    // create one empty agent message
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setConversation((prev) => [
      ...prev,
      { speaker: "agent", text: "", timestamp },
    ]);

    let currentText = "";

    const words = fullText.split(" ");
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? " " : "") + words[i];

      setConversation((prev) => {
        const updated = [...prev];
        // overwrite the last message
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          text: currentText,
        };
        return updated;
      });

      await new Promise((res) => setTimeout(res, 100));
    }

    setIsTyping(false);
  };

  const handleTranscriptChange = useCallback((transcripts: any[]) => {
    if (transcripts) {
      const newMessages = transcripts.map((t) => ({
        speaker: t.speaker === "agent" ? "agent" : "user",
        text: t.text,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
      setConversation((prev) => [...prev, ...newMessages]);
    }
  }, []);

  const handleDebugMessage = useCallback((msg: any) => {
    setDebugMessages((prev) => [...prev, msg]);
    const messageText = msg?.message?.message;

    if (
      msg?.message?.type === "debug" &&
      typeof messageText === "string" &&
      messageText.startsWith("LLM response:")
    ) {
      const spokenText = messageText.replace("LLM response:", "").trim();
      typeText(spokenText);
    }
  }, []);

  const onStart = async () => {
    try {
      setConversation([]);
      await startCall(
        {
          onStatusChange: handleStatusChange,
          onTranscriptChange: handleTranscriptChange,
          onDebugMessage: handleDebugMessage,
        },
        demoConfig.callConfig,
        true
      );
      setIsCallActive(true);
    } catch (err) {
      console.error("Failed to start call:", err);
    }
  };

  const onEnd = async () => {
    try {
      await endCall();
      setIsCallActive(false);
      setAgentStatus("Disconnected");
    } catch (err) {
      console.error("Failed to end call:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 p-6">
      {/* Left Column */}
      <div className="lg:w-1/2 flex flex-col items-center rounded-md shadow">
        <div className="relative size-[250px] mb-4">
          <Image
            src={avatarImg}
            alt="Stella"
            fill
            className="object-cover rounded-full border-4 border-[#5C47E0]"
          />
        </div>

        <div className="px-4 py-2 w-full flex flex-col items-center my-5">
          <div className="font-semibold text-[#5C47E0]">Agent Status</div>
          <p className="mt-2 text-gray-200">{agentStatus}</p>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={onStart}
            disabled={isCallActive}
            className={`size-12 bg-green-600 rounded-full grid place-items-center`}
          >
            <IoCallOutline className="text-2xl text-white" />
          </button>
          <button
            onClick={onEnd}
            disabled={!isCallActive}
            className={`size-12 bg-red-600 rounded-full grid place-items-center rotate-[270deg]`}
          >
            <IoCallOutline className="text-2xl text-white" />
          </button>
        </div>
      </div>

      {/* Right Column */}
      <div className="lg:w-1/2 flex flex-col gap-5">
        <div className="bg-white rounded-md shadow-lg flex flex-col items-center p-4 gap-4">
          <h6 className="text-lg font-semibold text-[#5C47E0]">Information</h6>
          <p className="text-base text-black/70">
            Talk to Stella, the virtual assistant of Voho, in English, German &
            more.
          </p>
          <p className="text-base font-medium text-[#5b47e0b6]">
            Click the call button to start
          </p>
        </div>
        <div className="bg-white rounded-md shadow-lg flex flex-col">
          <h2 className="text-[#5C47E0] font-bold p-4">Conversation</h2>
          <div
            ref={transcriptRef}
            className="h-64 overflow-y-auto border border-gray-200 rounded p-3 space-y-3 scroll-0"
          >
            {conversation.length === 0 && (
              <p className="text-gray-500">
                Start a call to begin conversation
              </p>
            )}
            {conversation.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] p-3 rounded-md ${
                  msg.speaker === "agent"
                    ? "bg-blue-100 text-blue-800 self-start"
                    : "bg-gray-100 text-gray-900 self-end"
                }`}
              >
                <div className="text-sm">{msg.text}</div>
                <div className="text-xs text-right text-gray-500 mt-1">
                  {msg.timestamp}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="italic text-blue-500 animate-pulse text-sm">
                Stella is typing...
              </div>
            )}
          </div>
        </div>

        {/* {debugMessages.length > 0 && (
          <div className="bg-black text-white p-4 rounded-md h-32 overflow-y-auto">
            <h3 className="font-semibold mb-2">Debug</h3>
            {debugMessages.map((d, i) => (
              <pre key={i} className="text-xs">
                {JSON.stringify(d, null, 2)}
              </pre>
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
}
