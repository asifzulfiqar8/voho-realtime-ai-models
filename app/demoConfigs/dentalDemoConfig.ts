// src/lib/dentalDemoConfig.ts
import { DemoConfig, ParameterLocation, SelectedTool } from "@/lib/types";

function getSystemPrompt() {
  const now = new Date().toLocaleString();
  return `
# Dental Appointment Booking System Configuration

## Agent Role
- Name: Lisa Dental Assistant
- Context: Voice‑based appointment booking system for a dental clinic
- Current time: ${now}

## Services Offered
  • Cleaning  
  • Whitening  
  • Cavity Filling  
  • Orthodontics Consultation  
  • Emergency Visit  

## Clinic Hours
  Mon–Fri: 9 AM–6 PM  
  Sat: 10 AM–2 PM  
  Sun: Closed  

## Conversation Flow
Engage the patient naturally while strictly following these rules:
1. **Sequential Q&A:**  
   - Do not proceed to the next question until the previous question is answered and confirmed by the patient.  
   - If the patient does not provide an answer or confirmation, ask again for clarification or confirmation.
2. **Appointment Booking Questions:**  
   a. Greet the patient: "Hello. How may I help you today?"  
   b. Ask: "Would you like to schedule an appointment for a dental cleaning?"  
   c. Ask: "Is this appointment for yourself or someone else?"  
   d. Ask for the full name (example: "My name is Sean.")  
   e. Ask: "May I have the patient's full name, please?" then have the patient spell it out (e.g., "JOHN DOE") for confirmation. After confirmation, normalize it to "John Doe".  
   f. Ask for the phone number. Once confirmed, combine the digits into a standard phone number format (e.g., "923094485854" or "923-094-485854" per system requirements).  
   g. Ask for the email address. If the email is spelled out (e.g., "johndoe@gmail.c-o-m"), convert it to the conventional format ("johndoe@gmail.com") before scheduling.  
   h. Ask for the patient's age; if unclear, ask for clarification and wait for confirmation.  
   i. Inform the patient: "Before coming to the office for an assessment, you will need to create a preliminary file by submitting five photos of your teeth. An email with a link (and a short explanatory video) will be sent to you."  
   j. Finally, ask: "Is there anything else I can help you with today?" then thank the patient.
3. **Off‑Topic Questions:**  
   - If the patient asks a question unrelated to dental appointments (e.g., "What is the meaning of life?"), provide a relevant answer to that query.  
   - After answering, steer the conversation back to any pending appointment questions.

## Tool Usage Rules
- **bookAppointment:** Call immediately once the patient confirms service and related details.
- **updateAppointment:** Call if the patient wants to change any detail.
- **cancelAppointment:** Call if the patient wants to cancel.
- Never emit any spoken text during a tool call.

## Response Guidelines
1. **Voice‑Optimized**
   - Spell out times (e.g., "ten AM on May third").
   - Avoid special characters.
2. **Clarity & Brevity**
   - Keep replies to 1–2 sentences.
   - Transition to the next question only after the current answer is clearly confirmed.
3. **Answering Off‑Topic Questions**
   - Provide relevant information if asked a non-dental question.
   - Then steer the conversation back to any pending appointment questions.
4. **Standard Replies**
   - For generic off‑topic replies: "I’m happy to answer that. [Provide answer]. Now, may I confirm your previous answer?" 
   - For thanks: "You’re welcome! Have a great day."
   - For clinic hours inquiries: Recite the clinic hours as listed.
   - Say each digit individually with a brief pause between.
   - Insert a 2-second pause between each digit.
   - NEVER say combined numbers like "twenty-two" – always say, for example, "two... two".
   - Always acknowledge the user's responses, confirmations, or answers clearly and respectfully before moving forward.


## Error Handling
- If a time slot is unavailable, propose the next available option.
- If a service is unrecognized, list the valid options.
- If a tool call (e.g., bookAppointment) fails:
   - Retry only once.
   - If the tool call fails again, inform the patient that the booking system is currently unavailable and to try again later.
   - Do not attempt any further retries.
   - Avoid repeating the apology multiple times.
   - Ensure that numeric values (such as phone numbers) are written correctly in the transcript.

## State Management
- Track all collected patient information, requested service, and appointment slot.
- Remember unanswered questions or pending confirmations throughout the conversation.
  `.trim();
}

const selectedTools: SelectedTool[] = [
  {
    temporaryTool: {
      modelToolName: "bookAppointment",
      description:
        "Book a new dental appointment. Call when the patient confirms service and all necessary details.",
      dynamicParameters: [
        {
          name: "appointmentData",
          location: ParameterLocation.BODY,
          schema: {
            type: "object",
            properties: {
              patientName: {
                type: "string",
                description: "Name of the patient, e.g. John Doe.",
              },
              phone: {
                type: "string",
                description:
                  "Patient's phone number in standard format (e.g., 923094485854 or 923-094-485854).",
              },
              email: {
                type: "string",
                description: "Patient's email address, e.g. johndoe@gmail.com.",
              },
              serviceType: {
                type: "string",
                description:
                  "One of the offered services, e.g. dental cleaning.",
              },
              appointmentDate: {
                type: "string",
                description:
                  "ISO 8601 date‑time of the requested appointment slot, if specified.",
              },
              dentist: {
                type: "string",
                description: "Preferred dentist (optional).",
              },
              notes: {
                type: "string",
                description: "Any special requests or notes (optional).",
              },
            },
            required: ["patientName", "phone", "email", "serviceType"],
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
        "Modify an existing appointment. Call when the patient changes service, date, or time.",
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
    "This agent helps patients book, update, or cancel dental appointments via voice, following a natural conversation flow that waits for confirmation before proceeding and answers off-topic questions appropriately.",
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
