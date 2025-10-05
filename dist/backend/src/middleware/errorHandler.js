"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const app_1 = require("../config/app");
const errorHandler = (err, req, res, _next) => {
    const showStack = (app_1.config.nodeEnv !== 'production') && app_1.config.showErrorStack;
    const timestamp = new Date().toISOString();
    // Определяем тип ошибки и статус
    let status = err.status || 500;
    let message = err.message || 'Internal Server Error';
    let code = err.code || 'INTERNAL_ERROR';
    // Обработка специфических ошибок
    if (err.name === 'ValidationError') {
        status = 400;
        code = 'VALIDATION_ERROR';
    }
    else if (err.name === 'UnauthorizedError') {
        status = 401;
        code = 'UNAUTHORIZED';
    }
    else if (err.name === 'ForbiddenError') {
        status = 403;
        code = 'FORBIDDEN';
    }
    else if (err.name === 'NotFoundError') {
        status = 404;
        code = 'NOT_FOUND';
    }
    else if (err.name === 'ConflictError') {
        status = 409;
        code = 'CONFLICT';
    }
    const payload = {
        error: message,
        code,
        timestamp,
        path: req.path,
        method: req.method
    };
    if (showStack) {
        payload.stack = err.stack;
        payload.details = err.details;
    }
    // Структурированное логирование
    const logData = {
        level: 'error',
        message,
        code,
        status,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        stack: showStack ? err.stack : undefined,
        details: err.details,
        timestamp
    };
    try {
        console.error(JSON.stringify(logData));
    }
    catch (logError) {
        console.error('Failed to log error:', logError);
    }
    res.status(status).json(payload);
};
exports.errorHandler = errorHandler;
