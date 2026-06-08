# Весільний сайт · Любомир та Маряна · 28.08.2026

React + TypeScript + Vite + Tailwind CSS + Framer Motion

## Запуск

```bash
npm install
npm run dev
```

Відкрити: http://localhost:5173

## Заміна зображень

Всі плейсхолдери знаходяться в `public/images/`. Замініть їх реальними фото, зберігаючи ті самі імена файлів (або оновіть src у компонентах).

| Файл | Де використовується | Рекомендовані пропорції |
|---|---|---|
| `hero.jpg` | Головне фото (Hero) | 2:3 (портрет) |
| `venue-1.jpg` | Фото ресторану 1 | 1:1 (квадрат) |
| `venue-2.jpg` | Фото ресторану 2 | 1:1 (квадрат) |
| `dress-1.jpg` … `dress-6.jpg` | Приклади образів | 3:4 (портрет) |
| `flowers.jpg` | Фото квітів (Farewell) | 16:9 або ширше |

Після заміни оновіть розширення в src атрибутах:
- `Hero.tsx` → `/images/hero.svg` → `/images/hero.jpg`
- `Venue.tsx` → venue-1.svg / venue-2.svg → .jpg
- `DressCode.tsx` → dress-1.svg … dress-6.svg → .jpg
- `Farewell.tsx` → flowers.svg → .jpg

## Що замінити в коді

| Файл | Що змінити |
|---|---|
| `src/components/sections/Venue.tsx` | Адреса ресторану + посилання на Google Maps |
| `src/components/sections/Contacts.tsx` | Телефон та ім'я організатора |
| `src/components/sections/RSVP.tsx` | href кнопки «Заповнити» → посилання на форму |

## Структура проєкту

```
src/
  components/
    sections/   Hero · Invitation · Venue · Program · DressCode · Wishes · RSVP · Contacts · Farewell
    ui/         Button · Card · SectionTitle
  lib/
    animations.ts   Framer Motion варіанти (fadeInUp, staggerContainer)
  styles/
    globals.css     CSS змінні + Tailwind directives
  App.tsx           3-колонковий лейаут (≥1024px) / single-column (mobile)
  main.tsx
public/
  images/           всі зображення (SVG плейсхолдери)
```

## Збірка для продакшену

```bash
npm run build
```

Результат у папці `dist/`.
