# Jerky — локальный прототип

Рабочее название бренда ещё не выбрано. Это первая локальная версия публичного сайта: тёмный премиальный вид, польский язык по умолчанию, каталог из трёх вкусов по 100 г.

Локально сайт открывается на `http://127.0.0.1:3000`. Публикация на `jerky.tereshkovych.com.ua` идёт через GitHub Actions: пуш в `main` проверяет тесты и сборку, затем по SSH обновляет `/usr/src/jerky` на сервере `173.242.52.16`. Приложение слушает только `127.0.0.1:3010`, снаружи его открывает nginx.

В репозитории GitHub нужны секреты `VPS_HOST`, `VPS_USER` и `VPS_SSH_PRIVATE_KEY`. Первый деплой сам создаёт базу `jerky` и файл `/usr/src/jerky/.env`. Пароли остаются только в этом файле. Перед этим на сервере должны быть Node.js 22, nginx и MySQL. HTTPS ставится отдельно: `certbot --nginx -d jerky.tereshkovych.com.ua`.

Бриф: [`../PLAN.md`](../PLAN.md), [`../VISUAL_REFERENCES.md`](../VISUAL_REFERENCES.md), [`../NEXT_STAGE.md`](../NEXT_STAGE.md).

База — **MySQL**, не SQLite из исходного плана. Так и задано для этой установки. Используется Prisma ORM 7: у Prisma ORM 8 запись в MySQL ещё не поддерживается, а каталог и будущие заказы должны записываться.

## Что уже есть

- Главная, магазин и карточка продукта на `pl`, `uk` и `en`.
- История, FAQ, контакт, черновики политики и условий.
- Три продукта в MySQL: ORIGINAL, TERIYAKI, HOT CHILI. Розничная цена не задана.
- Корзина в браузере и локальный тестовый заказ в MySQL. Оплаты и отправки нет.
- Регистрация локального аккаунта, вход и страница своих тестовых заказов.
- Админ-аккаунт из `.env` и панель: заказы, статусы, заметки, карточки продуктов.
- Схема для рецептов, партий, себестоимости и отзывов.
- Приватные файлы рассчитаны на `storage/uploads` и отдаются только через `/api/private-media/[id]`.

Рецепты, партии и модерация отзывов — следующие этапы. Письма не отправляются.

Рисунки в `public/demo` — концептуальные эскизы, не фотографии продукта и не готовая упаковка.

## Требования

- Node.js 22
- Локальный MySQL 8 на `127.0.0.1:3306`

Базы `jerky` и `jerky_shadow` и пользователь `jerky` уже созданы на этом компьютере. Пароль лежит в `.env`. Файл не коммитится. Образец переменных — `.env.example`.

## Запуск

```powershell
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Открыть `http://127.0.0.1:3000`. Без языка в адресе сайт переходит на `/pl`.

Регистрация покупателя: `/pl/register`. Вход: `/pl/login`. Админ-аккаунт берётся из `ADMIN_EMAIL` и `ADMIN_PASSWORD` в `.env` при `npm run db:seed`. Панель: `/pl/admin`.

Проверки:

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

## Резервная копия

Дамп пишется в локальную папку и не должен попадать в Git:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u jerky -p --databases jerky > storage\backups\jerky.sql
```

Восстановление:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u jerky -p jerky < storage\backups\jerky.sql
```

Пароль запросит `mysqldump` / `mysql`. Его можно взять из `.env`.
