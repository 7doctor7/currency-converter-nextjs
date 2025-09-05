#!/bin/bash

# Скрипт для деплоя приложения в Vercel
# Использование: ./deploy.sh [environment]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверяем, установлен ли Vercel CLI
if ! command -v vercel &> /dev/null; then
    error "Vercel CLI не установлен. Установите его командой: npm i -g vercel"
    exit 1
fi

# Проверяем, авторизован ли пользователь в Vercel
if ! vercel whoami &> /dev/null; then
    error "Вы не авторизованы в Vercel. Выполните: vercel login"
    exit 1
fi

# Получаем окружение (по умолчанию production)
ENVIRONMENT=${1:-production}

log "Начинаем деплой приложения в Vercel..."
log "Окружение: $ENVIRONMENT"

# Проверяем, что мы в корневой папке проекта
if [ ! -f "package.json" ]; then
    error "package.json не найден. Убедитесь, что вы находитесь в корневой папке проекта."
    exit 1
fi

# Проверяем, что все зависимости установлены
if [ ! -d "node_modules" ]; then
    log "Устанавливаем зависимости..."
    npm install
fi

# Проверяем сборку
log "Проверяем сборку приложения..."
npm run build

if [ $? -eq 0 ]; then
    success "Сборка прошла успешно!"
else
    error "Ошибка при сборке приложения"
    exit 1
fi

# Деплоим в Vercel
log "Деплоим в Vercel..."

if [ "$ENVIRONMENT" = "production" ]; then
    vercel --prod
else
    vercel
fi

if [ $? -eq 0 ]; then
    success "Деплой завершен успешно!"
    log "Приложение доступно по адресу, который показал Vercel"
else
    error "Ошибка при деплое"
    exit 1
fi

# Показываем информацию о переменных окружения
warning "Не забудьте настроить переменные окружения в Vercel Dashboard:"
echo "  - NEXT_PUBLIC_API_URL"
echo "  - NEXT_PUBLIC_API_KEY"
echo "  - NEXT_PUBLIC_CACHE_KEY"
echo "  - NEXT_PUBLIC_CACHE_DURATION"

success "Готово! 🚀"
