# ✅ Пользователи добавлены в CRM систему

## Что было сделано:

### 1. Добавлены новые пользователи в `backend/src/db.ts`:
- **Иванов Иван** (manager) - ivanov@example.com
- **Петрова Анна** (manager) - petrova@example.com  
- **Сидоров Петр** (manager) - sidorov@example.com
- **Козлова Мария** (manager) - kozlova@example.com
- **Смирнов Алексей** (admin) - smirnov@example.com
- **Волкова Елена** (viewer) - volkova@example.com

### 2. Создан файл `backend/USERS_INFO.md` с полной информацией о всех пользователях

### 3. Создан тестовый скрипт `backend/test-login.js` для проверки входа

## Всего пользователей в системе: 10

### Администраторы (2):
- Админ (admin-token-123)
- Смирнов Алексей (admin-token-alex)

### Менеджеры (6):
- Менеджер 1 (manager-token-111)
- Менеджер 2 (manager-token-222)
- Войтюшкевич Максим (manager-token-maksim)
- Иванов Иван (manager-token-ivan)
- Петрова Анна (manager-token-anna)
- Сидоров Петр (manager-token-petr)
- Козлова Мария (manager-token-maria)

### Наблюдатели (2):
- Наблюдатель (viewer-token-333)
- Волкова Елена (viewer-token-elena)

## Как использовать:

1. **Для API запросов** - используйте API токен в заголовке:
   ```
   Authorization: Bearer <API_TOKEN>
   ```

2. **Для фронтенда** - используйте email и пароль из таблицы в `USERS_INFO.md`

3. **Пароли** - все пароли простые (например: admin123, ivan123, anna123)

## Сервер запущен и готов к работе! 🚀

Все пользователи будут автоматически созданы при первом запуске сервера.
