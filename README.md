# Burger Deluxe - Премиум бургерная с доставкой

Полное мобильное приложение для онлайн-заказа в бургерной "Burger Deluxe" на стеке MERN (MongoDB, Express, React, Node.js) с TypeScript.

## 🚀 Особенности

### ✨ Дизайн
- **Мягкая и теплая цветовая палитра**: кремовый (#FFF8F0), оранжевый (#FF8A65), коричневый (#3C2F2F)
- **Mobile-first подход** с полной адаптивностью
- **Современные анимации** с Framer Motion
- **PWA-ready** функциональность

### 🔐 Авторизация и безопасность
- JWT токены с HTTP-only cookies
- Защищенные маршруты
- Роли пользователей (user/admin)
- Rate limiting и helmet для безопасности

### 🍔 Функциональность
- **Каталог блюд** с категориями, поиском и фильтрами
- **Корзина** с синхронизацией между LocalStorage и сервером
- **Система заказов** с отслеживанием статусов
- **Админ-панель** с полным CRUD для блюд и управлением заказами
- **Загрузка изображений** через Multer
- **Интеграция** с МойСклад и 1С (заглушки с подробными TODO)

### 📊 Меню
20+ реалистичных блюд в 6 категориях:
- Signature Burgers (фирменные бургеры)
- Classic Burgers (классические)
- Chicken & Sides (курица и гарниры)  
- Fries & Snacks (картофель и закуски)
- Drinks & Shakes (напитки и коктейли)
- Desserts (десерты)

## 🛠 Технологии

### Backend
- **Node.js** + Express + TypeScript
- **MongoDB** + Mongoose
- **JWT** + bcryptjs + http-only cookies
- **Zod** для валидации
- **Multer** для загрузки файлов
- **Rate limiting**, CORS, Helmet для безопасности

### Frontend
- **React 18** + Vite + TypeScript
- **Tailwind CSS** + shadcn/ui + Lucide React
- **React Router v6**
- **Zustand** для состояния
- **TanStack Query** (React Query)
- **React Hook Form** + Zod
- **Framer Motion** для анимаций
- **Sonner** для уведомлений

## 📁 Структура проекта

```
burger-deluxe/
├── backend/
│   ├── src/
│   │   ├── config/          # Конфигурация БД
│   │   ├── controllers/     # API контроллеры
│   │   ├── middleware/      # Middleware (auth, upload, и т.д.)
│   │   ├── models/          # Mongoose модели
│   │   ├── routes/          # API маршруты
│   │   ├── services/        # Сервисы интеграции
│   │   ├── utils/           # Утилиты
│   │   ├── server.ts        # Основной сервер
│   │   └── seed.ts          # Тестовые данные
│   ├── uploads/dishes/      # Загруженные изображения
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   │   ├── ui/          # shadcn/ui компоненты
│   │   │   ├── layout/      # Лейаут компоненты
│   │   │   └── common/      # Общие компоненты
│   │   ├── features/        # Функциональные компоненты
│   │   ├── pages/           # Страницы
│   │   ├── hooks/           # Кастомные хуки
│   │   ├── store/           # Zustand store
│   │   ├── services/        # API клиенты
│   │   ├── types/           # TypeScript типы
│   │   └── lib/             # Утилиты
│   └── package.json
│
└── README.md
```

## 🚀 Запуск проекта

### Предварительные требования
- Node.js 18+ 
- MongoDB 6+
- npm или yarn

### 1. Клонирование и установка зависимостей

```bash
# Перейти в папку проекта
cd burger-deluxe

# Установить зависимости для backend
cd backend
npm install

# Установить зависимости для frontend
cd ../frontend
npm install
```

### 2. Настройка переменных окружения

Создать файл `.env` в папке `backend` на основе `.env.example`:

```bash
# В папке backend
cp .env.example .env
```

Отредактировать `.env`:
```env
# MongoDB подключение
MONGODB_URI=mongodb://localhost:27017/burger-deluxe

# JWT секретный ключ
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Порт сервера
PORT=5000

# URL фронтенда (для CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. Запуск MongoDB

Убедиться, что MongoDB запущена локально или использовать MongoDB Atlas.

### 4. Заполнение тестовыми данными

```bash
# В папке backend
npm run seed
```

Это создаст:
- **20 блюд** в 6 категориях
- **Администратора**: `admin@burgerdeluxe.com` / `admin123`
- **Тестового пользователя**: `test@example.com` / `test123`

### 5. Запуск серверов

#### Вариант 1: Раздельный запуск

```bash
# Терминал 1: Backend (порт 5000)
cd backend
npm run dev

# Терминал 2: Frontend (порт 5173)
cd frontend  
npm run dev
```

#### Вариант 2: Одновременный запуск (рекомендуется)

```bash
# Установить concurrently глобально
npm install -g concurrently

# В корневой папке проекта
concurrently "cd backend && npm run dev" "cd frontend && npm run dev" --names "API,WEB" --prefix-colors "blue,green"
```

### 6. Открыть приложение

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/health

## 🎯 Основные endpoints API

### Авторизация
```
POST /api/auth/register     # Регистрация
POST /api/auth/login        # Вход
POST /api/auth/logout       # Выход
GET  /api/auth/me          # Текущий пользователь
PUT  /api/auth/profile     # Обновить профиль
```

### Блюда
```
GET  /api/dishes                  # Все блюда (с фильтрами)
GET  /api/dishes/popular         # Популярные блюда
GET  /api/dishes/categories      # Категории
GET  /api/dishes/:id            # Блюдо по ID
```

### Корзина
```
GET    /api/cart               # Получить корзину
POST   /api/cart/add          # Добавить в корзину
PUT    /api/cart/item/:id     # Обновить количество
DELETE /api/cart/item/:id     # Удалить из корзины
```

### Заказы
```
POST /api/orders              # Создать заказ
GET  /api/orders             # Заказы пользователя
GET  /api/orders/:id         # Заказ по ID
PUT  /api/orders/:id/cancel  # Отменить заказ
```

### Админ
```
GET    /api/admin/dishes        # Все блюда (админ)
POST   /api/admin/dishes        # Создать блюдо
PUT    /api/admin/dishes/:id    # Обновить блюдо
DELETE /api/admin/dishes/:id    # Удалить блюдо
GET    /api/admin/orders        # Все заказы
PUT    /api/admin/orders/:id/status  # Обновить статус заказа
GET    /api/admin/stats         # Статистика
```

### Интеграции (заглушки)
```
POST /api/sync/moysklad      # Синхронизация с МойСклад
POST /api/sync/1c           # Синхронизация с 1С
```

## 👤 Тестовые аккаунты

**Администратор:**
- Email: `admin@burgerdeluxe.com`
- Пароль: `admin123`

**Обычный пользователь:**
- Email: `test@example.com`  
- Пароль: `test123`

## 📝 Дополнительные команды

### Backend
```bash
npm run dev      # Разработка с nodemon
npm run build    # Сборка TypeScript
npm run start    # Запуск production
npm run seed     # Заполнение тестовыми данными
```

### Frontend  
```bash
npm run dev      # Разработка с Vite
npm run build    # Сборка для production
npm run preview  # Предпросмотр production сборки
```

## 🔧 Настройка интеграций

### МойСклад (TODO)
1. Получить токен в личном кабинете МойСклад
2. Добавить в `.env`: `MOYSKLAD_TOKEN=ваш-токен`
3. Реализовать методы в `backend/src/services/moyskladService.ts`

### 1С (TODO)  
1. Настроить HTTP-сервисы в 1С
2. Добавить в `.env`: `ONEC_USERNAME` и `ONEC_PASSWORD`
3. Реализовать методы в `backend/src/services/onecService.ts`

## 🐛 Устранение неполадок

### MongoDB не подключается
- Проверить, запущена ли MongoDB: `mongosh`
- Проверить строку подключения в `.env`

### Ошибки CORS
- Убедиться, что `FRONTEND_URL` в `.env` соответствует адресу фронтенда

### Изображения не загружаются  
- Проверить, что папка `backend/uploads/dishes/` существует
- Проверить права доступа к папке

## 📄 Лицензия

ISC

## 👥 Команда

BurgerDeluxe Team - создано с ❤️ для любителей вкусной еды!