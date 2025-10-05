"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
router.post('/login', (0, middleware_1.asyncHandler)(controllers_1.AuthController.login));
router.get('/me', (0, middleware_1.asyncHandler)(controllers_1.AuthController.getCurrentUser));
exports.default = router;
