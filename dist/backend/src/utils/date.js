"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentTimestamp = exports.getTodayString = void 0;
const getTodayString = () => {
    return new Date().toISOString().slice(0, 10);
};
exports.getTodayString = getTodayString;
const getCurrentTimestamp = () => {
    return new Date().toISOString();
};
exports.getCurrentTimestamp = getCurrentTimestamp;
