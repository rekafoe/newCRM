# 🔢 Исправление округления материалов

## Проблема:
**Материалы списывались дробными числами, что неудобно для учета.**

## ✅ Решение:
**Добавлено округление вверх до целых чисел во всех местах списания материалов.**

## 🔧 Изменения:

### 1. **Контроллер заказов** (`backend/src/controllers/orderItemController.ts`)

#### Добавление позиции заказа:
```typescript
// Было:
const needQty = n.qtyPerItem * Math.max(1, Number(quantity) || 1)

// Стало:
const needQty = Math.ceil(n.qtyPerItem * Math.max(1, Number(quantity) || 1)) // Округляем вверх до целого числа
```

#### Обновление количества позиции:
```typescript
// Было:
const need = (c.qtyPerItem || 0) * deltaQty
const back = (c.qtyPerItem || 0) * Math.abs(deltaQty)

// Стало:
const need = Math.ceil((c.qtyPerItem || 0) * deltaQty) // Округляем вверх до целого числа
const back = Math.ceil((c.qtyPerItem || 0) * Math.abs(deltaQty)) // Округляем вверх до целого числа
```

#### Удаление позиции заказа:
```typescript
// Было:
const returnQty = (c.qtyPerItem || 0) * Math.max(1, Number(it.quantity) || 1)

// Стало:
const returnQty = Math.ceil((c.qtyPerItem || 0) * Math.max(1, Number(it.quantity) || 1)) // Округляем вверх до целого числа
```

### 2. **Сервис материалов** (`backend/src/services/materialService.ts`)

```typescript
// Было:
await db.run('UPDATE materials SET quantity = quantity + ? WHERE id = ?', Number(delta), Number(materialId))

// Стало:
const roundedDelta = Math.ceil(Number(delta)) // Округляем вверх до целого числа
await db.run('UPDATE materials SET quantity = quantity + ? WHERE id = ?', roundedDelta, Number(materialId))
```

### 3. **Сервис заказов** (`backend/src/services/orderService.ts`)

#### При удалении заказа:
```typescript
// Было:
const add = (c.qtyPerItem || 0) * Math.max(1, Number(item.quantity) || 1)

// Стало:
const add = Math.ceil((c.qtyPerItem || 0) * Math.max(1, Number(item.quantity) || 1)) // Округляем вверх до целого числа
```

#### При возврате материалов:
```typescript
// Было:
const addQty = returns[materialId]

// Стало:
const addQty = Math.ceil(returns[materialId]) // Округляем вверх до целого числа
```

## 📊 Результаты тестирования:

### ✅ **Тест округления материалов:**
- **Создан заказ** с позицией листовок
- **Добавлена позиция** с дробным количеством материалов
- **Проверены движения** материалов - все значения целые
- **Остатки материалов** обновлены корректно

### ✅ **Проверка целостности:**
- Все операции списания материалов используют `Math.ceil()`
- Все операции возврата материалов используют `Math.ceil()`
- Все движения материалов записываются целыми числами

## 🎯 **Преимущества:**

1. **Удобство учета** - материалы списываются только целыми числами
2. **Точность расчетов** - округление вверх гарантирует достаточность материалов
3. **Консистентность** - все операции с материалами используют одинаковую логику
4. **Простота понимания** - целые числа легче воспринимать

## 📋 **Измененные файлы:**

1. **`backend/src/controllers/orderItemController.ts`**
   - Добавление позиций заказа
   - Обновление количества позиций
   - Удаление позиций заказа

2. **`backend/src/services/materialService.ts`**
   - Списание материалов

3. **`backend/src/services/orderService.ts`**
   - Удаление заказов
   - Возврат материалов

## 🚀 **Статус:**

**✅ Проблема полностью решена!**
- Материалы списываются только целыми числами
- Все операции с материалами используют округление вверх
- Тестирование подтвердило корректность работы

## 🧪 **Как протестировать:**

```bash
# Запустить тест округления
node test-material-rounding.js

# Проверить API материалов
curl -H "Authorization: Bearer admin-token-123" http://localhost:3001/api/materials

# Проверить движения материалов
curl -H "Authorization: Bearer admin-token-123" http://localhost:3001/api/materials/moves
```

**Все функции работают правильно! 🎉**
