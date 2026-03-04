# Quick & Minimal Recipes (RTL Hebrew)

פרויקט Next.js 14 + TypeScript + Tailwind לאתר מתכונים מהירים בעברית עם תמיכה מלאה ב-RTL.

## דרישות

- Node.js 18+
- npm

## התקנה והרצה

```bash
npm install
npm run dev
```

האתר יעלה בכתובת `http://localhost:3000`.

## Build לפרודקשן

```bash
npm run build
npm run start
```

## משתני סביבה

צרי קובץ `.env.local` לפי `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
HUGGINGFACE_API_KEY=your_huggingface_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase Auth + DB

הפרויקט משתמש ב:
- Supabase Auth (Email + Password)
- טבלאות `profiles`, `saved_recipes`
- טבלת קהילה: `public_recipes`
- RLS Policies

### הקמת public_recipes

הריצי את הסקריפט הבא ב-Supabase SQL Editor:

- `supabase/sql/2026-03-04-public-recipes.sql`

הסקריפט יוצר:
- טבלת `public_recipes`
- אינדקסים
- RLS + Policies לקריאה ציבורית והוספה/עדכון/מחיקה רק ע"י בעלת המתכון

## זרימות עיקריות באפליקציה

- `/login` התחברות והרשמה
- `/account` אזור אישי עם:
- עדכון שם תצוגה
- צפייה במתכונים שנשמרו
- צפייה במתכונים שפורסמו לקהילה
- `/submit` שליחת מתכון:
- שומרת עותק בטבלת `saved_recipes`
- מפרסמת לטבלת `public_recipes`
- `/community` מתכוני קהילה לצפייה לכל המשתמשים
- שמירה של מתכון קהילה לרשימה האישית

## AI Recipe Generator (Hugging Face)

הפיצ'ר יוצר מתכון לפי מצרכים שהמשתמש מזין.

### יצירת API Key חינמי

1. נכנסים ל-`https://huggingface.co`
2. מתחברים לחשבון
3. עוברים ל-`Settings -> Access Tokens`
4. יוצרים Token חדש עם הרשאת `Read`

### איך זה עובד

- הלקוח שולח בקשה ל-`/api/ai-recipe`
- השרת מתקשר ל-Hugging Face
- המפתח נשמר רק בשרת ולא נחשף ללקוח

## הערות

- AI מוגבל למצרכים שסופקו + פריטי מזווה בסיסיים (מלח, פלפל, שמן, מים)
- קיימים Retry ו-Timeout לקריאות AI

