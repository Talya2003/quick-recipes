export type CategorySlug = "breakfast" | "lunch" | "dinner" | "snacks" | "desserts" | "drinks";
export type Difficulty = "קל" | "בינוני";

export interface Recipe {
  slug: string;
  title: string;
  description: string;
  minutesTotal: number;
  minutesPrep: number;
  ingredients: string[];
  steps: string[];
  tags: string[];
  category: CategorySlug;
  difficulty: Difficulty;
  image: string;
  publishedAt: string;
  popularityScore: number;
}

export interface CategoryMeta {
  slug: CategorySlug;
  label: string;
  description: string;
}

export const categories: CategoryMeta[] = [
  { slug: "breakfast", label: "ארוחת בוקר", description: "פתיחה מהירה ליום עם מינימום עבודה." },
  { slug: "lunch", label: "צהריים", description: "מנות קצרות לצהריים באמצע יום עמוס." },
  { slug: "dinner", label: "ערב", description: "ארוחת ערב פשוטה, מהירה ומשביעה." },
  { slug: "snacks", label: "נשנושים", description: "ביס זריז בין משימות או לפני אימון." },
  { slug: "desserts", label: "קינוחים", description: "משהו מתוק שמכינים בכמה דקות." },
  { slug: "drinks", label: "משקאות", description: "שייקים ומשקאות קצרים ומרעננים." }
];

const image = "/images/recipes/placeholder.svg";

export const recipes: Recipe[] = [
  {
    slug: "toast-avocado-egg",
    title: "טוסט אבוקדו וביצה",
    description: "בוקר מזין עם שלושה מרכיבים בלבד.",
    minutesTotal: 7,
    minutesPrep: 5,
    ingredients: ["2 פרוסות לחם", "חצי אבוקדו", "ביצה קשה"],
    steps: [
      "קולים את הלחם עד שהוא זהוב.",
      "מועכים את האבוקדו עם מעט מלח.",
      "מורחים אבוקדו ומניחים פרוסות ביצה מעל."
    ],
    tags: ["3 מצרכים", "בוקר", "חלבון"],
    category: "breakfast",
    difficulty: "קל",
    image,
    publishedAt: "2026-02-01",
    popularityScore: 92
  },
  {
    slug: "banana-oat-pancake",
    title: "פנקייק בננה ושיבולת שועל",
    description: "פנקייק מהיר בלי קמח לבן.",
    minutesTotal: 10,
    minutesPrep: 4,
    ingredients: ["בננה בשלה", "ביצה", "3 כפות שיבולת שועל", "קינמון"],
    steps: [
      "מועכים בננה ומערבבים עם ביצה ושיבולת שועל.",
      "מחממים מחבת נון-סטיק.",
      "יוצקים בלילה ומטגנים דקה מכל צד."
    ],
    tags: ["מתוק", "בוקר", "10 דקות"],
    category: "breakfast",
    difficulty: "קל",
    image,
    publishedAt: "2026-01-22",
    popularityScore: 88
  },
  {
    slug: "yogurt-berries-cup",
    title: "כוס יוגורט ופירות יער",
    description: "ארוחת בוקר קרה ומהירה במיוחד.",
    minutesTotal: 3,
    minutesPrep: 3,
    ingredients: ["יוגורט יווני", "פירות יער קפואים", "כפית דבש"],
    steps: [
      "שמים יוגורט בכוס רחבה.",
      "מוסיפים פירות יער ודבש מעל.",
      "מערבבים קלות ומגישים מיד."
    ],
    tags: ["3 מצרכים", "בוקר", "5 דקות"],
    category: "breakfast",
    difficulty: "קל",
    image,
    publishedAt: "2026-01-18",
    popularityScore: 84
  },
  {
    slug: "tuna-corn-salad",
    title: "סלט טונה ותירס",
    description: "צהריים קלים בלי בישול כמעט.",
    minutesTotal: 6,
    minutesPrep: 6,
    ingredients: ["קופסת טונה", "חצי כוס תירס", "2 כפות יוגורט", "מלח ופלפל"],
    steps: [
      "מסננים טונה ומעבירים לקערה.",
      "מוסיפים תירס ויוגורט.",
      "מתבלים ומערבבים עד אחידות."
    ],
    tags: ["חלבון", "7 דקות", "ללא בישול"],
    category: "lunch",
    difficulty: "קל",
    image,
    publishedAt: "2026-02-10",
    popularityScore: 95
  },
  {
    slug: "pita-pizza-fast",
    title: "פיצה פיתה זריזה",
    description: "חשק לפיצה ב-8 דקות.",
    minutesTotal: 8,
    minutesPrep: 3,
    ingredients: ["פיתה", "רסק עגבניות", "גבינה מגוררת", "אורגנו"],
    steps: [
      "מורחים רסק עגבניות על הפיתה.",
      "מפזרים גבינה ואורגנו.",
      "אופים בתנור חם 5 דקות."
    ],
    tags: ["ילדים", "ארוחת ערב", "מהיר"],
    category: "dinner",
    difficulty: "קל",
    image,
    publishedAt: "2026-01-31",
    popularityScore: 91
  },
  {
    slug: "quick-caprese-bowl",
    title: "קערת קפרזה מהירה",
    description: "עגבנייה, מוצרלה ובזיליקום בדקה.",
    minutesTotal: 5,
    minutesPrep: 5,
    ingredients: ["2 עגבניות", "100 גרם מוצרלה", "עלי בזיליקום", "שמן זית"],
    steps: [
      "חותכים עגבניות ומוצרלה לקוביות.",
      "מוסיפים בזיליקום.",
      "מזלפים שמן זית ומלח ומגישים."
    ],
    tags: ["5 דקות", "ללא בישול", "קליל"],
    category: "lunch",
    difficulty: "קל",
    image,
    publishedAt: "2026-02-20",
    popularityScore: 79
  },
  {
    slug: "egg-fried-rice-cup",
    title: "אורז מוקפץ ביצה בכוס",
    description: "פתרון מהיר לשאריות אורז.",
    minutesTotal: 12,
    minutesPrep: 6,
    ingredients: ["כוס אורז מבושל", "ביצה", "כף סויה", "בצל ירוק"],
    steps: [
      "מחממים מחבת עם מעט שמן.",
      "מטגנים ביצה ומפוררים.",
      "מוסיפים אורז וסויה ומקפיצים 3 דקות.",
      "מפזרים בצל ירוק ומגישים."
    ],
    tags: ["צהריים", "12 דקות", "שאריות"],
    category: "lunch",
    difficulty: "בינוני",
    image,
    publishedAt: "2026-01-29",
    popularityScore: 86
  },
  {
    slug: "cheese-toast-garlic",
    title: "טוסט גבינות שום",
    description: "קריספי מבחוץ ונמס מבפנים.",
    minutesTotal: 9,
    minutesPrep: 4,
    ingredients: ["2 פרוסות לחם", "גבינה צהובה", "חמאה", "אבקת שום"],
    steps: [
      "מורחים חמאה ואבקת שום על הלחם.",
      "מניחים גבינה בין הפרוסות.",
      "קולים במחבת עד הזהבה משני הצדדים."
    ],
    tags: ["ערב", "10 דקות", "גבינות"],
    category: "dinner",
    difficulty: "קל",
    image,
    publishedAt: "2026-02-16",
    popularityScore: 90
  },
  {
    slug: "couscous-lemon-herbs",
    title: "קוסקוס לימון ועשבי תיבול",
    description: "מנה צדדית מהירה ומרעננת.",
    minutesTotal: 10,
    minutesPrep: 5,
    ingredients: ["כוס קוסקוס", "כוס מים רותחים", "לימון", "פטרוזיליה"],
    steps: [
      "מכסים קוסקוס במים רותחים ל-5 דקות.",
      "מפוררים עם מזלג.",
      "מוסיפים מיץ לימון ופטרוזיליה קצוצה."
    ],
    tags: ["10 דקות", "ללא מאמץ", "תוספת"],
    category: "dinner",
    difficulty: "קל",
    image,
    publishedAt: "2026-01-27",
    popularityScore: 72
  },
  {
    slug: "hummus-cucumber-wrap",
    title: "רול חומוס ומלפפון",
    description: "נשנוש טרי בשתי דקות הכנה.",
    minutesTotal: 4,
    minutesPrep: 4,
    ingredients: ["טורטייה", "2 כפות חומוס", "מלפפון פרוס", "זעתר"],
    steps: [
      "מורחים חומוס על טורטייה.",
      "מוסיפים מלפפון וזעתר.",
      "מגלגלים וחותכים לחצאים."
    ],
    tags: ["5 דקות", "נשנוש", "3 מצרכים"],
    category: "snacks",
    difficulty: "קל",
    image,
    publishedAt: "2026-02-25",
    popularityScore: 77
  },
  {
    slug: "date-peanut-balls",
    title: "כדורי תמרים וחמאת בוטנים",
    description: "מתוק טבעי בלי אפייה.",
    minutesTotal: 8,
    minutesPrep: 8,
    ingredients: ["8 תמרים", "2 כפות חמאת בוטנים", "קוקוס טחון"],
    steps: [
      "טוחנים תמרים עם חמאת בוטנים.",
      "יוצרים כדורים קטנים.",
      "מצפים בקוקוס ומקררים 10 דקות."
    ],
    tags: ["ללא אפייה", "מתוק", "3 מצרכים"],
    category: "desserts",
    difficulty: "קל",
    image,
    publishedAt: "2026-02-03",
    popularityScore: 97
  },
  {
    slug: "microwave-brownie-mug",
    title: "בראוניז בכוס במיקרוגל",
    description: "קינוח שוקולדי בדקות.",
    minutesTotal: 6,
    minutesPrep: 3,
    ingredients: ["2 כפות קמח", "2 כפות קקאו", "2 כפות סוכר", "ביצה", "2 כפות חלב"],
    steps: [
      "מערבבים את כל החומרים בכוס גדולה.",
      "מכניסים למיקרוגל ל-90 שניות.",
      "נותנים דקה מנוחה ואוכלים חם."
    ],
    tags: ["קינוח מהיר", "7 דקות", "שוקולד"],
    category: "desserts",
    difficulty: "בינוני",
    image,
    publishedAt: "2026-02-12",
    popularityScore: 93
  },
  {
    slug: "apple-cinnamon-crumble-pan",
    title: "קרמבל תפוחים במחבת",
    description: "ריח של בית בלי תנור.",
    minutesTotal: 14,
    minutesPrep: 7,
    ingredients: ["תפוח", "2 כפות שיבולת שועל", "כפית סוכר חום", "קינמון", "כפית חמאה"],
    steps: [
      "חותכים תפוח לקוביות ומטגנים עם חמאה.",
      "מוסיפים סוכר וקינמון.",
      "מפזרים שיבולת שועל וקולים עוד 3 דקות."
    ],
    tags: ["14 דקות", "מתוק", "מחבת"],
    category: "desserts",
    difficulty: "בינוני",
    image,
    publishedAt: "2026-01-20",
    popularityScore: 68
  },
  {
    slug: "iced-coffee-protein",
    title: "אייס קפה חלבון",
    description: "בוסט אנרגיה קריר תוך 2 דקות.",
    minutesTotal: 2,
    minutesPrep: 2,
    ingredients: ["אספרסו קר", "חלב", "כף אבקת חלבון", "קרח"],
    steps: [
      "שמים הכל בבלנדר או שייקר.",
      "מנערים 20 שניות.",
      "מוזגים לכוס עם קרח נוסף."
    ],
    tags: ["2 דקות", "משקה", "חלבון"],
    category: "drinks",
    difficulty: "קל",
    image,
    publishedAt: "2026-02-18",
    popularityScore: 89
  },
  {
    slug: "green-smoothie-quick",
    title: "שייק ירוק זריז",
    description: "ירוק, קליל ומוכן בבלנדר.",
    minutesTotal: 4,
    minutesPrep: 4,
    ingredients: ["בננה", "חופן תרד", "כוס מים", "מיץ לימון"],
    steps: [
      "שמים את כל החומרים בבלנדר.",
      "טוחנים עד מרקם חלק.",
      "טועמים ומאזנים חמיצות."
    ],
    tags: ["5 דקות", "משקה", "בריא"],
    category: "drinks",
    difficulty: "קל",
    image,
    publishedAt: "2026-02-24",
    popularityScore: 81
  },
  {
    slug: "chocolate-banana-shake",
    title: "שייק בננה שוקולד",
    description: "קינוח לשתייה בשלוש דקות.",
    minutesTotal: 3,
    minutesPrep: 3,
    ingredients: ["בננה", "כוס חלב", "כפית קקאו", "קרח"],
    steps: [
      "מכניסים הכל לבלנדר.",
      "טוחנים חצי דקה.",
      "מגישים מיד."
    ],
    tags: ["3 דקות", "מתוק", "ילדים"],
    category: "drinks",
    difficulty: "קל",
    image,
    publishedAt: "2026-01-25",
    popularityScore: 75
  },
  {
    slug: "quick-shakshuka-pan",
    title: "שקשוקה מהירה במחבת",
    description: "גרסה מקוצרת לשקשוקה ביתית.",
    minutesTotal: 15,
    minutesPrep: 6,
    ingredients: ["כוס רוטב עגבניות", "2 ביצים", "כפית פפריקה", "מלח"],
    steps: [
      "מחממים רוטב עגבניות במחבת.",
      "מתבלים בפפריקה.",
      "שוברים ביצים פנימה ומבשלים עד התייצבות."
    ],
    tags: ["15 דקות", "ערב", "חלבון"],
    category: "dinner",
    difficulty: "בינוני",
    image,
    publishedAt: "2026-01-30",
    popularityScore: 94
  },
  {
    slug: "turkey-cheese-rollups",
    title: "רולאפים הודו וגבינה",
    description: "נשנוש מלוח לחטוף בדרך.",
    minutesTotal: 5,
    minutesPrep: 5,
    ingredients: ["פרוסות חזה הודו", "גבינה לבנה", "מלפפון דק"],
    steps: [
      "מורחים שכבה דקה של גבינה על ההודו.",
      "מניחים רצועות מלפפון.",
      "מגלגלים ומצמידים עם קיסם."
    ],
    tags: ["5 דקות", "נשנוש", "3 מצרכים"],
    category: "snacks",
    difficulty: "קל",
    image,
    publishedAt: "2026-01-19",
    popularityScore: 70
  },
  {
    slug: "crispy-chickpeas",
    title: "חומוס קריספי בתנור",
    description: "נשנוש פריך ובריא יחסית.",
    minutesTotal: 15,
    minutesPrep: 4,
    ingredients: ["קופסת חומוס מסונן", "כף שמן זית", "פפריקה", "מלח"],
    steps: [
      "מערבבים חומוס עם שמן ותבלינים.",
      "מפזרים על תבנית בשכבה אחת.",
      "אופים 11 דקות בתנור חם."
    ],
    tags: ["15 דקות", "נשנוש", "מלוח"],
    category: "snacks",
    difficulty: "קל",
    image,
    publishedAt: "2026-02-07",
    popularityScore: 73
  },
  {
    slug: "labneh-zaatar-toast",
    title: "טוסט לאבנה וזעתר",
    description: "ביס ים-תיכוני מהיר.",
    minutesTotal: 5,
    minutesPrep: 5,
    ingredients: ["פרוסות לחם", "לאבנה", "זעתר", "שמן זית"],
    steps: [
      "קולים את הלחם.",
      "מורחים לאבנה.",
      "מפזרים זעתר ומזלפים שמן זית."
    ],
    tags: ["בוקר", "5 דקות", "מלוח"],
    category: "breakfast",
    difficulty: "קל",
    image,
    publishedAt: "2026-02-11",
    popularityScore: 80
  },
  {
    slug: "cottage-veg-bowl",
    title: "קערת קוטג׳ וירקות",
    description: "פתרון חלבוני לארוחה זריזה.",
    minutesTotal: 6,
    minutesPrep: 6,
    ingredients: ["קוטג׳", "מלפפון", "עגבנייה", "זיתים"],
    steps: [
      "חותכים ירקות לקוביות.",
      "שמים קוטג׳ בקערה.",
      "מוסיפים ירקות וזיתים ומערבבים קלות."
    ],
    tags: ["7 דקות", "בוקר", "חלבון"],
    category: "breakfast",
    difficulty: "קל",
    image,
    publishedAt: "2026-02-09",
    popularityScore: 76
  },
  {
    slug: "pasta-pesto-peas",
    title: "פסטה פסטו ואפונה",
    description: "צהריים חמים עם מעט מרכיבים.",
    minutesTotal: 13,
    minutesPrep: 5,
    ingredients: ["פסטה קצרה", "2 כפות פסטו", "חצי כוס אפונה קפואה", "פרמזן"],
    steps: [
      "מבשלים פסטה לפי הוראות האריזה.",
      "בדקה האחרונה מוסיפים אפונה.",
      "מערבבים עם פסטו ופרמזן."
    ],
    tags: ["13 דקות", "צהריים", "פסטה"],
    category: "lunch",
    difficulty: "בינוני",
    image,
    publishedAt: "2026-02-14",
    popularityScore: 85
  },
  {
    slug: "tahini-honey-toast",
    title: "טוסט טחינה ודבש",
    description: "מתוק-מלוח מהיר לקפה של אחר הצהריים.",
    minutesTotal: 4,
    minutesPrep: 4,
    ingredients: ["לחם קלוי", "טחינה גולמית", "דבש"],
    steps: [
      "קולים פרוסה.",
      "מורחים שכבת טחינה דקה.",
      "מזלפים דבש מעל ומגישים."
    ],
    tags: ["3 מצרכים", "4 דקות", "מתוק"],
    category: "snacks",
    difficulty: "קל",
    image,
    publishedAt: "2026-02-22",
    popularityScore: 82
  },
  {
    slug: "quick-omelette-herbs",
    title: "חביתה עשבי תיבול",
    description: "קלאסיקה מהירה למתי שאין זמן.",
    minutesTotal: 6,
    minutesPrep: 3,
    ingredients: ["2 ביצים", "פטרוזיליה", "מלח", "כפית שמן"],
    steps: [
      "טורפים ביצים עם פטרוזיליה ומלח.",
      "מחממים שמן במחבת.",
      "שופכים ביצים ומקפלים אחרי 2 דקות."
    ],
    tags: ["6 דקות", "בוקר", "חלבון"],
    category: "breakfast",
    difficulty: "קל",
    image,
    publishedAt: "2026-01-24",
    popularityScore: 87
  },
  {
    slug: "mini-tortilla-quesadilla",
    title: "קסדייה טורטייה מיני",
    description: "גבינה נמתחת ב-7 דקות.",
    minutesTotal: 7,
    minutesPrep: 3,
    ingredients: ["טורטייה", "גבינה מגוררת", "סלסה"],
    steps: [
      "מניחים גבינה על חצי טורטייה ומקפלים.",
      "קולים במחבת 2 דקות מכל צד.",
      "חותכים למשולשים ומגישים עם סלסה."
    ],
    tags: ["7 דקות", "ערב", "3 מצרכים"],
    category: "dinner",
    difficulty: "קל",
    image,
    publishedAt: "2026-02-27",
    popularityScore: 96
  },
  {
    slug: "chia-pudding-vanilla",
    title: "פודינג צ׳יה וניל",
    description: "הכנה קצרה, תוצאה קרמית.",
    minutesTotal: 5,
    minutesPrep: 5,
    ingredients: ["3 כפות זרעי צ׳יה", "חצי כוס חלב", "כפית מייפל", "וניל"],
    steps: [
      "מערבבים את כל החומרים בצנצנת.",
      "ממתינים 5 דקות ומערבבים שוב.",
      "שומרים במקרר ומגישים קר."
    ],
    tags: ["5 דקות", "קינוח", "ללא גלוטן"],
    category: "desserts",
    difficulty: "קל",
    image,
    publishedAt: "2026-02-05",
    popularityScore: 78
  }
];

export const categoryLabelMap: Record<CategorySlug, string> = categories.reduce(
  (acc, current) => {
    acc[current.slug] = current.label;
    return acc;
  },
  {} as Record<CategorySlug, string>
);

export function getRecipeBySlug(slug: string): Recipe | undefined {
  return recipes.find((recipe) => recipe.slug === slug);
}

export function getRecipesByCategory(category: CategorySlug): Recipe[] {
  return recipes.filter((recipe) => recipe.category === category);
}

export function getRelatedRecipes(recipe: Recipe, max = 4): Recipe[] {
  return recipes
    .filter((item) => item.slug !== recipe.slug)
    .sort((a, b) => {
      const sharedA = a.tags.filter((tag) => recipe.tags.includes(tag)).length;
      const sharedB = b.tags.filter((tag) => recipe.tags.includes(tag)).length;
      if (a.category === recipe.category && b.category !== recipe.category) return -1;
      if (b.category === recipe.category && a.category !== recipe.category) return 1;
      if (sharedA !== sharedB) return sharedB - sharedA;
      return b.popularityScore - a.popularityScore;
    })
    .slice(0, max);
}

export function getNewestRecipes(): Recipe[] {
  return [...recipes].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

export function getPopularRecipes(limit = 6): Recipe[] {
  return [...recipes].sort((a, b) => b.popularityScore - a.popularityScore).slice(0, limit);
}
