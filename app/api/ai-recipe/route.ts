import { NextResponse } from "next/server";

const MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2";
const HF_ENDPOINT = `https://api-inference.huggingface.co/models/${MODEL_ID}`;
const REQUEST_TIMEOUT_MS = 30000;
const MAX_RETRIES = 3;

type AiRecipeRequestBody = {
  ingredients?: unknown;
  mealType?: unknown;
  maxMinutes?: unknown;
};

const ALLOWED_MEAL_TYPES = new Set(["בוקר", "צהריים", "ערב", "קינוח"]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeIngredients(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((value) => String(value).trim())
    .filter(Boolean)
    .map((value) => value.replace(/\s+/g, " "));
}

function normalizeMealType(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const mealType = raw.trim();
  if (!mealType) return undefined;
  if (!ALLOWED_MEAL_TYPES.has(mealType)) return undefined;
  return mealType;
}

function normalizeMaxMinutes(raw: unknown): number | undefined {
  if (raw === null || raw === undefined || raw === "") return undefined;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return undefined;
  if (parsed < 5 || parsed > 180) return undefined;
  return Math.round(parsed);
}

function buildPrompt(ingredients: string[], mealType?: string, maxMinutes?: number): string {
  const systemInstruction = [
    "You are a professional chef.",
    "Only generate realistic recipes using the provided ingredients.",
    "You may add only basic pantry items: salt, pepper, oil, water.",
    "Quantities must be reasonable.",
    "Cooking steps must be logical and sequential.",
    "Do not invent unavailable ingredients.",
    "Respond in Hebrew only."
  ].join(" ");

  const userInstructionLines = [
    "צרי מתכון בעברית לפי המצרכים הבאים בלבד:",
    ingredients.map((item) => `- ${item}`).join("\n"),
    mealType ? `סוג הארוחה המבוקש: ${mealType}` : "סוג הארוחה המבוקש: לבחירתך",
    maxMinutes ? `זמן הכנה מקסימלי רצוי: ${maxMinutes} דקות` : "זמן הכנה מקסימלי רצוי: לא צוין",
    "",
    "השתמשי רק במצרכים שסופקו + פריטי מזווה בסיסיים בלבד (מלח, פלפל, שמן, מים).",
    "אל תוסיפי רכיבים אחרים.",
    "",
    "החזירי את התשובה בדיוק בפורמט הזה:",
    "שם המתכון:",
    "זמן הכנה:",
    "רמת קושי:",
    "",
    "רשימת מצרכים עם כמויות:",
    "- ...",
    "",
    "אופן ההכנה:",
    "1.",
    "2.",
    "3.",
    "",
    "טיפים (אופציונלי):"
  ];

  return `<s>[INST] ${systemInstruction}\n\n${userInstructionLines.join("\n")} [/INST]`;
}

function extractGeneratedText(payload: unknown): string {
  if (!payload) return "";

  if (Array.isArray(payload)) {
    for (const item of payload) {
      if (item && typeof item === "object" && "generated_text" in item) {
        const text = String((item as { generated_text?: unknown }).generated_text ?? "").trim();
        if (text) return text;
      }
    }
  }

  if (typeof payload === "object" && payload !== null) {
    if ("generated_text" in payload) {
      return String((payload as { generated_text?: unknown }).generated_text ?? "").trim();
    }
  }

  return "";
}

function normalizeModelOutput(rawText: string): string {
  let text = rawText.trim();
  text = text.replace(/```(?:text)?/gi, "").replace(/```/g, "").trim();

  const startIndex = text.indexOf("שם המתכון:");
  if (startIndex > 0) {
    text = text.slice(startIndex).trim();
  }

  return text;
}

async function requestWithRetry(prompt: string, apiKey: string): Promise<Response> {
  let lastResponse: Response | null = null;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(HF_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            temperature: 0.5,
            max_new_tokens: 800,
            return_full_text: false
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 503 && attempt < MAX_RETRIES) {
        await sleep(1200 * attempt);
        continue;
      }

      lastResponse = response;
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("timeout");
      }

      if (attempt < MAX_RETRIES) {
        await sleep(900 * attempt);
        continue;
      }
    }
  }

  if (lastResponse) return lastResponse;
  throw lastError instanceof Error ? lastError : new Error("hf_request_failed");
}

export async function POST(request: Request) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "מפתח API לא הוגדר בשרת."
      },
      { status: 500 }
    );
  }

  let body: AiRecipeRequestBody;
  try {
    body = (await request.json()) as AiRecipeRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "גוף הבקשה אינו תקין."
      },
      { status: 400 }
    );
  }

  const ingredients = normalizeIngredients(body.ingredients);
  const mealType = normalizeMealType(body.mealType);
  const maxMinutes = normalizeMaxMinutes(body.maxMinutes);

  if (ingredients.length < 2) {
    return NextResponse.json(
      {
        success: false,
        error: "צריך להזין לפחות שני מצרכים."
      },
      { status: 400 }
    );
  }

  if (ingredients.length > 15) {
    return NextResponse.json(
      {
        success: false,
        error: "אפשר להזין עד 15 מצרכים."
      },
      { status: 400 }
    );
  }

  const totalTextLength = ingredients.join(", ").length;
  if (totalTextLength > 350) {
    return NextResponse.json(
      {
        success: false,
        error: "רשימת המצרכים ארוכה מדי."
      },
      { status: 400 }
    );
  }

  const prompt = buildPrompt(ingredients, mealType, maxMinutes);

  try {
    const response = await requestWithRetry(prompt, apiKey);

    if (response.status === 503) {
      return NextResponse.json(
        {
          success: false,
          error: "המודל מתעורר כרגע, נסי שוב בעוד רגע."
        },
        { status: 503 }
      );
    }

    if (!response.ok) {
      const rawError = await response.text();
      return NextResponse.json(
        {
          success: false,
          error: "קרתה שגיאה ביצירת המתכון.",
          details: rawError.slice(0, 300)
        },
        { status: 502 }
      );
    }

    const payload = (await response.json()) as unknown;
    const generatedText = extractGeneratedText(payload);
    const normalizedText = normalizeModelOutput(generatedText);

    if (!normalizedText) {
      return NextResponse.json(
        {
          success: false,
          error: "לא התקבלה תשובה מהמודל. נסי שוב."
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      recipe: normalizedText
    });
  } catch (error) {
    if (error instanceof Error && error.message === "timeout") {
      return NextResponse.json(
        {
          success: false,
          error: "הבקשה למודל לקחה יותר מדי זמן. נסי שוב."
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "שגיאת שרת בעת יצירת מתכון."
      },
      { status: 500 }
    );
  }
}
