// src/lib/dentalDemoConfig.ts
import { DemoConfig, ParameterLocation, SelectedTool } from "@/lib/types";

function getSystemPrompt() {
  const now = new Date().toLocaleString("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return `
Olá! Eu sou a Stella, sua assistente virtual para agendamentos odontológicos.

Posso te ajudar a marcar, alterar ou cancelar uma consulta.

Os seguintes serviços estão disponíveis:
• Limpeza dental  
• Clareamento  
• Tratamento de cárie  
• Consulta ortodôntica  
• Atendimento de emergência

Horário de funcionamento:  
Segunda a sexta: 9h às 18h  
Sábado: 10h às 14h  
Domingo: fechado

Data e hora atual: ${now}

Como posso te ajudar?
  `.trim();
}

const selectedTools: SelectedTool[] = [
  {
    temporaryTool: {
      modelToolName: "bookAppointment",
      description:
        "Agenda uma nova consulta odontológica. Deve ser chamado após o paciente confirmar o serviço, data e horário.",
      dynamicParameters: [
        {
          name: "appointmentData",
          location: ParameterLocation.BODY,
          schema: {
            type: "object",
            properties: {
              patientName: {
                type: "string",
                description: "Nome completo do paciente.",
              },
              contact: {
                type: "string",
                description: "Telefone ou e-mail para confirmação.",
              },
              serviceType: {
                type: "string",
                description: "Tipo de serviço odontológico desejado.",
              },
              appointmentDate: {
                type: "string",
                description: "Data e horário desejados no formato ISO 8601.",
              },
              dentist: {
                type: "string",
                description: "Dentista preferido (opcional).",
              },
              notes: {
                type: "string",
                description: "Observações ou solicitações especiais.",
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
        "Altera uma consulta existente. Deve ser chamado quando houver mudanças no serviço, data ou horário.",
      dynamicParameters: [
        {
          name: "updateData",
          location: ParameterLocation.BODY,
          schema: {
            type: "object",
            properties: {
              appointmentId: {
                type: "string",
                description: "ID da consulta existente.",
              },
              newDate: {
                type: "string",
                description: "Nova data e horário (formato ISO 8601).",
              },
              newService: {
                type: "string",
                description: "Novo tipo de serviço.",
              },
              notes: {
                type: "string",
                description: "Observações atualizadas.",
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
  {
    temporaryTool: {
      modelToolName: "cancelAppointment",
      description: "Cancela uma consulta existente com base no ID.",
      dynamicParameters: [
        {
          name: "cancelData",
          location: ParameterLocation.BODY,
          schema: {
            type: "object",
            properties: {
              appointmentId: {
                type: "string",
                description: "ID da consulta a ser cancelada.",
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
  title: "Você é Stella, uma assistente de agendamento simpática",
  overview:
    "Este agente ajuda pacientes a agendar, alterar ou cancelar consultas odontológicas por voz, com um fluxo de conversa realista.",
  callConfig: {
    systemPrompt: getSystemPrompt(),
    model: "fixie-ai/ultravox",
    languageHint: "pt-BR",
    voice: "Keren-Brazilian-Portuguese",
    temperature: 0.3,
    maxDuration: "300",
    selectedTools,
  },
};
