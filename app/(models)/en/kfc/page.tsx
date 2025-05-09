"use client";

import { endCall, startCall } from "@/lib/callFunctions";
import { mapUltravoxStatusToLabel } from "@/lib/mapUltravoxStatusToLabel";
import { useSearchParams } from "next/navigation";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Loader from "@/app/components/global/Loader";
import {
  Role,
  Transcript,
  UltravoxExperimentalMessageEvent,
  UltravoxSessionStatus,
} from "ultravox-client";

// --- Custom Components ---
import MicToggleButton from "@/app/components/MicToggleButton";
import OrderDetails from "@/app/components/OrderDetails";

// --- Replace with your actual KFC employee image
import kfcEmployeeImg from "@/public/assets/kfc-employee.png";
import Image from "next/image";
import { IoCallOutline } from "react-icons/io5";
import demoConfig from "@/app/demoConfigs/demo-config";

//
// Define a Message type for the conversation
//
interface Message {
  speaker: "agent" | "user";
  text: string;
  timestamp: string;
}

// ----------------------------------------------------
//  Typing Effect Function for Agent Messages
// ----------------------------------------------------
const typeText = async (
  fullText: string,
  appendMessage: (msg: Message) => void,
  updateLastMessage: (text: string) => void
) => {
  const timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  // Append a new empty agent message to be updated gradually
  appendMessage({ speaker: "agent", text: "", timestamp });
  let currentText = "";
  const words = fullText.split(" ");
  for (let i = 0; i < words.length; i++) {
    currentText += (i > 0 ? " " : "") + words[i];
    updateLastMessage(currentText);
    await new Promise((res) => setTimeout(res, 100));
  }
};

// ----------------------------------------------------
//  Handle Search Params
// ----------------------------------------------------
type SearchParamsProps = {
  showMuteSpeakerButton: boolean;
  modelOverride: string | undefined;
  showDebugMessages: boolean;
  showUserTranscripts: boolean;
};

type SearchParamsHandlerProps = {
  children: (props: SearchParamsProps) => React.ReactNode;
};

function SearchParamsHandler({ children }: SearchParamsHandlerProps) {
  const searchParams = useSearchParams();

  const showMuteSpeakerButton = searchParams.get("showMuteSpeaker") === "true";
  const showDebugMessages = searchParams.get("showDebugMessages") === "true";
  const showUserTranscripts =
    searchParams.get("showUserTranscripts") === "true";

  let modelOverride: string | undefined;
  if (searchParams.get("model")) {
    modelOverride = "fixie-ai/" + searchParams.get("model");
  }

  return children({
    showMuteSpeakerButton,
    modelOverride,
    showDebugMessages,
    showUserTranscripts,
  });
}

// ----------------------------------------------------
//  Main Page Component
// ----------------------------------------------------
export default function KfcPage() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string>("off");
  // Use conversation state for messages (agent and user)
  const [conversation, setConversation] = useState<Message[]>([]);
  const [callDebugMessages, setCallDebugMessages] = useState<
    UltravoxExperimentalMessageEvent[]
  >([]);
  const [customerProfileKey, setCustomerProfileKey] = useState<string | null>(
    null
  );

  // New state: active tab for products
  const [activeTab, setActiveTab] = useState<"kfc" | "drinks" | "sides">("kfc");

  // The menu items are stored as objects in an array for each category.
  const menuItems = {
    kfc: [
      {
        name: "Combos (2pcs dark)",
        price: 7,
        image: "/assets/combos-2-pieces-dark.png",
      },
      {
        name: "Combos (2pcs mixed",
        price: 7,
        image: "/assets/combos-2-pieces-mix.png",
      },
      {
        name: "Popcorn Rice Box",
        price: 6,
        image: "/assets/popcorn-ricebox.png",
      },
      // Add more KFC items as needed
    ],
    drinks: [
      { name: "Pepsi", price: 3, image: "/assets/pepsi.png" },
      { name: "Mountain Dew", price: 3, image: "/assets/dew.png" },
      { name: "7UP", price: 3, image: "/assets/7up.png" },
      { name: "Pepsi Zero Sugar", price: 3, image: "/assets/pepsi.png" },
      // Add more drinks as needed
    ],
    sides: [
      { name: "French Fries", price: 2, image: "/assets/fries.png" },
      { name: "Dinner Roll", price: 1, image: "/assets/dinner-roll.png" },
      { name: "Coleslaw", price: 2, image: "/assets/coleslaw.png" },
      // Add more sides as needed
    ],
  };

  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Scroll conversation container to bottom on each update
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop =
        transcriptContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  // Callback for status changes
  const handleStatusChange = useCallback(
    (status: UltravoxSessionStatus | string | undefined) => {
      const label = mapUltravoxStatusToLabel(status?.toString());
      setAgentStatus(label);
    },
    []
  );

  // Append incoming user messages to conversation
  const handleTranscriptChange = useCallback(
    (transcripts: Transcript[] | undefined) => {
      if (transcripts && transcripts.length > 0) {
        // Process only user messages (agent responses come via debug)
        const userTranscripts = transcripts.filter(
          (t) => t.speaker.toLowerCase().trim() === "user"
        );
        if (userTranscripts.length > 0) {
          const timestamp = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const newMessages: Message[] = userTranscripts.map((t) => ({
            speaker: "user",
            text: t.text,
            timestamp,
          }));
          setConversation((prev) => [...prev, ...newMessages]);
        }
      }
    },
    []
  );

  // Debug message callback to process LLM responses and dispatch order updates
  const handleDebugMessage = useCallback(
    (debugMessage: UltravoxExperimentalMessageEvent) => {
      setCallDebugMessages((prev) => [...prev, debugMessage]);
      const messageText = debugMessage?.message?.message;
      if (
        debugMessage?.message?.type === "debug" &&
        typeof messageText === "string" &&
        messageText.startsWith("LLM response:")
      ) {
        let spokenText = messageText.replace("LLM response:", "").trim();
        // Look for tool call syntax
        if (spokenText.includes("Tool calls:")) {
          const toolCallMatch = spokenText.match(
            /Tool calls:\s*\[FunctionCall\([^)]*args='([^']+)'\)\]/
          );
          if (toolCallMatch) {
            const argsStr = toolCallMatch[1];
            // Dispatch an event with detail = JSON string for the order details
            window.dispatchEvent(
              new CustomEvent("orderDetailsUpdated", { detail: argsStr })
            );
          }
          // Remove the tool call substring from the spoken text
          spokenText = spokenText
            .replace(/Tool calls:\s*\[FunctionCall\([^)]*\)\]/, "")
            .trim();
        }
        // Simulate agent typing using the typeText helper function
        typeText(
          spokenText,
          (msg: Message) => setConversation((prev) => [...prev, msg]),
          (updatedText: string) =>
            setConversation((prev) => {
              const updated = [...prev];
              if (updated.length > 0) {
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  text: updatedText,
                };
              }
              return updated;
            })
        );
      }
    },
    []
  );

  // Clear stored profile data
  const clearCustomerProfile = useCallback(() => {
    setCustomerProfileKey((prev) => (prev ? `${prev}-cleared` : "cleared"));
  }, []);

  // Start call handler
  const handleStartCallButtonClick = async (
    modelOverride?: string,
    showDebugMessagesFlag?: boolean
  ) => {
    try {
      handleStatusChange("Starting call...");
      setConversation([]);
      setCallDebugMessages([]);
      clearCustomerProfile();

      // Generate a unique key for the customer profile
      const newKey = `call-${Date.now()}`;
      setCustomerProfileKey(newKey);

      const callConfig = {
        systemPrompt: demoConfig.callConfig.systemPrompt,
        model: modelOverride || demoConfig.callConfig.model,
        languageHint: demoConfig.callConfig.languageHint,
        voice: demoConfig.callConfig.voice,
        temperature: demoConfig.callConfig.temperature,
        maxDuration: demoConfig.callConfig.maxDuration,
        timeExceededMessage: demoConfig.callConfig.timeExceededMessage,
        selectedTools: demoConfig.callConfig.selectedTools,
      };

      await startCall(
        {
          onStatusChange: handleStatusChange,
          onTranscriptChange: handleTranscriptChange,
          onDebugMessage: handleDebugMessage,
        },
        callConfig,
        showDebugMessagesFlag
      );

      setIsCallActive(true);
      handleStatusChange("Call started successfully");
    } catch (error) {
      handleStatusChange(
        `Error starting call: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  // End call handler
  const handleEndCallButtonClick = async () => {
    try {
      handleStatusChange("Ending call...");
      await endCall();
      setIsCallActive(false);
      clearCustomerProfile();
      setCustomerProfileKey(null);
      handleStatusChange("Call ended successfully");
    } catch (error) {
      handleStatusChange(
        `Error ending call: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  return (
    <Suspense fallback={<Loader />}>
      <SearchParamsHandler>
        {({
          showMuteSpeakerButton,
          modelOverride,
          showDebugMessages,
          showUserTranscripts,
        }: SearchParamsProps) => (
          <div className="container mx-auto px-5 flex flex-col min-h-[calc(100vh-124px)]">
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 py-5 md:py-10">
              {/* Left Column: Dynamic Menu */}
              <div className="lg:col-span-3 bg-white text-black rounded-xl p-4 flex flex-col">
                <h2 className="text-xl font-bold mb-4 text-red-600">Menu</h2>
                {/* Tabs for product categories */}
                <div className="flex space-x-2 mb-6">
                  {Object.keys(menuItems).map((key) => (
                    <button
                      key={key}
                      onClick={() =>
                        setActiveTab(key as "kfc" | "drinks" | "sides")
                      }
                      className={`border px-3 py-1 rounded capitalize ${
                        activeTab === key
                          ? "bg-red-600 text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
                {/* Display products from the active tab */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {menuItems[activeTab].map((item, index) => (
                    <div
                      className="flex items-center justify-between gap-1 border-b"
                      key={index}
                    >
                      <Image
                        src={item.image}
                        width={100}
                        height={100}
                        alt="product image"
                        className="size-[120px] object-contain"
                      />
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm md:text-base text-black font-medium">
                          {item.name}
                        </span>
                        <span className="text-base md:text-lg text-black/80 font-bold">
                          ${item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center Column: Employee Image and Conversation Area */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center">
                <div className="relative w-[250px] h-[250px] mb-4">
                  <Image
                    src={kfcEmployeeImg}
                    alt="KFC Employee"
                    fill
                    className="object-cover rounded-full border-[6px] border-[#dc2626]"
                    style={{
                      boxShadow: isCallActive
                        ? "rgb(220 38 38) 0px 0px 50px 9px"
                        : "",
                    }}
                  />
                </div>
                {isCallActive ? (
                  <div className="w-full">
                    <div className="flex justify-center gap-4">
                      <MicToggleButton role={Role.USER} />
                      {showMuteSpeakerButton && (
                        <MicToggleButton role={Role.AGENT} />
                      )}
                      <button
                        type="button"
                        onClick={handleEndCallButtonClick}
                        disabled={!isCallActive}
                        className="size-[60px] bg-red-600 hover:opacity-80 transition-all duration-150 rounded-full grid place-items-center"
                      >
                        <IoCallOutline className="text-[28px] text-white -rotate-90" />
                      </button>
                    </div>
                    <div
                      ref={transcriptContainerRef}
                      className="h-[200px] overflow-y-auto bg-white text-black p-4 rounded mt-4"
                    >
                      {conversation.length === 0 && (
                        <p className="text-center text-gray-500">
                          Conversation will appear here...
                        </p>
                      )}
                      {conversation.map((msg, index) => (
                        <div key={index} className="mb-2">
                          <div className="text-gray-600 text-sm">
                            {msg.speaker === "agent" ? "KFC Agent" : "You"}
                          </div>
                          <div>{msg.text}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {msg.timestamp}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-lg lg:mb-8">
                    <button
                      onClick={() =>
                        handleStartCallButtonClick(
                          modelOverride,
                          showDebugMessages
                        )
                      }
                      className="size-[60px] mx-auto bg-green-600 hover:opacity-80 transition-all duration-150 rounded-full grid place-items-center"
                    >
                      <IoCallOutline className="text-[28px] text-white" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Order Details */}
              <div className="lg:col-span-3 bg-white text-black rounded-xl p-4 flex flex-col">
                <h2 className="text-xl font-bold mb-4 text-red-600">
                  Current Order
                </h2>
                {/* OrderDetails uses its own event listener to update the order */}
                <OrderDetails />
              </div>
            </main>
          </div>
        )}
      </SearchParamsHandler>
    </Suspense>
  );
}
