# MOYA BAKU — магазин одежды (Next.js 15 · TypeScript · Tailwind)

Тёмный минималистичный двуязычный (AZ / RU) каталог с корзиной и отправкой заказов в Telegram. Mobile-first: нижняя панель управления, bottom-sheet для товара/корзины/фильтров, свайп-карусель.

## Структура

```
app/
  page.tsx                  главная (SSR: читает data/products.json)
  layout.tsx, globals.css   шрифты (Cormorant + Montserrat), токены, анимации
  admin/page.tsx            закрытая админка (пароль ADMIN_PASSWORD)
  api/order/                POST — заказ → Telegram sendMessage
  api/admin/{login,products,upload}/
  api/uploads/[name]/       отдача загруженных фото
components/                 Shop, Catalog, ProductCard, ProductSheet, Carousel, CartDrawer, FilterSheet, Sheet
lib/                        store (язык + корзина), i18n (AZ/RU), validate, auth, products-store
data/products.json          каталог (редактируется через /admin или вручную)
public/placeholder/         тестовые изображения
```

## Запуск

```bash
npm install
cp .env.example .env.local     # заполните значения (см. ниже)
npm run dev                    # http://localhost:3000
```

Продакшн: `npm run build && npm start`.

## Подключение Telegram-бота

1. В Telegram откройте **@BotFather** → `/newbot` → получите токен → `TELEGRAM_BOT_TOKEN`.
2. Напишите вашему боту любое сообщение (или добавьте бота в группу/канал и дайте права писать).
3. Откройте в браузере `https://api.telegram.org/bot<ТОКЕН>/getUpdates` и найдите `"chat":{"id": ...}` — это `TELEGRAM_CHAT_ID`. Для групп id отрицательный (например `-1001234567890`).
4. Впишите оба значения в `.env.local` и перезапустите сервер.

Токен используется только на сервере (`app/api/order/route.ts`) и не попадает в клиентский бандл. Цены, названия и статусы в заявке берутся из каталога на сервере, а не из браузера.

## Админка `/admin`

Задайте `ADMIN_PASSWORD` в `.env.local`, откройте `/admin`, войдите. Можно добавлять/удалять товары, менять цены, размеры, описания AZ/RU, срок предзаказа, переключать **В наличии ↔ Под предзаказ**, вставлять ссылки на фото или загружать файлы (JPG/PNG/WEBP/AVIF до 6 МБ). Кнопка «Сохранить» пишет в `data/products.json`; загрузки лежат в `data/uploads/`.

> Важно: админка пишет в файлы на диске сервера. Хостинг должен иметь постоянный диск (VPS, Railway/Fly с volume и т. п.). На Vercel и подобных serverless-платформах файловая система только для чтения — сохранение работать не будет.

## Формат товара

```json
{
  "id": "noir-puffer", "category": "outerwear | shoes | sets",
  "status": "in_stock | preorder", "preorderDays": "12–16",
  "price": 389, "sizes": ["S","M","L","XL"],
  "images": ["/placeholder/a.svg", "https://..."],
  "name": { "az": "...", "ru": "..." },
  "description": { "az": "...", "ru": "..." }
}
```
Пустой массив `sizes` — товар без выбора размера.
