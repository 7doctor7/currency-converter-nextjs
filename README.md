# Currency Converter

https://currency-converter-nextjs-omega.vercel.app/

Приложение для конвертации валют в реальном времени с поддержкой оффлайн режима.

### Основные возможности
- ✅ Конвертация валют в реальном времени
- ✅ Поддержка ввода с точкой и запятой как разделителем
- ✅ Быстрый обмен валют местами
- ✅ Поиск валют по коду и названию
- ✅ Клавиатурная навигация в модальном окне (↑/↓, Enter, Esc)
- ✅ Автоматическое сохранение последней пары валют и суммы
- ✅ Обновление результата при вводе с debounce (250ms)

### Кеширование и оффлайн поддержка
- ✅ Сохранение курсов в localStorage на 5 минут
- ✅ Автоматическое фоновое обновление при возвращении онлайн
- ✅ Отображение времени последнего обновления
- ✅ Индикатор использования кешированных данных
- ✅ Кнопка ручного обновления курсов

### Обработка ошибок
- ✅ Дружелюбные сообщения об ошибках
- ✅ Состояния загрузки со спиннерами
- ✅ Fallback на кешированные данные при сбоях API

## Технические решения

### Архитектура
- **Framework**: Next.js 15 с App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: React hooks + localStorage
- **API**: fxratesapi.com
- **Currencies**: Динамически загружаются из `public/currencies.json` с полной информацией о валютах (флаги, символы, коды стран)

### Hooks и утилиты
- `useLocalStorage` - работа с localStorage
- `useNetworkStatus` - отслеживание статуса сети
- `useDebounce` - задержка для оптимизации запросов
- `CurrencyAPI` - API клиент с кешированием

### Производительность
- ✅ React.memo для предотвращения ненужных ре-рендеров
- ✅ useMemo для тяжелых вычислений
- ✅ useCallback для стабильных функций
- ✅ Debounce для ввода пользователя
- ✅ Кеширование API ответов

## Установка и запуск

### Требования
- Node.js 18+ 
- npm или yarn

### Установка
```bash
# Клонирование репозитория
git clone https://github.com/7doctor7/currency-converter-nextjs
cd currency-converter

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev
```

### Конфигурация
Приложение использует переменные окружения для настройки. Создайте `.env` с переменными:

```bash
# Environment configuration
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=https://api.fxratesapi.com/latest
NEXT_PUBLIC_API_KEY=your_api_key

# Cache Configuration
NEXT_PUBLIC_CACHE_KEY=currency_rates_cache
NEXT_PUBLIC_CACHE_DURATION=300000
```

**Переменные окружения:**
- `NODE_ENV` - режим работы (development/production)
- `NEXT_PUBLIC_API_URL` - URL API для получения курсов валют
- `NEXT_PUBLIC_API_KEY` - API ключ для FXRatesAPI
- `NEXT_PUBLIC_CACHE_KEY` - ключ для кеширования в localStorage
- `NEXT_PUBLIC_CACHE_DURATION` - время жизни кеша в миллисекундах (по умолчанию 5 минут)

### Доступные команды
```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для продакшена  
npm run start        # Запуск продакшен сборки
npm run lint         # Проверка кода ESLint
```
