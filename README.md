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
- טבלאות `profiles` ו-`saved_recipes`
- RLS Policies

זרימות שכבר ממומשות:
- `/login` התחברות והרשמה
- `/account` אזור אישי עם עדכון שם תצוגה
- שמירה ומחיקה של מתכונים בטבלת `saved_recipes`
- שמירה ישירה של מתכון AI לחשבון (כשמחוברים)

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
