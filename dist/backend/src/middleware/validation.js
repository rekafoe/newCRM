"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idValidation = exports.loginValidation = exports.userValidation = exports.materialValidation = exports.orderItemValidation = exports.orderValidation = exports.validate = void 0;
const validate = (options) => {
    return (req, res, next) => {
        const errors = [];
        // Валидация body
        if (options.body) {
            const bodyErrors = validateFields(req.body, options.body, 'body');
            errors.push(...bodyErrors);
        }
        // Валидация query
        if (options.query) {
            const queryErrors = validateFields(req.query, options.query, 'query');
            errors.push(...queryErrors);
        }
        // Валидация params
        if (options.params) {
            const paramsErrors = validateFields(req.params, options.params, 'params');
            errors.push(...paramsErrors);
        }
        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors,
                code: 'VALIDATION_ERROR'
            });
        }
        next();
    };
};
exports.validate = validate;
function validateFields(data, rules, source) {
    const errors = [];
    for (const rule of rules) {
        const value = data[rule.field];
        const fieldPath = `${source}.${rule.field}`;
        // Проверка обязательности
        if (rule.required && (value === undefined || value === null || value === '')) {
            errors.push(`${fieldPath} is required`);
            continue;
        }
        // Пропускаем необязательные пустые поля
        if (!rule.required && (value === undefined || value === null || value === '')) {
            continue;
        }
        // Проверка типа
        if (rule.type && !validateType(value, rule.type)) {
            errors.push(`${fieldPath} must be of type ${rule.type}`);
            continue;
        }
        // Проверка длины строки
        if (rule.type === 'string' && typeof value === 'string') {
            if (rule.minLength && value.length < rule.minLength) {
                errors.push(`${fieldPath} must be at least ${rule.minLength} characters long`);
            }
            if (rule.maxLength && value.length > rule.maxLength) {
                errors.push(`${fieldPath} must be no more than ${rule.maxLength} characters long`);
            }
        }
        // Проверка числовых значений
        if (rule.type === 'number' && typeof value === 'number') {
            if (rule.min !== undefined && value < rule.min) {
                errors.push(`${fieldPath} must be at least ${rule.min}`);
            }
            if (rule.max !== undefined && value > rule.max) {
                errors.push(`${fieldPath} must be no more than ${rule.max}`);
            }
        }
        // Проверка паттерна
        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
            errors.push(`${fieldPath} format is invalid`);
            continue;
        }
        // Кастомная валидация
        if (rule.custom) {
            const result = rule.custom(value);
            if (result !== true) {
                errors.push(typeof result === 'string' ? result : `${fieldPath} is invalid`);
            }
        }
    }
    return errors;
}
function validateType(value, type) {
    switch (type) {
        case 'string':
            return typeof value === 'string';
        case 'number':
            return typeof value === 'number' && !isNaN(value);
        case 'boolean':
            return typeof value === 'boolean';
        case 'email':
            return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        case 'url':
            try {
                new URL(value);
                return true;
            }
            catch {
                return false;
            }
        case 'date':
            return value instanceof Date || !isNaN(Date.parse(value));
        default:
            return true;
    }
}
// Предустановленные валидации для часто используемых схем
exports.orderValidation = (0, exports.validate)({
    body: [
        { field: 'customerName', required: true, type: 'string', minLength: 1, maxLength: 255 },
        { field: 'customerPhone', required: true, type: 'string', pattern: /^[\+]?[0-9\s\-\(\)]+$/ },
        { field: 'customerEmail', type: 'email' },
        { field: 'totalAmount', required: true, type: 'number', min: 0 },
        { field: 'status', required: true, type: 'string' },
        { field: 'notes', type: 'string', maxLength: 1000 }
    ]
});
exports.orderItemValidation = (0, exports.validate)({
    body: [
        { field: 'productName', required: true, type: 'string', minLength: 1, maxLength: 255 },
        { field: 'quantity', required: true, type: 'number', min: 1 },
        { field: 'price', required: true, type: 'number', min: 0 },
        { field: 'total', required: true, type: 'number', min: 0 }
    ]
});
exports.materialValidation = (0, exports.validate)({
    body: [
        { field: 'name', required: true, type: 'string', minLength: 1, maxLength: 255 },
        { field: 'description', type: 'string', maxLength: 1000 },
        { field: 'price', required: true, type: 'number', min: 0 },
        { field: 'quantity', required: true, type: 'number', min: 0 },
        { field: 'unit', required: true, type: 'string', minLength: 1, maxLength: 50 }
    ]
});
exports.userValidation = (0, exports.validate)({
    body: [
        { field: 'username', required: true, type: 'string', minLength: 3, maxLength: 50 },
        { field: 'email', required: true, type: 'email' },
        { field: 'password', required: true, type: 'string', minLength: 6 },
        { field: 'role', required: true, type: 'string', custom: (value) => ['admin', 'manager', 'user'].includes(value) || 'Role must be admin, manager, or user'
        }
    ]
});
exports.loginValidation = (0, exports.validate)({
    body: [
        { field: 'username', required: true, type: 'string', minLength: 1 },
        { field: 'password', required: true, type: 'string', minLength: 1 }
    ]
});
exports.idValidation = (0, exports.validate)({
    params: [
        { field: 'id', required: true, type: 'number', custom: (value) => !isNaN(Number(value)) && Number(value) > 0 || 'ID must be a positive number'
        }
    ]
});
