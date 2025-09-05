# Деплой в Vercel

Этот документ содержит инструкции по деплою приложения Currency Converter в Vercel.

## Предварительные требования

1. **GitHub репозиторий** с кодом приложения
2. **Vercel аккаунт** (бесплатный)
3. **API ключ FXRatesAPI** (получить на https://fxratesapi.com/)

## Автоматический деплой через GitHub

### 1. Подключение репозитория к Vercel

1. Войдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Нажмите "New Project"
3. Выберите "Import Git Repository"
4. Подключите ваш GitHub репозиторий
5. Выберите репозиторий с приложением

### 2. Настройка проекта

Vercel автоматически определит настройки Next.js из `vercel.json`:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Настройка переменных окружения

В настройках проекта добавьте следующие переменные:

```
NEXT_PUBLIC_API_URL=https://api.fxratesapi.com/latest
NEXT_PUBLIC_API_KEY=your_fxratesapi_key_here
NEXT_PUBLIC_CACHE_KEY=currency_rates_cache
NEXT_PUBLIC_CACHE_DURATION=300000
```

### 4. Деплой

1. Нажмите "Deploy"
2. Дождитесь завершения сборки
3. Получите URL вашего приложения

## Ручной деплой через CLI

### 1. Установка Vercel CLI

```bash
npm install -g vercel
```

### 2. Авторизация

```bash
vercel login
```

### 3. Деплой

```bash
# Для preview деплоя
./deploy.sh

# Для production деплоя
./deploy.sh production
```

## Настройка переменных окружения в Vercel

### Через Dashboard:

1. Откройте проект в Vercel Dashboard
2. Перейдите в Settings → Environment Variables
3. Добавьте переменные:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://api.fxratesapi.com/latest` | Production, Preview, Development |
| `NEXT_PUBLIC_API_KEY` | `your_api_key` | Production, Preview, Development |
| `NEXT_PUBLIC_CACHE_KEY` | `currency_rates_cache` | Production, Preview, Development |
| `NEXT_PUBLIC_CACHE_DURATION` | `300000` | Production, Preview, Development |

### Через CLI:

```bash
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_API_KEY
vercel env add NEXT_PUBLIC_CACHE_KEY
vercel env add NEXT_PUBLIC_CACHE_DURATION
```

## Автоматические деплои

После подключения репозитория к Vercel:

- **Push в main ветку** → автоматический деплой в production
- **Push в другие ветки** → автоматический деплой preview
- **Pull Request** → автоматический деплой preview для тестирования

## Мониторинг и логи

- **Логи сборки**: Vercel Dashboard → Project → Functions → View Function Logs
- **Метрики**: Vercel Dashboard → Project → Analytics
- **Ошибки**: Vercel Dashboard → Project → Functions → Error Logs

## Оптимизация производительности

### 1. Кеширование

- Статические файлы кешируются автоматически
- API ответы кешируются на 24 часа
- Курсы валют кешируются в localStorage на 5 минут

### 2. CDN

Vercel автоматически использует глобальную CDN для быстрой доставки контента.

### 3. Оптимизация изображений

Next.js автоматически оптимизирует изображения флагов валют.

## Troubleshooting

### Ошибка "API key is required"

Убедитесь, что переменная `NEXT_PUBLIC_API_KEY` установлена в Vercel Dashboard.

### Ошибка сборки

Проверьте логи сборки в Vercel Dashboard. Частые причины:
- Отсутствующие зависимости
- Ошибки TypeScript
- Проблемы с переменными окружения

### Курсы валют не загружаются

1. Проверьте API ключ FXRatesAPI
2. Убедитесь, что API URL правильный
3. Проверьте логи в браузере (F12 → Console)

## Обновление приложения

Для обновления приложения:

1. Внесите изменения в код
2. Сделайте commit и push в GitHub
3. Vercel автоматически задеплоит новую версию

## Откат к предыдущей версии

1. Откройте Vercel Dashboard
2. Перейдите в Deployments
3. Найдите нужную версию
4. Нажмите "Promote to Production"

## Стоимость

- **Hobby план** (бесплатный): 100GB bandwidth, 100GB-hours serverless function execution
- **Pro план** ($20/месяц): 1TB bandwidth, 1000GB-hours serverless function execution

Для большинства случаев достаточно бесплатного плана.
