# 🚀 RELENTLESS — Cloudflare Pages Deploy Заавар

---

## АЛХАМ 1: Supabase тохируулах

1. **[supabase.com](https://supabase.com)** руу орж шинэ Project үүсгэнэ
2. **SQL Editor** руу ороод `supabase_schema.sql` файлын бүх кодыг хуулж, **Run** дарна
3. **Project Settings → API** хэсгээс доорхыг хадгална:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`
4. **Table Editor → orders** → Баруун дээр **Realtime** сонголтыг идэвхжүүлнэ

---

## АЛХАМ 2: Telegram Bot тохируулах

1. Telegram дээр **@BotFather** руу очиж `/newbot` гэж бичнэ
2. Bot нэрийг оруулаад **Bot Token** авна (жишээ: `1234567890:AAxxxxx`)
3. Өөрийн chat ID авахын тулд **@userinfobot** руу очиж `/start` дарна
4. Эсвэл ботоо эхлүүлээд: `https://api.telegram.org/bot{TOKEN}/getUpdates` хаягаар орно

---

## АЛХАМ 3: GitHub дээр байршуулах

```bash
# Проектын хавтасруу орно
cd relentless

# Git эхлүүлнэ
git init
git add .
git commit -m "Initial commit - Relentless ecommerce"

# GitHub дээр шинэ repository үүсгээд:
git remote add origin https://github.com/ТАНЫ_НЭР/relentless.git
git branch -M main
git push -u origin main
```

---

## АЛХАМ 4: Cloudflare Pages тохируулах

1. **[dash.cloudflare.com](https://dash.cloudflare.com)** руу нэвтэрнэ
2. **Workers & Pages → Create application → Pages → Connect to Git**
3. GitHub repository-г холбоно
4. Build тохиргоо:
   | Тохиргоо | Утга |
   |---|---|
   | Framework preset | `Vite` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `/` (хоосон үлдэнэ) |

5. **Environment variables** хэсэгт доорхыг нэмнэ:
   ```
   VITE_SUPABASE_URL          = https://xxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY     = eyJxxxxxx...
   VITE_TELEGRAM_BOT_TOKEN    = 1234567890:AAxxxxx
   VITE_TELEGRAM_CHAT_ID      = 123456789
   ```

6. **Save and Deploy** дарна → 2-3 минутын дараа `relentless.pages.dev` дээр амьдарна!

---

## АЛХАМ 5: Локалд турших (заавал биш)

```bash
# Хамаарлуудыг суулгана
npm install

# .env файл үүсгэнэ
cp .env.example .env
# .env файлд өөрийн утгуудыг оруулна

# Хөгжүүлэлтийн сервер эхлүүлнэ
npm run dev
# → http://localhost:5173 дээр нээгдэнэ
```

---

## ФАЙЛЫН БҮТЭЦ

```
relentless/
├── src/
│   ├── App.jsx                    # Үндсэн апп (Нүүр хуудас, Hero, Бараа)
│   ├── main.jsx                   # React entry point
│   ├── index.css                  # Tailwind CSS
│   ├── supabaseClient.js          # Supabase холболт
│   └── components/
│       ├── ProductCard.jsx        # Барааны карт
│       ├── CheckoutModal.jsx      # Захиалгын форм + Success modal
│       └── AdminDashboard.jsx     # Админ панель
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── .env.example                   # Env жишээ
└── supabase_schema.sql            # DB бүтэц
```

---

## ЛОГИКИЙН ТАЙЛБАР

### 📦 Захиалгын дугаар
- `orders_order_number_seq` sequence #1000-аас эхэлдэг
- Хэрэглэгч захиалга илгээх бүрт автоматаар #1001, #1002... нэмэгддэг
- Success modal-д **тод томруун** харагдана
- Гүйлгээний утга: `Захиалга #1024 — 99112233`

### 📱 Telegram мэдэгдэл
- Захиалга Supabase-д хадгалагдмагц шууд Telegram руу очдог
- Bot token болон Chat ID `.env`-ээс уншигддаг

### 🔐 Админ нэвтрэх
- URL-д `/admin` биш — нуугдмал товчоор нэвтэрнэ
- Код: `999` (App.jsx-д `ADMIN_CODE` хувьсагчаас өөрчилж болно)

### ⚡ Realtime
- Админ захиалгын жагсаалт Supabase Realtime-аар шинэчлэгддэг
- Шинэ захиалга ирэх бүрт автоматаар харагдана

---

## ⚠️ АНХААРУУЛГА

- `.env` файлыг **хэзээ ч** GitHub-д push хийхгүй!
- `.gitignore`-д `.env` орсон эсэхийг шалгаарай
- Cloudflare Pages дээр Environment Variables-г заавал тохируулах

---

*Асуулт байвал: @relentless.mn*
