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
const MAX_REFINEMENT_ATTEMPTS = 1;
const MIN_QUALITY_SCORE = 8;
const ALLOWED_MEAL_TYPES = new Set(["בוקר", "צהריים", "ערב", "קינוח"]);
const PANTRY_ITEMS = ["מלח", "פלפל", "שמן", "מים"];

type AiRecipeRequestBody = {
  ingredients?: unknown;
  mealType?: unknown;
  maxMinutes?: unknown;
};

type GenerationResult =
  | {
      ok: true;
      recipe: string;
      model: string;
      source: "legacy" | "router" | "fallback";
      qualityScore: number;
      grounded: boolean;
      fluent: boolean;
    }
  | { ok: false; status: number; error: string; details?: string };

type RecipeCandidate = {
  recipe: string;
  model: string;
  score: number;
  grounded: boolean;
  fluent: boolean;
  qualityScore: number;
};

type ParsedRecipe = {
  title: string;
  prepTime: string;
  difficulty: string;
  ingredients: string[];
  steps: string[];
};

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
    "צרי מתכון בעברית תקינה ורציפה בלבד לפי המצרכים הבאים בלבד:",
    ingredients.map((item) => `- ${item}`).join("\n"),
    mealType ? `סוג הארוחה המבוקש: ${mealType}` : "סוג הארוחה המבוקש: לבחירתך",
    maxMinutes ? `זמן הכנה מקסימלי רצוי: ${maxMinutes} דקות` : "זמן הכנה מקסימלי רצוי: לא צוין",
    "",
    "השתמשי רק במצרכים שסופקו + פריטי מזווה בסיסיים בלבד (מלח, פלפל, שמן, מים).",
    "אסור להשתמש באותיות לטיניות בכלל.",
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
    "Write fluent, natural Hebrew only.",
    "Never use Latin letters, transliteration, or mixed scripts.",
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
  text = text.replace(/\r/g, "");
  text = text.replace(/\s*(זמן הכנה:)/g, "\n$1");
  text = text.replace(/\s*(רמת קושי:)/g, "\n$1");
  text = text.replace(/\s*(רשימת מצרכים עם כמויות:)/g, "\n\n$1");
  text = text.replace(/\s*(אופן ההכנה:)/g, "\n\n$1");
  text = text.replace(/\s*(טיפים(?:\s*\(אופציונלי\))?:)/g, "\n\n$1");
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  const startIndex = text.indexOf("שם המתכון:");
  if (startIndex > 0) {
    text = text.slice(startIndex).trim();
  }

  return text;
}

function cleanListLine(line: string): string {
  return line.replace(/^[-*•]\s*/, "").replace(/^\d+[\).\s-]*/, "").trim();
}

function isSectionHeader(line: string): boolean {
  return (
    line.startsWith("שם המתכון:") ||
    line.startsWith("זמן הכנה:") ||
    line.startsWith("רמת קושי:") ||
    line.startsWith("רשימת מצרכים") ||
    line.startsWith("מצרכים:") ||
    line.startsWith("אופן ההכנה:") ||
    line.startsWith("אופן הכנה:") ||
    line.startsWith("טיפים")
  );
}

function parseRecipeStructure(recipe: string): ParsedRecipe {
  const lines = normalizeModelOutput(recipe)
    .split("\n")
    .map((line) => line.trim());

  let title = "";
  let prepTime = "";
  let difficulty = "";
  const ingredients: string[] = [];
  const steps: string[] = [];
  let section: "ingredients" | "steps" | null = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;

    if (line.startsWith("שם המתכון:")) {
      const value = line.replace("שם המתכון:", "").trim();
      if (value) {
        title = value;
      } else if (lines[i + 1] && !isSectionHeader(lines[i + 1])) {
        title = lines[i + 1].trim();
      }
      section = null;
      continue;
    }

    if (line.startsWith("זמן הכנה:")) {
      const value = line.replace("זמן הכנה:", "").trim();
      if (value) {
        prepTime = value;
      } else if (lines[i + 1] && !isSectionHeader(lines[i + 1])) {
        prepTime = lines[i + 1].trim();
      }
      section = null;
      continue;
    }

    if (line.startsWith("רמת קושי:")) {
      const value = line.replace("רמת קושי:", "").trim();
      if (value) {
        difficulty = value;
      } else if (lines[i + 1] && !isSectionHeader(lines[i + 1])) {
        difficulty = lines[i + 1].trim();
      }
      section = null;
      continue;
    }

    if (line.startsWith("רשימת מצרכים") || line.startsWith("מצרכים:")) {
      section = "ingredients";
      continue;
    }

    if (line.startsWith("אופן ההכנה:") || line.startsWith("אופן הכנה:")) {
      section = "steps";
      continue;
    }

    if (line.startsWith("טיפים")) {
      section = null;
      continue;
    }

    if (section === "ingredients") {
      const cleaned = cleanListLine(line);
      if (cleaned) ingredients.push(cleaned);
      continue;
    }

    if (section === "steps") {
      const cleaned = cleanListLine(line);
      if (cleaned) steps.push(cleaned);
    }
  }

  return { title, prepTime, difficulty, ingredients, steps };
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
  const start = lines.findIndex(
    (line) =>
      line.startsWith("רשימת מצרכים עם כמויות:") ||
      line.startsWith("רשימת מצרכים:") ||
      line.startsWith("מצרכים:")
  );
  if (start < 0) return [];

  const result: string[] = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;
    if (line.startsWith("אופן ההכנה:") || line.startsWith("אופן הכנה:")) break;

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

function isHebrewFluent(recipe: string): boolean {
  const hebrewChars = (recipe.match(/[\u0590-\u05FF]/g) ?? []).length;
  const latinWords = recipe.match(/\b[A-Za-z][A-Za-z'’-]*\b/g) ?? [];
  const mixedScriptTokens =
    recipe.match(/(?=.*[A-Za-z])(?=.*[\u0590-\u05FF])[A-Za-z\u0590-\u05FF][A-Za-z\u0590-\u05FF'’-]*/g) ?? [];

  if (hebrewChars < 40) return false;
  if (latinWords.length > 0) return false;
  if (mixedScriptTokens.length > 0) return false;
  return true;
}

function hasStepVerb(step: string): boolean {
  return /(חותכ|קוצצ|מערבב|מחממ|מוסיפ|מטגנ|מבש|צול|קול|טורפ|מגיש|מתבל|מניח|אופ)/.test(step);
}

function scoreRecipeQuality(recipe: string, ingredients: string[]): number {
  const parsed = parseRecipeStructure(recipe);
  let score = 0;

  if (parsed.title.length >= 2) score += 1;
  if (parsed.prepTime.length >= 2) score += 1;
  if (parsed.difficulty.length >= 2) score += 1;

  if (parsed.ingredients.length >= Math.min(ingredients.length, 2)) score += 1;
  if (parsed.steps.length >= 3 && parsed.steps.length <= 6) score += 2;

  const validSteps = parsed.steps.filter((step) => step.length >= 10 && step.length <= 220 && hasStepVerb(step));
  if (validSteps.length >= 3) score += 2;

  return score;
}

function inferAmountForIngredient(ingredient: string): string {
  if (/\d/.test(ingredient)) return ingredient;
  const normalized = normalizeText(ingredient);

  if (normalized.includes("ביצ")) return `${ingredient} - 2 יחידות`;
  if (normalized.includes("לחם") || normalized.includes("פיתה") || normalized.includes("טורט")) {
    return `${ingredient} - 2 יחידות`;
  }
  if (normalized.includes("עגבנ") || normalized.includes("מלפפון")) return `${ingredient} - 1 יחידה`;
  if (normalized.includes("גבינ") || normalized.includes("קוטג") || normalized.includes("יוגורט")) {
    return `${ingredient} - 100 גרם`;
  }

  return `${ingredient} - 1/2 כוס`;
}

function buildFallbackRecipe(ingredients: string[], mealType?: string, maxMinutes?: number): string {
  const first = ingredients[0] ?? "מרכיב ראשי";
  const second = ingredients[1] ?? "מרכיב נוסף";
  const title = `מחבת מהירה עם ${first} ו${second}`;
  const prepMinutes = Math.min(Math.max(maxMinutes ?? 12, 7), 25);
  const difficulty = "קל";

  const ingredientLines = ingredients.map((item) => `- ${inferAmountForIngredient(item)}`);
  ingredientLines.push("- שמן - 1 כף");
  ingredientLines.push("- מלח - 1/4 כפית");
  ingredientLines.push("- פלפל - 1/4 כפית");
  ingredientLines.push("- מים - 2 כפות לפי הצורך");

  const mealHint = mealType ? `מתאים בעיקר ל${mealType}.` : "מתאים לארוחה מהירה.";

  const steps = [
    `מכינים את כל המצרכים מראש. אם צריך, חותכים את ${first} ואת ${second} לחתיכות קטנות.`,
    "מחממים מחבת עם שמן על אש בינונית.",
    `מוסיפים למחבת את ${first} ואת ${second}, מערבבים ומבשלים 3-4 דקות.`,
    "מוסיפים את שאר המצרכים, מתבלים במלח ופלפל ומבשלים עוד 2-3 דקות תוך ערבוב.",
    "אם התערובת יבשה, מוסיפים מעט מים, מבשלים דקה נוספת ומגישים מיד."
  ];

  const tips = [
    "טועמים בסוף ומתקנים תיבול לפי הטעם.",
    mealHint
  ];

  return [
    `שם המתכון: ${title}`,
    `זמן הכנה: ${prepMinutes} דקות`,
    `רמת קושי: ${difficulty}`,
    "",
    "רשימת מצרכים עם כמויות:",
    ...ingredientLines,
    "",
    "אופן ההכנה:",
    ...steps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "טיפים (אופציונלי):",
    ...tips.map((tip) => `- ${tip}`)
  ].join("\n");
}

function isCandidateAcceptable(candidate: RecipeCandidate): boolean {
  return candidate.grounded && candidate.fluent && candidate.qualityScore >= 6;
}

function buildCandidate(recipe: string, model: string, ingredients: string[]): RecipeCandidate {
  const normalizedRecipe = normalizeModelOutput(recipe);
  const grounded = isRecipeGrounded(normalizedRecipe, ingredients);
  const fluent = isHebrewFluent(normalizedRecipe);
  const qualityScore = scoreRecipeQuality(normalizedRecipe, ingredients);
  const score = (grounded ? 100 : 0) + (fluent ? 20 : 0) + qualityScore;

  return { recipe: normalizedRecipe, model, score, grounded, fluent, qualityScore };
}

async function refineRecipeCandidate(
  rawRecipe: string,
  model: string,
  apiKey: string,
  ingredients: string[]
): Promise<string | null> {
  const refinementPrompt = [
    "תקני את המתכון הבא לעברית תקינה ורציפה בלבד.",
    "אסור אותיות לטיניות בכלל.",
    "אסור להוסיף מרכיבים חדשים.",
    "מותר להשתמש רק במרכיבים הבאים + מזווה בסיסי (מלח, פלפל, שמן, מים):",
    ingredients.map((item) => `- ${item}`).join("\n"),
    "",
    "החזירי בדיוק בפורמט:",
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
    "טיפים (אופציונלי):",
    "",
    "מתכון גולמי לתיקון:",
    rawRecipe
  ].join("\n");

  for (let attempt = 1; attempt <= MAX_REFINEMENT_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetchWithTimeout(ROUTER_CHAT_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: getSystemPrompt() },
            { role: "user", content: refinementPrompt }
          ],
          temperature: 0.2,
          max_tokens: 850
        })
      });

      if (!response.ok) {
        if (response.status >= 500 && response.status <= 599 && attempt < MAX_REFINEMENT_ATTEMPTS) {
          await sleep(600);
          continue;
        }
        return null;
      }

      const payload = (await response.json()) as unknown;
      const recipe = parseRouterRecipe(payload);
      if (recipe) return recipe;
      return null;
    } catch {
      if (attempt < MAX_REFINEMENT_ATTEMPTS) {
        await sleep(500);
        continue;
      }
      return null;
    }
  }

  return null;
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
  let bestCandidate: RecipeCandidate | null = null;

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
        if (recipe) {
          let candidate = buildCandidate(recipe, model, ingredients);

          if (candidate.score < 3) {
            const refined = await refineRecipeCandidate(candidate.recipe, "Qwen/Qwen2.5-7B-Instruct", apiKey, ingredients);
            if (refined) {
              const refinedCandidate = buildCandidate(refined, model, ingredients);
              if (refinedCandidate.score > candidate.score) {
                candidate = refinedCandidate;
              }
            }
          }

          if (isCandidateAcceptable(candidate)) {
            return {
              ok: true,
              recipe: candidate.recipe,
              model,
              source: "legacy",
              qualityScore: candidate.qualityScore,
              grounded: candidate.grounded,
              fluent: candidate.fluent
            };
          }
          if (!bestCandidate || candidate.score > bestCandidate.score) {
            bestCandidate = candidate;
          }
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

  if (bestCandidate) {
    return {
      ok: true,
      recipe: bestCandidate.recipe,
      model: bestCandidate.model,
      source: "legacy",
      qualityScore: bestCandidate.qualityScore,
      grounded: bestCandidate.grounded,
      fluent: bestCandidate.fluent
    };
  }

  return null;
}

async function generateViaRouter(
  userPrompt: string,
  apiKey: string,
  ingredients: string[]
): Promise<GenerationResult> {
  const systemPrompt = getSystemPrompt();
  let bestCandidate: RecipeCandidate | null = null;

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
        if (recipe) {
          let candidate = buildCandidate(recipe, model, ingredients);

          if (candidate.score < 3) {
            const refined = await refineRecipeCandidate(candidate.recipe, model, apiKey, ingredients);
            if (refined) {
              const refinedCandidate = buildCandidate(refined, model, ingredients);
              if (refinedCandidate.score > candidate.score) {
                candidate = refinedCandidate;
              }
            }
          }

          if (isCandidateAcceptable(candidate)) {
            return {
              ok: true,
              recipe: candidate.recipe,
              model,
              source: "router",
              qualityScore: candidate.qualityScore,
              grounded: candidate.grounded,
              fluent: candidate.fluent
            };
          }
          if (!bestCandidate || candidate.score > bestCandidate.score) {
            bestCandidate = candidate;
          }
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

  if (bestCandidate) {
    return {
      ok: true,
      recipe: bestCandidate.recipe,
      model: bestCandidate.model,
      source: "router",
      qualityScore: bestCandidate.qualityScore,
      grounded: bestCandidate.grounded,
      fluent: bestCandidate.fluent
    };
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
  let bestGenerated: Extract<GenerationResult, { ok: true }> | null = null;

  const legacyResult = await generateViaLegacy(userPrompt, apiKey, ingredients);
  if (legacyResult?.ok) {
    bestGenerated = legacyResult;
    if (legacyResult.grounded && legacyResult.fluent && legacyResult.qualityScore >= MIN_QUALITY_SCORE) {
      return NextResponse.json({
        success: true,
        recipe: legacyResult.recipe,
        model: legacyResult.model,
        source: legacyResult.source
      });
    }
  }

  if (legacyResult && !legacyResult.ok && [401, 403, 429, 504].includes(legacyResult.status)) {
    return NextResponse.json(
      { success: false, error: legacyResult.error, details: legacyResult.details },
      { status: legacyResult.status }
    );
  }

  const routerResult = await generateViaRouter(userPrompt, apiKey, ingredients);
  if (routerResult.ok) {
    if (!bestGenerated || routerResult.qualityScore > bestGenerated.qualityScore) {
      bestGenerated = routerResult;
    }
    if (routerResult.grounded && routerResult.fluent && routerResult.qualityScore >= MIN_QUALITY_SCORE) {
      return NextResponse.json({
        success: true,
        recipe: routerResult.recipe,
        model: routerResult.model,
        source: routerResult.source
      });
    }
  }

  if (
    bestGenerated &&
    bestGenerated.grounded &&
    bestGenerated.fluent &&
    bestGenerated.qualityScore >= Math.max(6, MIN_QUALITY_SCORE - 1)
  ) {
    return NextResponse.json({
      success: true,
      recipe: bestGenerated.recipe,
      model: bestGenerated.model,
      source: bestGenerated.source
    });
  }

  if (bestGenerated) {
    const fallbackRecipe = buildFallbackRecipe(ingredients, mealType, maxMinutes);
    return NextResponse.json({
      success: true,
      recipe: fallbackRecipe,
      model: "rule-based-he",
      source: "fallback"
    });
  }

  if (!routerResult.ok) {
    return NextResponse.json(
      { success: false, error: routerResult.error, details: routerResult.details },
      { status: routerResult.status }
    );
  }

  return NextResponse.json({ success: false, error: "לא הצלחנו ליצור מתכון כרגע. נסי שוב." }, { status: 502 });
}
