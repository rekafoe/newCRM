"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Basic middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});
// Initialize database and start server
async function startServer() {
    try {
        console.log('🔄 Starting simple server...');
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
