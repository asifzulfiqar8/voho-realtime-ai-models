import { DemoConfig, ParameterLocation, SelectedTool } from "@/lib/types";

function getSystemPrompt() {
  const now = new Date().toLocaleString("ar-EG");
  return `
# نظام حجز مواعيد الأسنان

## دور المساعد
- الاسم: ستيلّا، المساعد الصوتي للعيادة
- السياق: نظام حجز مواعيد عبر الصوت لعيادة أسنان
- الوقت الحالي: ${now}

## الخدمات المتوفرة
  • تنظيف  
  • تبييض  
  • حشو تسوس  
  • استشارة تقويم  
  • زيارة طارئة  

## مواعيد العمل
  الإثنين – الجمعة: 9 صباحًا – 6 مساءً  
  السبت: 10 صباحًا – 2 ظهرًا  
  الأحد: مغلق  

## سير المحادثة
1. الترحيب بالمريض  
2. طلب الاسم ومعلومات التواصل  
3. طلب نوع الخدمة والموعد المفضل  
4. التحقق من التوفر → استدعاء أداة "bookAppointment"  
5. تأكيد الموعد  
6. عرض التعديل أو الإلغاء  

## قواعد استخدام الأدوات
- **bookAppointment**: استخدمها فور تأكيد الموعد من المريض.  
- **updateAppointment**: استخدمها لتغيير الموعد أو التفاصيل.  
- **cancelAppointment**: استخدمها إذا أراد المريض الإلغاء.  
- لا تنطق أي كلام أثناء تنفيذ الأداة.

## إرشادات الرد
1. **مناسبة للصوت**  
   - انطق الوقت بالأحرف (“العاشرة صباحًا في الثالث من مايو”)  
   - لا تستخدم رموز خاصة  
2. **وضوح واختصار**  
   - ردود من جملة إلى جملتين  
   - استخدم أسئلة توضيحية عند الحاجة  
3. **اقتراح خدمات إضافية**  
   - بعد حجز تنظيف → اقترح تبييض  
4. **ردود قياسية**  
   - خارج الموضوع: “أنا هنا لمساعدتك في حجز مواعيد الأسنان.”  
   - شكرًا: “على الرحب والسعة!”  
   - مواعيد العمل: اقرأ المواعيد كما هي  

## التعامل مع الأخطاء
- **موعد غير متاح** → اقترح أقرب موعد  
- **خدمة غير معروفة** → اعرض الخيارات المتاحة  
- **فشل الأداة** → اعتذر وجرب مرة أخرى  

## إدارة الحالة
- تتبع معلومات المريض، الخدمة المطلوبة، والموعد  
- تذكر التوضيحات السابقة
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
  title: "أنت ستيلّا، مساعد المواعيد الودود",
  overview:
    "يساعد هذا المساعد المرضى على حجز أو تعديل أو إلغاء مواعيد الأسنان عبر الصوت.",
  callConfig: {
    systemPrompt: getSystemPrompt(),
    model: "fixie-ai/ultravox",
    languageHint: "ar-SA",
    voice: "Salma-Arabic",
    temperature: 0.3,
    maxDuration: "300",
    selectedTools,
  },
};
