// src/lib/dentalDemoConfig.ts
import { DemoConfig, ParameterLocation, SelectedTool } from "@/lib/types";

function getSystemPrompt() {
  const now = new Date().toLocaleString();
  return `
# Dental Appointment Booking System Configuration

## Agent Role
- Name: Stella Dental Assistant
- Context: Voice‑based appointment booking system for a dental clinic
- Current time: ${now}

## Services Offered
  • Cleaning  
  • Whitening  
  • Cavity Filling  
  • Orthodontics Consultation  
  • Emergency Visit  

## Clinic Hours
  Mon–Fri: 9 AM–6 PM  
  Sat: 10 AM–2 PM  
  Sun: Closed  

## Conversation Flow
1. Greet patient  
2. Ask for patient name & contact info  
3. Ask which service and preferred date/time  
4. Check availability -> Call “bookAppointment” tool  
5. Confirm booked slot  
6. Offer to modify or cancel  

## Tool Usage Rules
- **bookAppointment**: call immediately once patient confirms date, time & service.  
- **updateAppointment**: call if patient wants to change any detail.  
- **cancelAppointment**: call if patient wants to cancel.  
- Never emit any spoken text during a tool call.

## Response Guidelines
1. **Voice‑Optimized**  
   - Spell out times (“ten AM on May third”)  
   - No special characters  
2. **Clarity & Brevity**  
   - Keep replies to 1–2 sentences  
   - Use clarifying questions for ambiguity  
3. **Cross‑Sell**  
   - After booking cleaning → suggest whitening  
4. **Standard Replies**  
   - Off‑topic: “I’m here to help you book dental visits.”  
   - Thanks: “You’re welcome!”  
   - Hours inquiries: recite clinic hours  

## Error Handling
- **Unavailable slot** → propose next available  
- **Unrecognized service** → list valid options  
- **Tool failure** → apologize & retry  

## State Management
- Track patient info, requested service, and slot  
- Remember previous clarifications
`.trim();
}

const selectedTools: SelectedTool[] = [
  {
    temporaryTool: {
      modelToolName: "bookAppointment",
      description:
        "Book a new dental appointment. Call when patient confirms date, time & service.",
      dynamicParameters: [
        {
          name: "appointmentData",
          location: ParameterLocation.BODY,
          schema: {
            type: "object",
            properties: {
              patientName: {
                type: "string",
                description: "Full name of the patient.",
              },
              contact: {
                type: "string",
                description: "Phone or email for confirmation.",
              },
              serviceType: {
                type: "string",
                description: "One of the offered services.",
              },
              appointmentDate: {
                type: "string",
                description:
                  "ISO 8601 date‑time of the requested appointment slot.",
              },
              dentist: {
                type: "string",
                description: "Preferred dentist (optional).",
              },
              notes: {
                type: "string",
                description: "Any special requests or notes.",
              },
            },
            required: [
              "patientName",
              "contact",
              "serviceType",
              "appointmentDate",
            ],
          },
          required: true,
        },
      ],
      client: {},
    },
  },
  {
    temporaryTool: {
      modelToolName: "updateAppointment",
      description:
        "Modify an existing appointment. Call when patient changes service, date or time.",
      dynamicParameters: [
        {
          name: "updateData",
          location: ParameterLocation.BODY,
          schema: {
            type: "object",
            properties: {
              appointmentId: {
                type: "string",
                description: "ID of the existing appointment.",
              },
              newDate: { type: "string", description: "New ISO date‑time." },
              newService: { type: "string", description: "New service type." },
              notes: { type: "string", description: "Updated notes." },
            },
            required: ["appointmentId"],
          },
          required: true,
        },
      ],
      client: {},
    },
  },
  {
    temporaryTool: {
      modelToolName: "cancelAppointment",
      description: "Cancel an existing appointment by ID.",
      dynamicParameters: [
        {
          name: "cancelData",
          location: ParameterLocation.BODY,
          schema: {
            type: "object",
            properties: {
              appointmentId: {
                type: "string",
                description: "ID of the appointment to cancel.",
              },
            },
            required: ["appointmentId"],
          },
          required: true,
        },
      ],
      client: {},
    },
  },
];

export const demoConfig: DemoConfig = {
  title: "You are Stella, a friendly appointment assistant",
  overview:
    "This agent helps patients book, update, or cancel dental appointments via voice.",
  callConfig: {
    systemPrompt: getSystemPrompt(),
    model: "fixie-ai/ultravox",
    languageHint: "en-US",
    voice: "Deobra",
    temperature: 0.3,
    maxDuration: "300",
    selectedTools,
  },
};
