# Environment — Vercel uchun

Bu papkada tayyor shablonlar bor. Qiymatlarni to'ldirib, Vercelga qo'yasiz.

## Fayllar

| Fayl | Maqsad |
|------|--------|
| `local.env.example` | Kompyuteringizda `npm run dev` (mock) |
| `production.env.example` | Vercel + Firebase (asosiy production) |
| `mock-production.env.example` | Vercel demo, Firebase siz |
| `vercel-import.env.example` | Vercelga bir zumda import qilish uchun |

## Local (kompyuter)

```bash
cd work
copy env\local.env.example .env.local
# yoki Firebase bilan ishlasangiz: production.env.example dan nusxa oling
npm run dev
```

## Vercel deploy

1. [vercel.com](https://vercel.com) → **Add New Project** → `Xurshid-2004/workwebsite` reponi tanlang
2. **Root Directory** → `work` (muhim!)
3. **Environment Variables** → `production.env.example` oching, qiymatlarni to'ldiring
4. Har bir o'zgaruvchini **Production** (va kerak bo'lsa Preview) uchun qo'shing
5. Deploy

### Tez import

`vercel-import.env.example` faylida qiymatlarni tekshiring, keyin Vercel dashboardda **Environment Variables → Import .env** orqali yuklang.

## O'zgaruvchilar

| O'zgaruvchi | Majburiy | Tavsif |
|-------------|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | Ha | `https://sizning-domen.vercel.app` |
| `NEXT_PUBLIC_AUTH_PROVIDER` | Ha | `mock` yoki `firebase` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase uchun | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase uchun | `project-id.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase uchun | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase uchun | Firebase web app ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yo'q | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yo'q | FCM sender ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Yo'q | Analytics (ixtiyoriy) |
| `NEXT_PUBLIC_MAP_PROVIDER` | Yo'q | `placeholder` (default) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yo'q | Faqat Google Maps uchun |

## Firebase (production)

1. [Firebase Console](https://console.firebase.google.com) → loyihangiz (`card-4bbbf`)
2. **Authentication** → Email/Password yoqing
3. **Firestore Database** → Create database (production mode)
4. **Firestore Rules** → `firebase/firestore.rules` faylini deploy qiling
5. Kerak bo'lsa `firebase/seed.md` bo'yicha boshlang'ich ma'lumot qo'shing

## Xavfsizlik

- `.env.local` va to'ldirilgan `env/*.env` fayllarni gitga commit qilmang
- Firebase Web API key client-side uchun mo'ljallangan; server maxfiy kalitlarni frontendga qo'ymang
- Firestore Security Rules ni productiondan oldin tekshiring
