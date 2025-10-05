"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.getDb = exports.initDB = void 0;
const db_1 = require("../db");
Object.defineProperty(exports, "initDB", { enumerable: true, get: function () { return db_1.initDB; } });
let dbInstance = null;
const getDb = async () => {
    if (!dbInstance) {
        dbInstance = await (0, db_1.initDB)();
    }
    return dbInstance;
};
exports.getDb = getDb;
exports.db = {
    get: async (sql, ...params) => {
        const database = await (0, exports.getDb)();
        return database.get(sql, ...params);
    },
    all: async (sql, ...params) => {
        const database = await (0, exports.getDb)();
        return database.all(sql, ...params);
    },
    run: async (sql, ...params) => {
        const database = await (0, exports.getDb)();
        const result = await database.run(sql, ...params);
        return { lastID: result.lastID, changes: result.changes || 0 };
    }
};
