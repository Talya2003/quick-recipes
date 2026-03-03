export interface ParsedAIRecipe {
  title: string;
  prepTime: string;
  difficulty: string;
  ingredients: string[];
  steps: string[];
  tips: string[];
}

export interface SubmitRecipeDraft {
  name: string;
  minutes: string;
  ingredients: string;
  steps: string;
  tags: string;
}

export const SUBMIT_RECIPE_DRAFT_KEY = "quick_recipes_submit_draft";

function cleanLinePrefix(value: string): string {
  return value.replace(/^[-*•]\s*/, "").replace(/^\d+[\).\s-]*/, "").trim();
}

export function normalizeAIRecipeText(raw: string): string {
  return raw
    .replace(/\s*(זמן הכנה:)/g, "\n$1")
    .replace(/\s*(רמת קושי:)/g, "\n$1")
    .replace(/\s*(רשימת מצרכים(?: עם כמויות)?:)/g, "\n\nרשימת מצרכים עם כמויות:")
    .replace(/\s*(מצרכים:)/g, "\n\nרשימת מצרכים עם כמויות:")
    .replace(/\s*(אופן ההכנה:)/g, "\n\n$1")
    .replace(/\s*(אופן הכנה:)/g, "\n\nאופן ההכנה:")
    .replace(/\s*(טיפים(?:\s*\(אופציונלי\))?:)/g, "\n\n$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseAIRecipe(raw: string): ParsedAIRecipe {
  const normalized = normalizeAIRecipeText(raw);

  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let title = "";
  let prepTime = "";
  let difficulty = "";
  const ingredients: string[] = [];
  const steps: string[] = [];
  const tips: string[] = [];

  let section: "ingredients" | "steps" | "tips" | null = null;

  for (const line of lines) {
    if (line.startsWith("שם המתכון:")) {
      title = line.replace("שם המתכון:", "").trim();
      section = null;
      continue;
    }
    if (line.startsWith("זמן הכנה:")) {
      prepTime = line.replace("זמן הכנה:", "").trim();
      section = null;
      continue;
    }
    if (line.startsWith("רמת קושי:")) {
      difficulty = line.replace("רמת קושי:", "").trim();
      section = null;
      continue;
    }
    if (line.startsWith("רשימת מצרכים עם כמויות:")) {
      section = "ingredients";
      continue;
    }
    if (line.startsWith("אופן ההכנה:")) {
      section = "steps";
      continue;
    }
    if (line.startsWith("טיפים")) {
      section = "tips";
      const inlineTip = line.replace(/^טיפים(?:\s*\(אופציונלי\))?:/, "").trim();
      if (inlineTip) tips.push(cleanLinePrefix(inlineTip));
      continue;
    }

    if (section === "ingredients") {
      const cleaned = cleanLinePrefix(line);
      if (cleaned) ingredients.push(cleaned);
      continue;
    }
    if (section === "steps") {
      const cleaned = cleanLinePrefix(line);
      if (cleaned) steps.push(cleaned);
      continue;
    }
    if (section === "tips") {
      const cleaned = cleanLinePrefix(line);
      if (cleaned) tips.push(cleaned);
    }
  }

  return {
    title: title || "מתכון מוצע",
    prepTime: prepTime || "לא צוין",
    difficulty: difficulty || "לא צוין",
    ingredients,
    steps,
    tips
  };
}

export function extractMinutes(prepTime: string, fallback = "10"): string {
  const match = prepTime.match(/\d{1,3}/);
  return match ? match[0] : fallback;
}
