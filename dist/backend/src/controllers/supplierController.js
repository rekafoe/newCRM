"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierController = void 0;
const services_1 = require("../services");
class SupplierController {
    static async getAllSuppliers(req, res) {
        try {
            const suppliers = await services_1.SupplierService.getAllSuppliers();
            res.json(suppliers);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getActiveSuppliers(req, res) {
        try {
            const suppliers = await services_1.SupplierService.getActiveSuppliers();
            res.json(suppliers);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getSupplierById(req, res) {
        try {
            const id = Number(req.params.id);
            const supplier = await services_1.SupplierService.getSupplierById(id);
            if (!supplier) {
                res.status(404).json({ error: 'Поставщик не найден' });
                return;
            }
            res.json(supplier);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async createSupplier(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const supplier = req.body;
            const result = await services_1.SupplierService.createSupplier(supplier);
            res.status(201).json(result);
        }
        catch (error) {
            const status = error.status || 500;
            res.status(status).json({ error: error.message });
        }
    }
    static async updateSupplier(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const id = Number(req.params.id);
            const supplier = req.body;
            const result = await services_1.SupplierService.updateSupplier(id, supplier);
            if (!result) {
                res.status(404).json({ error: 'Поставщик не найден' });
                return;
            }
            res.json(result);
        }
        catch (error) {
            const status = error.status || 500;
            res.status(status).json({ error: error.message });
        }
    }
    static async deleteSupplier(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const id = Number(req.params.id);
            await services_1.SupplierService.deleteSupplier(id);
            res.status(204).end();
        }
        catch (error) {
            const status = error.status || 500;
            res.status(status).json({ error: error.message });
        }
    }
    static async getSupplierStats(req, res) {
        try {
            const stats = await services_1.SupplierService.getSupplierStats();
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getSupplierMaterials(req, res) {
        try {
            const id = Number(req.params.id);
            const materials = await services_1.SupplierService.getSupplierMaterials(id);
            res.json(materials);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.SupplierController = SupplierController;
