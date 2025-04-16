"use client";

import { demoConfig } from "@/app/demoConfigs/dentalDemoConfig";
import { endCall, startCall } from "@/lib/callFunctions";
import { mapUltravoxStatusToLabel } from "@/lib/mapUltravoxStatusToLabel";
import avatarImg from "@/public/new-stella.png";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { IoCallOutline } from "react-icons/io5";
import { MdMicNone } from "react-icons/md";

interface Message {
  speaker: "agent" | "user";
  text: string;
  timestamp: string;
}

type Transcript = {
  speaker: "agent" | "user";
  text: string;
};

type ProgressStep = {
  key: "connected" | "verifying" | "checking" | "confirm";
  label: string;
  done: boolean;
  timestamp: string;
};

const initialProgress: ProgressStep[] = [
  { key: "connected", label: "Call Connected", done: false, timestamp: "" },
  { key: "verifying", label: "Verifying Details", done: false, timestamp: "" },
  {
    key: "checking",
    label: "Checking Availability",
    done: false,
    timestamp: "",
  },
  { key: "confirm", label: "Confirm Appointment", done: false, timestamp: "" },
];

export default function StellaPage() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [bookingPage, setBookingPage] = useState("virtual-assistant");
  const [agentStatus, setAgentStatus] = useState("Ready to connect");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [debugMessages, setDebugMessages] = useState<any[]>([]);
  // const [isTyping, setIsTyping] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [callProgress, setCallProgress] =
    useState<ProgressStep[]>(initialProgress);
  const [activeStep, setActiveStep] = useState<ProgressStep["key"] | null>(
    null
  );

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [conversation]);

  // Map the incoming status string to our step keys
  const mapStatusToKey = (status?: string): ProgressStep["key"] | null => {
    const s = (status ?? "").toLowerCase();
    if (s.includes("connected")) return "connected";
    if (s.includes("verifying")) return "verifying";
    if (s.includes("checking")) return "checking";
    if (s.includes("confirm")) return "confirm";
    if (s.includes("end")) return "confirm";
    return null;
  };

  const handleStatusChange = useCallback((status?: string) => {
    const s = status ?? "Ready to connect";
    const label = mapUltravoxStatusToLabel(s?.toString());
    setAgentStatus(label);

    const key = mapStatusToKey(status);
    if (key) {
      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setCallProgress((prev) =>
        prev.map((step) =>
          step.key === key ? { ...step, done: true, timestamp: time } : step
        )
      );
      setActiveStep(key);
    }
  }, []);

  const typeText = async (fullText: string) => {
    // setIsTyping(true);

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

    // setIsTyping(false);
  };

  const handleTranscriptChange = useCallback(
    (transcripts: Transcript[] | undefined) => {
      if (transcripts && transcripts.length > 0) {
        const latest = transcripts[transcripts.length - 1];
        const speaker = latest.speaker?.toLowerCase().trim() as
          | "agent"
          | "user";

        // Allow only user messages (agent responses come from LLM debug already)
        if (speaker !== "user") return;

        const timestamp = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const newMessage: Message = {
          speaker,
          text: latest.text,
          timestamp,
        };

        setConversation((prev) => [...prev, newMessage]);
      }
    },
    []
  );

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
    setCallProgress(initialProgress);
    setActiveStep(null);
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
      handleStatusChange("Call Connected");
      setTimeout(() => {
        handleStatusChange("Verifying");
      }, 2000);
    } catch (err) {
      console.error("Failed to start call");
    }
  };

  const onEnd = async () => {
    setConversation([]);
    try {
      await endCall();
      setIsCallActive(false);
      setAgentStatus("Disconnected");
      handleStatusChange("Confirm Appointment");
    } catch (err) {
      console.error("Failed to end call");
    }
  };

  return (
    <div className="bg-[#f6f8fc] w-full min-h-screen">
      {bookingPage === "virtual-assistant" && (
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 py-8 px-4 bg-[#f6f8fc]">
          {/* Left Column */}
          <div className="lg:w-1/2 flex flex-col items-center justify-between">
            <div className="relative size-[250px] mb-4">
              <Image
                src={avatarImg}
                alt="Stella"
                fill
                className={`object-cover rounded-full border-[6px]  ${
                  isCallActive ? "border-[#42a5f5]" : "border-[#5c6bc0]"
                }`}
                style={{
                  boxShadow: isCallActive ? "0 0 20px rgba(52,199,89,.7)" : "",
                }}
              />
            </div>

            <div className="flex gap-4 my-6">
              {!isCallActive ? (
                <button
                  onClick={onStart}
                  disabled={isCallActive}
                  className={`size-[60px] bg-[#42a5f5] hover:opacity-80 transition-all duration-150 rounded-full grid place-items-center`}
                >
                  <IoCallOutline className="text-[28px] text-white" />
                </button>
              ) : (
                <>
                  <button
                    onClick={onEnd}
                    disabled={!isCallActive}
                    className={`size-[60px] bg-[#ef5350] hover:opacity-80 transition-all duration-150 rounded-full grid place-items-center`}
                  >
                    <IoCallOutline className="text-[28px] text-white" />
                  </button>
                  <button
                    disabled={!isCallActive}
                    className={`size-[60px] bg-[#66bb6a] hover:opacity-80 transition-all duration-150 rounded-full grid place-items-center`}
                  >
                    <MdMicNone className="text-[28px] text-white" />
                  </button>
                  <button
                    disabled={!isCallActive}
                    className={`size-[60px] bg-[#7986cb] hover:opacity-80 transition-all duration-150 rounded-full grid place-items-center`}
                  >
                    <HiOutlineSpeakerWave className="text-[28px] text-white" />
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setBookingPage("manual-booking")}
              className="bg-white text-[#5c6bc0] border border-[#5c6bc0] rounded-full px-6 py-2 hover:bg-[#f0f2ff] transition-colors mb-6"
            >
              Switch to Manual Booking
            </button>

            <div className="bg-white rounded-xl p-4 shadow-md w-full max-w-md">
              <h3 className="text-[#5c6bc0] font-medium mb-2 text-center">
                Agent Status
              </h3>
              <div className="text-center py-2 px-4 rounded-full bg-[#e3f2fd] text-[#1976d2] animate-pulse">
                {agentStatus}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:w-1/2 flex flex-col">
            {isCallActive ? (
              <div className="bg-white rounded-xl shadow-md p-5 mb-6">
                <h2 className="text-[#5c6bc0] font-semibold mb-4">
                  Call Progress
                </h2>
                <div className="space-y-3">
                  {callProgress.map((step) => {
                    const isActive = step.key === activeStep;
                    const bgColor = step.done
                      ? "bg-[#4caf50]"
                      : isActive
                      ? "bg-[#2196f3]"
                      : "bg-[#e0e0e0]";

                    return (
                      <div key={step.key} className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${bgColor}`}
                        >
                          {(step.done || isActive) && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{step.label}</p>
                          {step.timestamp && (
                            <p className="text-sm text-gray-500">
                              {step.timestamp}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-5 mb-6 flex flex-col items-center gap-4">
                <h6 className="text-lg font-semibold text-[#5c6bc0]">
                  Information
                </h6>
                <p className="text-base text-black/70">
                  Chat with Stella, your smart virtual assistant – now available
                  in English and more languages!
                </p>
                <p className="text-base font-medium text-[#5c6bc0]">
                  Click the call button to start
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md flex flex-col">
              <h2 className="text-[#5c6bc0] font-bold p-4 border-b">
                Conversation
              </h2>
              <div
                ref={transcriptRef}
                className="h-[290px] overflow-y-auto rounded p-3 space-y-3 scroll-0 flex flex-col"
              >
                {conversation.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Start a call to begin conversation
                  </p>
                )}
                {conversation.map((msg, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-3 max-w-[80%] ${
                      msg.speaker === "agent"
                        ? "bg-[#e3f2fd] text-[#1976d2]"
                        : "bg-gray-100 text-gray-900 self-end"
                    }`}
                  >
                    <div className="text-sm">{msg.text}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {msg.timestamp}
                    </div>
                  </div>
                ))}
                {/* {isTyping && (
                <div className="italic text-blue-500 animate-pulse text-sm">
                  Lisa is typing...
                </div>
              )} */}
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
      )}
      {bookingPage === "manual-booking" && (
        <div className="py-8 max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold text-[#5c6bc0] mb-6 text-center">
            Available Appointments
          </h2>
          <div className="w-full h-[700px]">
            <iframe
              src="https://cal.com/voho-ai/15min"
              width="100%"
              height="100%"
              frameBorder="0"
              allow="camera; microphone; fullscreen; speaker; display-capture"
              style={{ borderRadius: "12px" }}
            />
          </div>
          <div className="mt-5 flex justify-center">
            <button
              onClick={() => setBookingPage("virtual-assistant")}
              className="bg-[#5c6bc0] text-white rounded-full px-6 py-2 hover:bg-[#7986cb] transition-colors"
            >
              Return to Virtual Assistant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
