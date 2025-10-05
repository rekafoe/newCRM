"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const routes_1 = __importDefault(require("./routes"));
// Optional: Sentry setup
if (config_1.config.sentryDsn) {
    try {
        // Lazy import to avoid dependency if not configured
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Sentry = require('@sentry/node');
        Sentry.init({ dsn: config_1.config.sentryDsn });
        console.log(JSON.stringify({ level: 'info', msg: 'Sentry initialized' }));
    }
    catch { }
}
async function main() {
    const app = (0, express_1.default)();
    // CORS
    app.use((0, cors_1.default)({ origin: config_1.config.corsOrigin }));
    // Body parsing
    app.use(express_1.default.json());
    // Static files
    app.use('/uploads', express_1.default.static(config_1.uploadsDir));
    app.use('/api/uploads', express_1.default.static(config_1.uploadsDir));
    // Auth middleware
    app.use(middleware_1.authMiddleware);
    // API routes
    app.use('/api', routes_1.default);
    // Error handling
    app.use(middleware_1.errorHandler);
    // Start server
    app.listen(config_1.config.port, '0.0.0.0', () => {
        try {
            console.log(JSON.stringify({ level: 'info', msg: 'API started', port: config_1.config.port }));
        }
        catch {
            console.log(`🚀 API running at http://localhost:${config_1.config.port}`);
        }
    });
}
main().catch(err => {
    console.error('⛔ Fatal startup error:', err);
    process.exit(1);
});
