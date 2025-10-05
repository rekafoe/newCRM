"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOrderNumber = exports.validatePhone = exports.validateEmail = void 0;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};
exports.validatePhone = validatePhone;
const validateOrderNumber = (number) => {
    return /^ORD-\d{4}$/.test(number);
};
exports.validateOrderNumber = validateOrderNumber;
