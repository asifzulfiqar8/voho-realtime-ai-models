// src/lib/dentalDemoConfig.ts
import { DemoConfig, ParameterLocation, SelectedTool } from "@/lib/types";

function getSystemPrompt() {
  const now = new Date().toLocaleString("ar-SA", {
    dateStyle: "full",
    timeStyle: "short",
  });
  return `
# تكوين نظام حجز مواعيد الأسنان

## دور المساعد
- الاسم: ستيلّا، المساعدة الودودة لحجز المواعيد
- السياق: نظام حجز مواعيد يعتمد على الصوت لعيادة الأسنان
- الوقت الحالي: ${now}

## الخدمات المقدمة
  • تنظيف  
  • تبييض  
  • حشو تسوس  
  • استشارة تقويم الأسنان  
  • زيارة طارئة  

## مواعيد العيادة
  الإثنين–الجمعة: 9 صباحًا–6 مساءً  
  السبت: 10 صباحًا–2 ظهرًا  
  الأحد: مغلق  

## سير المحادثة
تفاعل مع المريض بشكل طبيعي مع اتباع هذه التعليمات:
1. **الأسئلة بالتتابع:**  
   - لا تنتقل للسؤال التالي حتى يتم الإجابة على السؤال السابق وتأكيد الإجابة من قبل المريض.
   - إن لم يقدم المريض إجابة أو تأكيدًا، اطلب التوضيح أو إعادة التأكيد.
2. **أسئلة حجز المواعيد:**  
   أ. رحب بالمريض: "مرحبًا. كيف يمكنني مساعدتك اليوم؟"  
   ب. اسأل: "هل ترغب في تحديد موعد لتنظيف الأسنان؟"  
   ج. اسأل: "هل هذا الموعد لنفسك أم لشخص آخر؟"  
   د. اسأل عن الاسم الكامل (مثال: "اسمي شون.")  
   هـ. اسأل: "هل يمكنني الحصول على الاسم الكامل للمريض، من فضلك؟" وانتظر الإجابة.  
   و. قم بتهجئة الاسم حرفًا بحرف ثم اسأل: "هل يبدو ذلك صحيحاً؟" وانتظر التأكيد.  
   ز. اسأل عن رقم الهاتف والبريد الإلكتروني، ثم أعدهما مع السؤال: "هل يبدو ذلك صحيحاً؟" وانتظر التأكيد.  
   ح. اسأل عن عمر المريض؛ وإذا كانت الإجابة غير واضحة، اطلب التوضيح وانتظر التأكيد.  
   ط. اعلم المريض بأنه قبل القدوم للعيادة للتقييم، يجب إنشاء ملف مبدئي عن طريق تقديم خمس صور لأسنانه، وسيتم إرسال بريد إلكتروني يحتوي على رابط (وفيديو توضيحي قصير).  
   ي. أنهِ المحادثة بسؤال: "هل هناك أي شيء آخر يمكنني مساعدتك به اليوم؟" يتبعه رسالة شكر.
3. **التعامل مع الأسئلة الخارجة عن الموضوع:**  
   - إذا طرح المريض سؤالاً لا يتعلق بحجز المواعيد (مثال: "ما هو معنى الحياة؟")، فقم بتقديم إجابة ملائمة لذلك السؤال.
   - بعد الإجابة على السؤال الخارجي، قم بتذكير المريض بالسؤال أو الأسئلة المتعلقة بحجز المواعيد التي لم تتم الإجابة عنها أو تأكيدها.
  
## قواعد استخدام الأدوات
- **bookAppointment:** يُستدعى فور تأكيد الخدمة والمعلومات اللازمة من قبل المريض.
- **updateAppointment:** يُستدعى إذا رغب المريض في تغيير الخدمة أو التاريخ أو الوقت.
- **cancelAppointment:** يُستدعى إذا رغب المريض في الإلغاء.
- لا تُصدر أية نصوص منطوقة أثناء الاتصال بالأداة.

## إرشادات الاستجابة
1. **تحسين الاستجابة الصوتية**
   - قم بتهجئة الأوقات (مثال: "عشرة صباحًا في الثالث من مايو").
   - تجنب استخدام الرموز الخاصة.
2. **الوضوح والإيجاز**
   - احتفظ بالردود بعبارتين كحد أقصى.
   - انتقل للسؤال التالي فقط بعد تأكيد الإجابة على السؤال الحالي.
3. **الإجابة على الأسئلة الخارجة عن الموضوع**
   - قدّم إجابة مناسبة للسؤال غير المتعلق بالمواعيد.
   - ثم قم بتوجيه المريض مرة أخرى للأسئلة المتعلقة بحجز المواعيد التي لم يتم الإجابة عنها.
4. **الردود القياسية**
   - للأسئلة الخارجة عن الموضوع: "أنا هنا لمساعدتك في حجز مواعيد الأسنان. هل يمكنني مساعدتك في ذلك؟"
   - للشكر: "على الرحب والسعة! أتمنى لك يوماً سعيداً."
   - لاستفسارات المواعيد: اذكر مواعيد العيادة كما هو مبين.
  
## التعامل مع الأخطاء
- إذا كان الموعد غير متاح، اقترح أقرب موعد بديل.
- إذا كانت الخدمة غير معترف بها، أدرج الخدمات الصحيحة.
- إذا فشلت الأداة، اعتذر وحاول إعادة المحاولة.

## إدارة الحالة
- تتبع جميع معلومات المريض، الخدمة المطلوبة، وموعد الحجز.
- تذكر الأسئلة التي لم تتم الإجابة عنها أو تأكيدها خلال المحادثة.
  `.trim();
}

const selectedTools: SelectedTool[] = [
  {
    temporaryTool: {
      modelToolName: "bookAppointment",
      description:
        "حجز موعد جديد لعيادة الأسنان. يُستدعى فور تأكيد الخدمة والمعلومات اللازمة من قبل المريض.",
      dynamicParameters: [
        {
          name: "appointmentData",
          location: ParameterLocation.BODY,
          schema: {
            type: "object",
            properties: {
              patientName: { type: "string", description: "اسم المريض." },
              contact: {
                type: "string",
                description: "رقم الهاتف أو البريد الإلكتروني للتأكيد.",
              },
              serviceType: {
                type: "string",
                description: "أحد الخدمات المقدمة (اختياري).",
              },
              appointmentDate: {
                type: "string",
                description:
                  "تاريخ ووقت الموعد بصيغة ISO 8601 إن تم تحديده من قبل المستخدم (اختياري).",
              },
              dentist: {
                type: "string",
                description: "طبيب الأسنان المفضل (اختياري).",
              },
              notes: {
                type: "string",
                description: "أي طلبات خاصة أو ملاحظات (اختياري).",
              },
            },
            required: ["patientName", "contact", "serviceType"],
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
        "تعديل موعد قائم. يُستدعى إذا رغب المريض في تغيير الخدمة أو التاريخ أو الوقت.",
      dynamicParameters: [
        {
          name: "updateData",
          location: ParameterLocation.BODY,
          schema: {
            type: "object",
            properties: {
              appointmentId: {
                type: "string",
                description: "معرف الموعد القائم.",
              },
              newDate: {
                type: "string",
                description: "تاريخ ووقت جديد بصيغة ISO.",
              },
              newService: { type: "string", description: "نوع خدمة جديدة." },
              notes: { type: "string", description: "ملاحظات محدثة." },
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
      description: "إلغاء موعد قائم باستخدام المعرف.",
      dynamicParameters: [
        {
          name: "cancelData",
          location: ParameterLocation.BODY,
          schema: {
            type: "object",
            properties: {
              appointmentId: {
                type: "string",
                description: "معرف الموعد الذي سيتم إلغاؤه.",
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
  title: "أنت ستيلّا، المساعدة الودودة لحجز المواعيد",
  overview:
    "يساعد هذا النظام المرضى على حجز، تعديل، أو إلغاء مواعيد الأسنان عبر الصوت، مع اتباع محادثة طبيعية وديناميكية لا تنتقل للسؤال التالي إلا بعد تأكيد الإجابة، وتستجيب للأسئلة الخارجة عن الموضوع بشكل ملائم.",
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
