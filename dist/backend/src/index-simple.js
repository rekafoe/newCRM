"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const app_1 = require("./config/app");
const middleware_1 = require("./middleware");
const routes_1 = __importDefault(require("./routes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Basic middleware
app.use((0, cors_1.default)({ origin: app_1.config.corsOrigin }));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Health check (before auth middleware)
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Authentication middleware
app.use(middleware_1.authMiddleware);
// Routes
app.use('/api', routes_1.default);
// Error handling
app.use(middleware_1.errorHandler);
// Initialize database and start server
async function startServer() {
    try {
        console.log('🔄 Initializing database...');
        await (0, database_1.initDB)();
        console.log('✅ Database initialized');
        const port = process.env.PORT || 3001;
        console.log(`🔄 Starting server on port ${port}...`);
        app.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
            console.log(`🌐 API available at http://localhost:${port}/api`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
