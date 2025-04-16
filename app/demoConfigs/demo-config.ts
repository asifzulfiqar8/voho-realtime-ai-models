import { DemoConfig, ParameterLocation, SelectedTool } from "@/lib/types";

function getSystemPrompt() {
  let sysPrompt: string;
  sysPrompt = `
  # KFC Drive-Thru Order System Configuration

  ## Agent Role
  - Name: KFC Drive-Thru Assistant
  - Context: Voice-based order taking system with TTS output
  - Current time: ${new Date()}

  ## Menu Items
    # KFC
    2 Combos (2pcs MIXED) $7
    2 Combos (2pcs DARK) $7
    POPCORN RICE BOX $6

    # DRINKS
    PEPSI $3
    MOUNTAIN DEW $3
    7UP $3
    PEPSI ZERO SUGAR $3

    # SIDES
    FRENCH FRIES $2
    DINNER ROLL $1
    COLESLAW $2

  ## Conversation Flow
  1. Greeting -> Order Taking -> Call "updateOrder" Tool -> Order Confirmation -> Payment instructions

  ## Tool Usage Rules
  - Call "updateOrder" whenever user confirms, adds, or removes items, or finalizes an order.
  - Validate menu items before calling updateOrder.

  ## Response Guidelines
  1. Voice-Optimized Format
    - Use spoken numbers
    - Avoid special characters
    - Use natural speech patterns

  2. Conversation Management
    - Keep responses short
    - Use clarifying questions for ambiguity
    - Avoid explicit endings
    - Allow casual conversation

  3. Order Processing
    - Validate items
    - Suggest sides if main combos are chosen
    - Suggest drinks if user only orders chicken

  4. Standard Responses
    - Off-topic: "Sorry, we are a KFC store."
    - Thanks: "My pleasure."
    - Menu inquiries: Provide relevant combos

  5. Order confirmation
    - Use "updateOrder" tool first
    - Confirm the order at the end

  ## Error Handling
  1. Menu Mismatches -> Suggest closest
  2. Unclear Input -> Request clarification
  3. Invalid Tool Calls -> Validate items before calling
  4. Keep a short memory of clarifications

  ## State Management
  - Track order items
  - Maintain context for combos/sides
  - Remember clarifications
  `;

  sysPrompt = sysPrompt.replace(/"/g, '"').replace(/\n/g, "\n");
  return sysPrompt;
}

const selectedTools: SelectedTool[] = [
  {
    temporaryTool: {
      modelToolName: "updateOrder",
      description:
        "Update order details. Used any time items are added or removed or when the order is finalized.",
      dynamicParameters: [
        {
          name: "orderDetailsData",
          location: ParameterLocation.BODY,
          schema: {
            description: "An array of objects containing order items.",
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Name of the item to add to the order.",
                },
                quantity: {
                  type: "number",
                  description: "Quantity of the item.",
                },
                specialInstructions: {
                  type: "string",
                  description: "Any special instructions for the item.",
                },
                price: {
                  type: "number",
                  description: "Unit price for the item.",
                },
              },
              required: ["name", "quantity", "price"],
            },
          },
          required: true,
        },
      ],
      client: {},
    },
  },
];

export const demoConfig: DemoConfig = {
  title: "KFC Drive-Thru",
  overview:
    "This agent has been prompted to facilitate orders at a fictional KFC drive-thru.",
  callConfig: {
    systemPrompt: getSystemPrompt(),
    model: "fixie-ai/ultravox-70B",
    languageHint: "en",
    selectedTools: selectedTools,
    voice: "Tanya-English",
    temperature: 0.4,
    maxDuration: "300",
    timeExceededMessage:
      "We have exceeded the maximum time limit for this call.",
  },
};

export default demoConfig;
