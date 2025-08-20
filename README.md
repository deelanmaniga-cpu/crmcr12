# CRM Vue + Supabase (идеально под критерии)

## Быстрый старт (локально)
```bash
npm install
cp .env.example .env   # подставь свой ANON KEY в .env
npm run dev
```
Открой http://localhost:5173

## Деплой на Vercel
1. `git init && git add . && git commit -m "deploy"`
2. Запушь в GitHub и импортируй в Vercel.
3. В Vercel → Settings → Environment Variables:
   - `VITE_SUPABASE_URL` = твой URL
   - `VITE_SUPABASE_KEY` = твой anon ключ
4. Build Command: `npm run build`, Output: `dist`, Framework Preset: Vite

## Пароль админки
Логин на странице `/login`. Пароль: **admin23**.

## Структура таблицы
SQL в `supabase/sql/schema.sql`. Внутренний ID назначается автоматически (identity), но можно указать вручную при добавлении. Колонки:
- internal_id (в таблице и в списке поиска, но не фильтруется)
- vertical (gambling, exchange, exchange bestchange, forex, betting, adult, mix)
- provider_type (провайдер/прямой мерчант/агрегатор провайдер/агрегатор мерчант)
- stake (проценты, фильтр >=)
- cheki (минимум, фильтр >=)
- rolling_reserve (да/нет)
- insurance (да/нет)
- settlement (в таблице и форме, без фильтра)
- date (тип date, без времени)
```
