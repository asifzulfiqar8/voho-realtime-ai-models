// src/lib/dentalDemoConfig.ts
import { DemoConfig, ParameterLocation, SelectedTool } from "@/lib/types";

function getSystemPrompt() {
  const now = new Date().toLocaleString("de-DE", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return `
Hallo! Ich bin Stella, deine Sprachassistentin für Zahnarzttermine.

Ich kann dir helfen, einen Termin zu buchen, zu ändern oder zu stornieren.

Folgende Leistungen sind verfügbar:
• Zahnreinigung
• Zahnaufhellung
• Kariesbehandlung
• Kieferorthopädische Beratung
• Notfallbehandlung

Unsere Öffnungszeiten:
Montag bis Freitag: 9:00 bis 18:00 Uhr  
Samstag: 10:00 bis 14:00 Uhr  
Sonntag: geschlossen

Aktuelle Zeit: ${now}

Womit kann ich dir helfen?
  `.trim();
}

const selectedTools: SelectedTool[] = [
  {
    temporaryTool: {
      modelToolName: "bookAppointment",
      description:
        "Buche einen neuen Zahnarzttermin. Wird aufgerufen, wenn Patient Datum, Uhrzeit und Leistung bestätigt.",
      dynamicParameters: [
        {
          name: "appointmentData",
          location: ParameterLocation.BODY,
          schema: {
            type: "object",
            properties: {
              patientName: {
                type: "string",
                description: "Vollständiger Name des Patienten.",
              },
              contact: {
                type: "string",
                description: "Telefon oder E-Mail zur Bestätigung.",
              },
              serviceType: {
                type: "string",
                description: "Eine der angebotenen Leistungen.",
              },
              appointmentDate: {
                type: "string",
                description:
                  "ISO 8601-Datum und -Uhrzeit des gewünschten Termins.",
              },
              dentist: {
                type: "string",
                description: "Bevorzugter Zahnarzt (optional).",
              },
              notes: {
                type: "string",
                description: "Besondere Wünsche oder Hinweise.",
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
        "Ändere einen bestehenden Termin. Wird aufgerufen bei Änderungen an Leistung, Datum oder Uhrzeit.",
      dynamicParameters: [
        {
          name: "updateData",
          location: ParameterLocation.BODY,
          schema: {
            type: "object",
            properties: {
              appointmentId: {
                type: "string",
                description: "ID des bestehenden Termins.",
              },
              newDate: {
                type: "string",
                description: "Neues ISO-Datum/Uhrzeit.",
              },
              newService: { type: "string", description: "Neue Leistungsart." },
              notes: { type: "string", description: "Aktualisierte Hinweise." },
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
      description: "Storniere einen bestehenden Termin anhand der ID.",
      dynamicParameters: [
        {
          name: "cancelData",
          location: ParameterLocation.BODY,
          schema: {
            type: "object",
            properties: {
              appointmentId: {
                type: "string",
                description: "ID des zu stornierenden Termins.",
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
  title: "Du bist Stella, eine freundliche Terminassistentin",
  overview:
    "Dieser Agent hilft Patienten dabei, Zahnarzttermine per Sprache zu buchen, zu ändern oder zu stornieren.",
  callConfig: {
    systemPrompt: getSystemPrompt(),
    model: "fixie-ai/ultravox",
    languageHint: "de-DE",
    voice: "Ben-German",
    temperature: 0.3,
    maxDuration: "300",
    selectedTools,
  },
};
