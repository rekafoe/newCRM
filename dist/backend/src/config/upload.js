"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.storage = exports.uploadsDir = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
exports.uploadsDir = path_1.default.resolve(__dirname, '../uploads');
// Ensure uploads directory exists
try {
    fs_1.default.mkdirSync(exports.uploadsDir, { recursive: true });
}
catch { }
exports.storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, exports.uploadsDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname || '');
        cb(null, unique + ext);
    }
});
exports.upload = (0, multer_1.default)({ storage: exports.storage });
