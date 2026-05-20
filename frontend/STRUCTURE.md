# Frontend Structure Documentation

## 📁 Директория `src`

Фронтенд переструктурирован для лучшей организации и масштабируемости:

```
src/
├── assets/                  # Статические файлы (изображения, шрифты)
├── components/              # Переиспользуемые компоненты
│   ├── common/             # Общие компоненты (Header, Footer, Toast)
│   ├── algorithm/          # Компоненты для работы с алгоритмами
│   └── auth/               # Компоненты аутентификации
├── hooks/                   # Пользовательские React hooks
├── layouts/                 # Раскладки страниц
├── pages/                   # Страницы приложения
├── services/                # API сервисы и интеграции
├── stores/                  # Context API для управления состоянием
├── styles/                  # Глобальные и компонент-специфичные стили
│   ├── components/         # CSS для компонентов
│   ├── pages/             # CSS для страниц
│   └── global/            # Глобальные стили
├── types/                   # TypeScript типы и интерфейсы
├── utils/                   # Утилиты и помощники
├── App.tsx                  # Главный компонент приложения
├── main.tsx                 # Точка входа
└── index.css               # Глобальные стили
```

## 📚 Структура директорий

### `components/`
Все переиспользуемые компоненты организованы по категориям:
- **common/** - общие компоненты (SiteFooter, ToastHost)
- **algorithm/** - компоненты алгоритмов (PriceMonitorPanel)
- **auth/** - компоненты аутентификации

### `pages/`
Каждая страница приложения (Home, Profile, Login, AlgorithmDetails и т.д.)

### `services/`
- `api.ts` - основной API сервис с методами для запросов к бэкенду

### `stores/`
- `AuthContext.tsx` - Context для управления аутентификацией и состоянием пользователя

### `styles/`
Все CSS файлы организованы по назначению:
- **components/** - стили компонентов
- **pages/** - стили страниц
- Глобальные стили в `index.css`

### `types/`
- `index.ts` - центральное место для всех TypeScript типов и интерфейсов

### `utils/`
- `authUtils.ts` - утилиты для проверки прав доступа
- `apiUtils.ts` - вспомогательные функции для API
- `constants.ts` - константы приложения
- `languageConfig.ts` - конфигурация языков программирования

## 🎨 Импорты компонентов

Все компоненты находятся в соответствующих подпапках `components/`:

```typescript
// Импорт общих компонентов
import ToastHost from './components/common/ToastHost';
import SiteFooter from './components/common/SiteFooter';

// Импорт компонентов алгоритмов
import PriceMonitorPanel from './components/algorithm/PriceMonitorPanel';
```

## 🔧 API сервис

API сервис теперь находится в `services/api.ts`:

```typescript
import { apiService } from './services/api';
```

## 🔐 Аутентификация

Context аутентификации находится в `stores/AuthContext.tsx`:

```typescript
import { useAuth, AuthProvider } from './stores/AuthContext';
```

## 📦 CSS и стили

Все CSS файлы находятся в папке `styles/`:

```typescript
// Импорт CSS страниц
import '../../styles/pages/Home.css';

// Импорт CSS компонентов
import '../../styles/components/ToastHost.css';
```

## ✨ Преимущества новой структуры

1. **Лучшая организация** - файлы сгруппированы логически
2. **Легче найти файлы** - все по своим местам
3. **Масштабируемость** - легко добавлять новые компоненты
4. **Разделение ответственности** - каждая папка имеет четкую роль
5. **Переиспользуемость** - компоненты легко найти и переиспользовать

## 🚀 Добавление новых компонентов

При добавлении нового компонента:

1. Создайте файл в соответствующей папке (`components/common/`, `components/algorithm/` и т.д.)
2. Если нужны стили, создайте CSS файл в `styles/components/`
3. Экспортируйте компонент из соответствующей папки
4. Импортируйте его в нужных местах с правильным путем

## 📝 Пример структуры нового компонента

```
components/
└── algorithm/
    ├── NewComponent.tsx
    └── index.ts (опционально, для re-export)

styles/
└── components/
    └── NewComponent.css
```

```typescript
// NewComponent.tsx
import React from 'react';
import '../../styles/components/NewComponent.css';

const NewComponent: React.FC = () => {
  return <div>New Component</div>;
};

export default NewComponent;
```
