# Claude - Правила работы с проектом SV Express

## Обзор проекта

SV Express - это full-stack приложение для управления международными доставками посылок. Проект использует monorepo архитектуру с несколькими packages.

## Стек технологий

- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (Supabase)
- **Frontend:** React + Vite + Tailwind CSS
- **Deployment:** Vercel (serverless functions)
- **Authentication:** JWT

## Структура проекта

```
packages/
├── shared/     # Общие типы, константы, утилиты
├── landing/    # Статический лендинг (Vanilla JS, Tailwind)
├── api/        # Backend API (Express, TypeScript)
├── admin/      # Админ-панель (React, TypeScript, Tailwind)
└── portal/     # Пользовательский портал (React, TypeScript, Tailwind)
```

## Правила разработки

### 1. Придерживаться архитектуры

**Backend (API):**
- Слоистая архитектура: Routes → Controllers → Services → Repositories
- Не смешивать бизнес-логику с маршрутами
- Использовать middleware для auth, validation, errors
- Всегда использовать TypeScript типы из `packages/shared`

**Frontend (Admin/Portal):**
- Компонентный подход: разделять на common, feature-specific компоненты
- Использовать custom hooks для переиспользуемой логики
- Context API для глобального состояния (auth, user)
- API клиенты должны быть в отдельных файлах

### 2. TypeScript Типы

- **ВСЕГДА** использовать типы из `packages/shared/src/types`
- НЕ дублировать типы между packages
- Использовать `interface` для объектов данных
- Использовать `type` для unions и сложных типов

Пример:
```typescript
// ✅ ПРАВИЛЬНО
import { User, Shipment } from '@sv-express/shared';

// ❌ НЕПРАВИЛЬНО
interface User { ... } // дублирование типа
```

### 3. Именование файлов и папок

**Backend:**
- Controllers: `{entity}.controller.ts` (например, `auth.controller.ts`)
- Services: `{entity}.service.ts`
- Routes: `{entity}.routes.ts`
- Repositories: `{entity}.repository.ts`

**Frontend:**
- Components: PascalCase (`UserCard.tsx`, `ShipmentsList.tsx`)
- Hooks: camelCase с префиксом `use` (`useAuth.ts`, `useShipments.ts`)
- Pages: PascalCase (`Dashboard.tsx`, `Login.tsx`)
- API clients: camelCase с суффиксом `.api.ts` (`auth.api.ts`)

### 4. Стилизация (Tailwind CSS)

- Использовать Tailwind классы напрямую в компонентах
- Избегать custom CSS кроме глобальных стилей
- Использовать существующую цветовую схему:
  - Primary: blue-600
  - Accent: orange-500 (#F5A623)
  - Success: green-600
  - Danger: red-600
  - Text: slate-900, slate-600, slate-400

### 5. Обработка ошибок

**Backend:**
```typescript
// Использовать централизованный error middleware
throw new Error('User not found'); // перехватится middleware
// ИЛИ
res.status(404).json({ error: 'User not found' });
```

**Frontend:**
```typescript
// Использовать try/catch с user-friendly сообщениями
try {
  await api.createShipment(data);
  toast.success('Shipment created successfully');
} catch (error) {
  toast.error('Failed to create shipment');
}
```

### 6. Аутентификация

- JWT токены хранить в httpOnly cookies (предпочтительно) или localStorage
- Каждый API запрос должен включать Bearer token в header
- Проверять роль пользователя (admin/customer) перед доступом к функционалу
- Использовать middleware `requireAuth` и `requireAdmin`

### 7. Базы данных

- **ВСЕГДА** использовать parameterized queries (защита от SQL injection)
- Использовать Supabase client для всех DB операций
- Добавлять индексы на часто используемые колонки
- Использовать транзакции для связанных операций

### 8. Валидация данных

**Backend:**
```typescript
// Валидировать все входящие данные
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const validatedData = schema.parse(req.body);
```

**Frontend:**
```typescript
// Использовать HTML5 validation + дополнительную валидацию
<input type="email" required />
```

### 9. Константы и конфигурация

- Все константы (страны, статусы, цены) хранить в `packages/shared/src/constants`
- Environment variables читать из `.env` файлов
- НЕ хардкодить API URLs, использовать env variables

### 10. Git Workflow

**Commits:**
- Использовать осмысленные commit messages на английском
- Формат: `feat: add user authentication` или `fix: resolve CORS issue`
- Типы: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Branches:**
- `main` - production code
- `develop` - development branch
- `feature/*` - новые функции
- `fix/*` - исправления багов

## Специфичные правила для компонентов

### API Endpoints

- Всегда возвращать consistent JSON response:
```typescript
// Success
{ success: true, data: { ... } }

// Error
{ success: false, error: 'Error message' }
```

- HTTP status codes:
  - 200 - Success
  - 201 - Created
  - 400 - Bad Request
  - 401 - Unauthorized
  - 403 - Forbidden
  - 404 - Not Found
  - 500 - Internal Server Error

### React Components

- Функциональные компоненты (не классовые)
- TypeScript с явными типами props
- Использовать React hooks
- Деструктуризация props

```typescript
interface Props {
  user: User;
  onUpdate: (user: User) => void;
}

export const UserCard: React.FC<Props> = ({ user, onUpdate }) => {
  // component logic
};
```

### State Management

- Local state: `useState`
- Shared state: React Context
- Server state: React Query (опционально) или custom hooks
- НЕ использовать Redux (слишком сложно для этого проекта)

## Безопасность

1. **НЕ коммитить:**
   - `.env` файлы
   - API keys
   - Пароли
   - Sensitive данные

2. **Всегда:**
   - Хешировать пароли (bcrypt)
   - Проверять JWT токены
   - Валидировать input
   - Использовать HTTPS в production

3. **Rate Limiting:**
   - Применять на login/register endpoints
   - Ограничивать API calls

## Performance

1. **Backend:**
   - Использовать database indexes
   - Кешировать частые запросы
   - Пагинация для больших списков

2. **Frontend:**
   - Lazy loading для routes
   - Code splitting
   - Оптимизировать images
   - Мemoization для дорогих вычислений

## Тестирование

- **Backend:** Unit тесты для services и controllers
- **Frontend:** Component тесты для критичных компонентов
- **E2E:** Тестировать основные user flows

## Документация

**Когда добавлять комментарии:**
- Сложная бизнес-логика
- Non-obvious решения
- API endpoints (JSDoc)

**Когда НЕ добавлять:**
- Очевидный код
- Self-explanatory функции

**Пример хорошего комментария:**
```typescript
// Calculate price based on weight tiers
// Fragile items have 30% surcharge
// Russia/Belarus have different pricing
const calculatePrice = (weight, type, route) => {
  // ...
}
```

## Приоритеты при разработке

1. **Безопасность** - никогда не компрометировать
2. **Функциональность** - код должен работать правильно
3. **Читаемость** - код должен быть понятен другим
4. **Performance** - оптимизировать где нужно
5. **Красота кода** - последний приоритет

## Что делать при возникновении проблем

1. Проверить console/logs для ошибок
2. Проверить environment variables
3. Проверить database connection
4. Проверить CORS settings
5. Прочитать документацию (docs/)
6. Посмотреть похожие решения в кодебазе
7. Спросить в GitHub issues

## Специфика Claude AI

Когда работаешь с этим проектом:

1. **Читай существующий код** перед созданием нового
2. **Следуй patterns** которые уже есть в проекте
3. **Не изобретай велосипед** - используй существующие компоненты/утилиты
4. **Спрашивай уточнения** если требования неясны
5. **Предлагай альтернативы** если видишь лучшее решение
6. **Объясняй изменения** которые вносишь

## Чего НЕ делать

1. ❌ НЕ удалять существующий работающий код без причины
2. ❌ НЕ менять архитектуру без обсуждения
3. ❌ НЕ коммитить commented code
4. ❌ НЕ использовать `any` в TypeScript
5. ❌ НЕ хардкодить sensitive данные
6. ❌ НЕ игнорировать TypeScript/ESLint ошибки
7. ❌ НЕ создавать огромные файлы (>300 строк)
8. ❌ НЕ дублировать логику между компонентами

## Полезные команды

```bash
# Форматирование кода
npm run format

# Lint
npm run lint

# Type check
npm run type-check

# Build all
npm run build

# Clean install
rm -rf node_modules package-lock.json && npm install
```

## Контакты и ресурсы

- **GitHub Repo:** https://github.com/ddbro1-beep/sv-express
- **Production:** https://sv-express-one.vercel.app
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard

---

**Помни:** Код пишется один раз, но читается много раз. Пиши для людей, а не для машин.
