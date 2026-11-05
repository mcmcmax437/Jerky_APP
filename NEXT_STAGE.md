# NEXT_STAGE — Stage 1: Local foundation + Dark Luxury visual prototype

> **Проект:** Beef Jerky Brand  
> **Связанные документы:** `PLAN.md`, `VISUAL_REFERENCES.md`  
> **Версия брифа:** 1.0  
> **Статус:** подготовлено к будущему выполнению; **Stage 1 ещё не запускался**  
> **Режим:** только localhost, без деплоя  
> **Утверждённый стиль:** A — Dark Luxury  
> **Баланс сайта:** около 60% тёмного / 40% светлого  
> **Логотип:** временный символ + wordmark  
> **Default locale:** польский (`pl`)

---

## 1. Цель Stage 1

Подготовить стабильную локальную техническую основу и первый визуально законченный прототип публичного сайта. На этом этапе проверяем дизайн-направление и базовую архитектуру, а не пытаемся сразу реализовать весь магазин и админку.

После Stage 1 должны существовать:

- запускаемое локально приложение Next.js;
- TypeScript и базовая структура проекта;
- Tailwind и утверждённые design tokens Dark Luxury;
- Prisma + SQLite;
- локальные директории для базы данных и изображений;
- маршруты PL / UK / EN, польский по умолчанию;
- временный символ + wordmark;
- три адаптивных экрана: Home, Shop, Product Detail;
- три демо-продукта: Original, Teriyaki, Hot Chili, каждый 100 г;
- базовая схема данных, учитывающая будущие заказы, рецепты, партии, оценки, отзывы и costing;
- README с запуском и локальным резервным копированием.

---

## 2. Перед изменениями — инспекция проекта

Codex должен сначала:

1. Просмотреть содержимое текущей рабочей папки.
2. Проверить, есть ли существующий `package.json`, приложение, компоненты и assets.
3. Прочитать `PLAN.md`, `VISUAL_REFERENCES.md` и этот файл полностью.
4. Не удалять существующий код и изображения без объяснения и необходимости.
5. Если папка не пустая, адаптировать существующий проект; если пустая — создать приложение с нуля.
6. Кратко сообщить, что обнаружено, прежде чем менять структуру. Если блокирующих конфликтов нет — продолжить реализацию Stage 1 без дополнительных вопросов.

---

## 3. Техническая основа

### Рекомендуемый стек

- Next.js App Router;
- React + TypeScript;
- Tailwind CSS;
- Prisma ORM;
- SQLite;
- Zod;
- React Hook Form — можно подключить, если формы Stage 1 этого требуют;
- Lucide React;
- ESLint;
- Playwright — подготовить основу или добавить тесты ключевых экранов, если это не раздувает Stage 1.

Выбрать актуальные совместимые стабильные версии на момент выполнения. Не использовать устаревшие шаблоны установки.

### Локальные настройки

- приложение должно запускаться командой `npm run dev`;
- использовать `localhost`, не привязывать приложение к публичному IP;
- SQLite-файл хранить внутри `storage/database/`;
- фото рецептов и тестовых партий в будущем будут храниться в `storage/uploads/`;
- все приватные файлы и база исключаются из Git;
- создать `.env.example` без реальных секретов;
- создать `.gitignore` с исключениями для `.env.local`, SQLite и upload storage.

### Архитектурные ограничения

- UI не должен обращаться к Prisma напрямую;
- создать `lib/db` и сервисный слой для доступа к данным;
- каталог должен получать продукты из одного typed source of truth;
- цены должны быть представлены числовыми значениями и форматироваться для отображения;
- не сохранять секреты в клиентском коде;
- не делать upload private photos в `public/`.

---

## 4. Международная структура

Поддержать три locale:

- `pl` — основной язык и default;
- `uk` — украинский;
- `en` — английский.

Маршруты:

- `/pl`;
- `/pl/shop`;
- `/pl/product/[slug]`;
- аналогичные страницы для `/uk` и `/en`.

Требования:

- вынести UI-тексты в словари;
- переключатель языка в header;
- переключение сохраняет соответствующую страницу / slug там, где перевод доступен;
- польский используется при первом открытии без locale;
- не смешивать языки в одной локали;
- `Intl.NumberFormat` использовать для отображения цены в PLN;
- контент продуктов отделить от UI-словарей, чтобы в будущем редактировать переводы через админку.

---

## 5. Дизайн-система Stage 1

### Утверждённая концепция

**A — Dark Luxury.** Не использовать предыдущую концепцию Hybrid как основу текущего прототипа.

Цель — примерно 60% тёмного визуального пространства и 40% светлого. Hero и брендовые секции — тёмные; подробный контент и формы — на светлых поверхностях.

### Палитра

| Токен | HEX | Применение |
|---|---|---|
| `ink-950` | `#101010` | Hero / основной тёмный фон |
| `ink-900` | `#171717` | Header и тёмные поверхности |
| `ink-800` | `#242321` | Карточки / elevated surfaces |
| `ivory-100` | `#F2EEE7` | Светлые блоки |
| `ivory-200` | `#E6E0D6` | Вторичные светлые блоки |
| `text-light` | `#F5F1EA` | Текст на тёмном |
| `text-dark` | `#242321` | Текст на светлом |
| `copper` | `#A66E4B` | Тихий брендовый акцент |
| `teriyaki` | `#9A704C` | Маркер Teriyaki |
| `chili` | `#8E3834` | Маркер Hot Chili |
| `muted` | `#85817A` | Вторичный текст |

### Типографика

Проверить пару:

- Cormorant Garamond или DM Serif Display — display headings;
- Manrope или Inter — body и UI.

Не фиксировать выбор шрифта без проверки польских / украинских glyphs и лицензии. В Stage 1 достаточно выбрать одну окончательную пару и оформить через design tokens.

### Логотип

- разработать временный абстрактный символ + временный wordmark;
- финальное имя бренда не выдумывать;
- знак должен работать отдельно и в одну краску;
- избегать бычьего черепа, рогов, ножей и ковбойских клише;
- создать desktop / mobile вариант header;
- не тратить весь Stage 1 на финальный брендинг — знак должен быть заменяемым компонентом.

### Компоненты

Подготовить:

- `Container`;
- `Button`;
- `Header`;
- `Footer`;
- `LogoLockup`;
- `LanguageSwitcher`;
- `SectionHeading`;
- `ProductCard`;
- `Price`;
- `ProductGallery`;
- `Badge` / product label;
- базовые form controls.

Компоненты должны иметь hover, focus, active и disabled состояния. Не создавать абстракции без реального повторного использования.

---

## 6. Экраны Stage 1

### 6.1. Home

Состав:

1. Тёмный header с символом + wordmark.
2. Навигация: Shop, Our Story, FAQ; language switcher и cart icon.
3. Большой тёмный hero с одной сильной фотографией продукта / упаковки.
4. Короткий заголовок на польском и одна основная CTA.
5. Блок короткого позиционирования.
6. Три продукта в единой продуктовой сетке.
7. Один блок с макро-фото текстуры мяса или деталями упаковки.
8. Светлый editorial-блок с кратким текстом.
9. Тёмный footer.

На первом этапе не добавлять фиктивные отзывы, рейтинги, скидки, таймеры, остатки или неподтверждённые product claims.

### 6.2. Shop

- три продукта;
- упаковка 100 г;
- единая сетка карточек;
- фото / временный packshot;
- название вкуса;
- вес;
- цена-заглушка или `Coming soon` — не придумывать реальную цену;
- ссылка на product detail.

Не показывать рейтинг, если нет одобренных реальных отзывов.

### 6.3. Product Detail

- галерея;
- название вкуса;
- вес 100 г;
- цена-заглушка / Coming soon;
- короткое описание вкусового направления, явно как draft до утверждения рецепта;
- кнопка Add to cart может быть визуально подготовлена, но функциональная корзина входит в Stage 2;
- секции состава, аллергенов, питания и хранения не заполнять вымышленными данными;
- блок отзывов можно подготовить как структуру, но не показывать выдуманные оценки.

### 6.4. Демо-продукты

| Slug | Рабочее имя | Вес | Акцент |
|---|---|---:|---|
| `original` | ORIGINAL | 100 г | Bone / neutral |
| `teriyaki` | TERIYAKI | 100 г | Copper / warm brown |
| `hot-chili` | HOT CHILI | 100 г | Muted red |

Хранить продукты в одном typed data source. Не дублировать данные в разных компонентах.

---

## 7. Подготовить модель данных для следующих этапов

На Stage 1 не нужно создавать всю работающую админку и CRUD, но схема должна предусматривать будущие модули.

Базовые сущности / заготовки:

- `Product`, `ProductTranslation`, `ProductMedia`;
- `Order`, `OrderItem`, `OrderStatusEvent`, `OrderNote`;
- `Recipe`, `RecipeVersion`, `RecipeIngredient`, `RecipeStep`, `RecipeAsset`;
- `Ingredient`, `IngredientPriceRecord`;
- `TestBatch`, `BatchIngredientUsage`, `BatchCostLine`, `BatchOutput`, `BatchEvaluation`;
- `CustomerReview`, `MediaAsset`, `AdminSetting`.

Важно для будущего costing:

- хранить закупочные цены ингредиентов;
- в партии делать snapshot использованного количества и цены;
- поддерживать категории затрат: мясо, ингредиенты, расходники, упаковка, электричество, вода / коммунальные, труд, оборудование / амортизация, прочее;
- разделять плановую стоимость рецепта и фактическую стоимость партии;
- сохранять сырой вес, готовый вес, пригодный вес, образцы, потери и количество полных упаковок по 100 г;
- не пересчитывать задним числом старые партии при изменении закупочных цен.

Stage 1 должен либо создать согласованную стартовую Prisma schema, либо документировать явный план миграции, если создание всех таблиц на этом этапе мешает стабильному scaffold. Не реализовывать незавершённую бизнес-логику ради формального количества моделей.

---

## 8. Изображения и assets

Приоритет:

1. Проверить, есть ли в workspace реальные пользовательские изображения.
2. Если их нет — использовать clearly identified demo / placeholder assets.
3. Не выдавать концептуальный mockup за реальную упаковку.
4. Не использовать чужие логотипы и фотографии как финальные assets бренда.
5. Не делать R&D upload directory публичной.

Референсы для art direction находятся в `VISUAL_REFERENCES.md`:

- Moz — знак и монохромная айдентика;
- Ghost & Spur — чёрный pouch и тёплый акцент;
- Fine Gusto — премиальная категория;
- Meridian — семейство SKU;
- Branchish / Beefa — структура e-commerce.

---

## 9. Безопасность локального режима

- приложение остаётся на `localhost`;
- не использовать bind на публичный интерфейс без отдельного согласования;
- не подключать платёжные, почтовые или shipping API;
- SQLite и private uploads исключить из Git;
- private uploads отдавать только через server-side route, не напрямую из `public/`;
- не записывать реальные customer data в demo;
- не показывать R&D-данные в клиентской части.

Полноценная production-аутентификация и защита для публичного сервера не входят в Stage 1. До деплоя их нужно реализовать отдельно.

---

## 10. Не входит в Stage 1

- реальная корзина и тестовый заказ в SQLite (Stage 2);
- платежи;
- отправка e-mail;
- курьерские API;
- полная админка;
- CRUD рецептов;
- загрузка реальных фото рецептов;
- costing UI и формулы в рабочем интерфейсе;
- оценка тестовых партий;
- модерация отзывов;
- production auth;
- deployment / hosting / domain.

Схемы и типы могут быть подготовлены для будущих этапов, но соответствующие функции не должны изображаться как работающие.

---

## 11. Критерии приёмки Stage 1

- [ ] проект запускается локально командой `npm run dev`;
- [ ] открыт на `localhost`;
- [ ] польский — default locale;
- [ ] доступны маршруты PL / UK / EN;
- [ ] переключатель языка работает;
- [ ] Home адаптивен и визуально соответствует Dark Luxury;
- [ ] Shop показывает три SKU;
- [ ] каждая карточка ведёт на правильную Product Detail;
- [ ] все продукты имеют вес 100 г;
- [ ] соотношение тёмных / светлых областей близко к 60 / 40;
- [ ] есть временный знак + wordmark;
- [ ] нет фиктивных рейтингов и отзывов;
- [ ] нет неподтверждённых заявлений о составе и пищевых свойствах;
- [ ] SQLite подключена или её подключение документировано готовым рабочим способом;
- [ ] `storage/` и локальные секреты исключены из Git;
- [ ] README объясняет установку, запуск и backup;
- [ ] lint, typecheck и build проходят.

---

## 12. Что выполнить Codex после отдельной команды пользователя

Ниже — готовая задача для будущего запуска. **Не запускать её автоматически при чтении файла.**

```text
We are building a local-first premium Beef Jerky brand website. Read PLAN.md, VISUAL_REFERENCES.md, and NEXT_STAGE.md completely before making changes.

First inspect the workspace, existing package.json, source tree, and available assets. Preserve existing work. If this is an empty folder, scaffold the project; if an app already exists, adapt it carefully.

Implement Stage 1 only:
1. Next.js App Router + TypeScript + Tailwind CSS.
2. Prisma + SQLite configured for local development.
3. Locale routes for pl, uk, en; Polish (pl) is the default.
4. Dark Luxury visual direction, approximately 60% dark and 40% light.
5. Temporary abstract symbol + wordmark. Do not invent the final brand name.
6. Reusable design tokens and components.
7. Three responsive screens: Home, Shop, Product Detail.
8. Three draft products: Original, Teriyaki, Hot Chili; each is 100 g.
9. Keep product data in one typed source of truth.
10. Prepare storage folders and a Prisma data model that can support orders, recipe versions, ingredients, test batches, private photos, customer reviews, and detailed batch costing.
11. Keep SQLite, private uploads, and local secrets out of Git.
12. Add README instructions for install, local run, migrations, and local backup.

Do not implement full cart, checkout, payments, shipping APIs, email sending, production authentication, deployment, order management CRUD, recipe CRUD, batch evaluation UI, costing UI, or review moderation. These belong to later stages.

Do not invent nutrition, ingredient, allergen, certification, shelf-life, or health claims. Do not add fake ratings or testimonials. If real product images are unavailable, use clearly identified placeholders.

Quality requirements:
- semantic accessible markup;
- responsive desktop and mobile layouts;
- working navigation and locale switching;
- no private R&D image in public assets;
- no public deployment or public network binding;
- run lint, typecheck, and build; fix errors before finishing.

At the end report exact files created/changed, commands run, test results, and unresolved blockers. Do not deploy. The app must run on localhost only.
```

---

## 13. Что будет после Stage 1

1. **Stage 2:** корзина и тестовый checkout с записью заказов в SQLite.
2. **Stage 3:** админка заказов и продуктов.
3. **Stage 4:** библиотека рецептов, версии и фотографии.
4. **Stage 5:** тестовые партии, внутренние оценки и детальная себестоимость.
5. **Stage 6:** покупательские отзывы и модерация.
6. **Stage 7:** тестирование и локальная приёмка.
7. **Stage 8:** отдельная подготовка к серверному запуску — только когда владелец решит, что продукт и производство готовы.

