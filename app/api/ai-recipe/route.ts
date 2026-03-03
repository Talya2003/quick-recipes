import { NextResponse } from "next/server";

const LEGACY_MODELS = ["mistralai/Mistral-7B-Instruct-v0.2", "google/gemma-7b-it"] as const;
const ROUTER_MODELS = [
  "Qwen/Qwen2.5-7B-Instruct",
  "meta-llama/Llama-3.1-8B-Instruct",
  "mistralai/Mistral-7B-Instruct-v0.2",
  "google/gemma-7b-it"
] as const;

const LEGACY_BASE_URL = "https://api-inference.huggingface.co/models";
const ROUTER_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 30000;
const MAX_RETRIES = 3;
const ALLOWED_MEAL_TYPES = new Set(["בוקר", "צהריים", "ערב", "קינוח"]);
const PANTRY_ITEMS = ["מלח", "פלפל", "שמן", "מים"];

type AiRecipeRequestBody = {
  ingredients?: unknown;
  mealType?: unknown;
  maxMinutes?: unknown;
};

type GenerationResult =
  | { ok: true; recipe: string; model: string; source: "legacy" | "router" }
  | { ok: false; status: number; error: string; details?: string };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
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

function buildUserPrompt(ingredients: string[], mealType?: string, maxMinutes?: number): string {
  return [
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
  ].join("\n");
}

function getSystemPrompt(): string {
  return [
    "You are a professional chef.",
    "Only generate realistic recipes using the provided ingredients.",
    "You may add only basic pantry items: salt, pepper, oil, water.",
    "Quantities must be reasonable.",
    "Cooking steps must be logical and sequential.",
    "Do not invent unavailable ingredients.",
    "Respond in Hebrew only."
  ].join(" ");
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

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractIngredientLines(recipe: string): string[] {
  const lines = recipe.split("\n").map((line) => line.trim());
  const start = lines.findIndex((line) => line.startsWith("רשימת מצרכים עם כמויות:"));
  if (start < 0) return [];

  const result: string[] = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;
    if (line.startsWith("אופן ההכנה:")) break;

    const cleaned = line.replace(/^[-*•]\s*/, "").trim();
    if (cleaned) result.push(cleaned);
  }
  return result;
}

function isRecipeGrounded(recipe: string, ingredients: string[]): boolean {
  const ingredientLines = extractIngredientLines(recipe);
  if (ingredientLines.length === 0) return false;

  const normalizedUserIngredients = ingredients.map((item) => normalizeText(item)).filter(Boolean);
  const allowedTokens = new Set<string>();

  for (const item of [...normalizedUserIngredients, ...PANTRY_ITEMS.map((p) => normalizeText(p))]) {
    allowedTokens.add(item);
    for (const token of item.split(" ")) {
      if (token.length >= 2) allowedTokens.add(token);
    }
  }

  const usedUserIngredients = new Set<number>();

  for (const line of ingredientLines) {
    const normalizedLine = normalizeText(line);
    if (!normalizedLine) return false;

    const hasAllowedToken = Array.from(allowedTokens).some((token) => token && normalizedLine.includes(token));
    if (!hasAllowedToken) {
      return false;
    }

    normalizedUserIngredients.forEach((ingredient, index) => {
      if (!usedUserIngredients.has(index) && ingredient && normalizedLine.includes(ingredient)) {
        usedUserIngredients.add(index);
      }
    });
  }

  return usedUserIngredients.size >= Math.min(2, normalizedUserIngredients.length);
}

function getErrorText(raw: string): string {
  if (!raw.trim()) return "";
  try {
    const parsed = JSON.parse(raw) as { error?: unknown; message?: unknown };
    if (typeof parsed.error === "string") return parsed.error;
    if (typeof parsed.message === "string") return parsed.message;
  } catch {
    return raw.trim();
  }
  return raw.trim();
}

function parseLegacyRecipe(payload: unknown): string {
  if (!payload) return "";
  if (Array.isArray(payload)) {
    for (const item of payload) {
      if (item && typeof item === "object" && "generated_text" in item) {
        const text = String((item as { generated_text?: unknown }).generated_text ?? "").trim();
        if (text) return normalizeModelOutput(text);
      }
    }
  }
  if (typeof payload === "object" && payload !== null && "generated_text" in payload) {
    return normalizeModelOutput(String((payload as { generated_text?: unknown }).generated_text ?? ""));
  }
  return "";
}

function parseRouterRecipe(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const choices = (payload as { choices?: Array<{ message?: { content?: unknown } }> }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return "";
  const content = choices[0]?.message?.content;
  return normalizeModelOutput(String(content ?? "").trim());
}

async function generateViaLegacy(
  userPrompt: string,
  apiKey: string,
  ingredients: string[]
): Promise<GenerationResult | null> {
  const legacyPrompt = `<s>[INST] ${getSystemPrompt()}\n\n${userPrompt} [/INST]`;
  let fallbackRecipe: { recipe: string; model: string } | null = null;

  for (const model of LEGACY_MODELS) {
    const endpoint = `${LEGACY_BASE_URL}/${model}`;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      let response: Response;
      try {
        response = await fetchWithTimeout(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: legacyPrompt,
            parameters: {
              temperature: 0.5,
              max_new_tokens: 800,
              return_full_text: false
            }
          })
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return { ok: false, status: 504, error: "הבקשה למודל לקחה יותר מדי זמן." };
        }
        if (attempt < MAX_RETRIES) {
          await sleep(700 * attempt);
          continue;
        }
        return { ok: false, status: 500, error: "שגיאת תקשורת מול Hugging Face." };
      }

      if (response.ok) {
        const payload = (await response.json()) as unknown;
        const recipe = parseLegacyRecipe(payload);
        if (recipe && isRecipeGrounded(recipe, ingredients)) {
          return { ok: true, recipe, model, source: "legacy" };
        }
        if (recipe && !fallbackRecipe) {
          fallbackRecipe = { recipe, model };
        }
        continue;
      }

      const rawError = await response.text();
      const details = getErrorText(rawError);

      if (response.status === 503 && attempt < MAX_RETRIES) {
        await sleep(1200 * attempt);
        continue;
      }

      if (response.status === 410 || response.status === 404) {
        // The legacy endpoint/model is unavailable, continue to next model or router fallback.
        break;
      }

      if (response.status === 401 || response.status === 403) {
        return { ok: false, status: response.status, error: "מפתח Hugging Face לא תקין.", details };
      }

      if (response.status === 429) {
        return { ok: false, status: 429, error: "חרגת ממכסת השימוש של Hugging Face.", details };
      }

      if (response.status >= 500 && response.status <= 599 && attempt < MAX_RETRIES) {
        await sleep(900 * attempt);
        continue;
      }

      return { ok: false, status: 502, error: "שגיאה בקריאה למודל הישן.", details };
    }
  }

  if (fallbackRecipe) {
    return { ok: true, recipe: fallbackRecipe.recipe, model: fallbackRecipe.model, source: "legacy" };
  }

  return null;
}

async function generateViaRouter(
  userPrompt: string,
  apiKey: string,
  ingredients: string[]
): Promise<GenerationResult> {
  const systemPrompt = getSystemPrompt();
  let fallbackRecipe: { recipe: string; model: string } | null = null;

  for (const model of ROUTER_MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      let response: Response;
      try {
        response = await fetchWithTimeout(ROUTER_CHAT_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.5,
            max_tokens: 800
          })
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return { ok: false, status: 504, error: "הבקשה למודל לקחה יותר מדי זמן." };
        }
        if (attempt < MAX_RETRIES) {
          await sleep(700 * attempt);
          continue;
        }
        return { ok: false, status: 500, error: "שגיאת תקשורת מול Router של Hugging Face." };
      }

      if (response.ok) {
        const payload = (await response.json()) as unknown;
        const recipe = parseRouterRecipe(payload);
        if (recipe && isRecipeGrounded(recipe, ingredients)) {
          return { ok: true, recipe, model, source: "router" };
        }
        if (recipe && !fallbackRecipe) {
          fallbackRecipe = { recipe, model };
        }
        if (attempt < MAX_RETRIES) {
          await sleep(500 * attempt);
          continue;
        }
        break;
      }

      const rawError = await response.text();
      const details = getErrorText(rawError);

      if (response.status === 503 && attempt < MAX_RETRIES) {
        await sleep(1200 * attempt);
        continue;
      }

      if (response.status === 400 || response.status === 404 || response.status === 410) {
        // model is unavailable on this router/provider combination.
        break;
      }

      if (response.status === 401 || response.status === 403) {
        return { ok: false, status: response.status, error: "מפתח Hugging Face לא תקין.", details };
      }

      if (response.status === 429) {
        return { ok: false, status: 429, error: "חרגת ממכסת השימוש של Hugging Face.", details };
      }

      if (response.status >= 500 && response.status <= 599 && attempt < MAX_RETRIES) {
        await sleep(900 * attempt);
        continue;
      }

      if (attempt === MAX_RETRIES) {
        break;
      }
    }
  }

  if (fallbackRecipe) {
    return { ok: true, recipe: fallbackRecipe.recipe, model: fallbackRecipe.model, source: "router" };
  }

  return {
    ok: false,
    status: 502,
    error: "לא הצלחנו ליצור מתכון כרגע. נסי שוב בעוד רגע."
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "מפתח API לא הוגדר בשרת." }, { status: 500 });
  }

  let body: AiRecipeRequestBody;
  try {
    body = (await request.json()) as AiRecipeRequestBody;
  } catch {
    return NextResponse.json({ success: false, error: "גוף הבקשה אינו תקין." }, { status: 400 });
  }

  const ingredients = normalizeIngredients(body.ingredients);
  const mealType = normalizeMealType(body.mealType);
  const maxMinutes = normalizeMaxMinutes(body.maxMinutes);

  if (ingredients.length < 2) {
    return NextResponse.json({ success: false, error: "צריך להזין לפחות שני מצרכים." }, { status: 400 });
  }

  if (ingredients.length > 15) {
    return NextResponse.json({ success: false, error: "אפשר להזין עד 15 מצרכים." }, { status: 400 });
  }

  if (ingredients.join(", ").length > 350) {
    return NextResponse.json({ success: false, error: "רשימת המצרכים ארוכה מדי." }, { status: 400 });
  }

  const userPrompt = buildUserPrompt(ingredients, mealType, maxMinutes);

  const legacyResult = await generateViaLegacy(userPrompt, apiKey, ingredients);
  if (legacyResult?.ok) {
    return NextResponse.json({
      success: true,
      recipe: legacyResult.recipe,
      model: legacyResult.model,
      source: legacyResult.source
    });
  }

  if (legacyResult && !legacyResult.ok && [401, 403, 429, 504].includes(legacyResult.status)) {
    return NextResponse.json(
      { success: false, error: legacyResult.error, details: legacyResult.details },
      { status: legacyResult.status }
    );
  }

  const routerResult = await generateViaRouter(userPrompt, apiKey, ingredients);
  if (routerResult.ok) {
    return NextResponse.json({
      success: true,
      recipe: routerResult.recipe,
      model: routerResult.model,
      source: routerResult.source
    });
  }

  return NextResponse.json(
    { success: false, error: routerResult.error, details: routerResult.details },
    { status: routerResult.status }
  );
}
