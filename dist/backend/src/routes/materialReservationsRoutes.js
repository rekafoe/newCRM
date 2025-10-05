"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const materialReservationController_1 = require("../controllers/materialReservationController");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
// Инициализация контроллера с базой данных
let reservationController = null;
const getReservationController = async () => {
    if (!reservationController) {
        const database = await (0, database_1.getDb)();
        reservationController = new materialReservationController_1.MaterialReservationController(database);
    }
    return reservationController;
};
// Создать резервирование
router.post('/', async (req, res) => {
    const controller = await getReservationController();
    await controller.createReservation(req, res);
});
// Получить все резервирования
router.get('/', async (req, res) => {
    const controller = await getReservationController();
    await controller.getAllReservations(req, res);
});
// Получить резервирования по материалу
router.get('/material/:materialId', async (req, res) => {
    const controller = await getReservationController();
    await controller.getReservationsByMaterial(req, res);
});
// Получить доступное количество материала
router.get('/available/:materialId', async (req, res) => {
    const controller = await getReservationController();
    await controller.getAvailableQuantity(req, res);
});
// Обновить резервирование
router.put('/:id', async (req, res) => {
    const controller = await getReservationController();
    await controller.updateReservation(req, res);
});
// Отменить резервирование
router.post('/:id/cancel', async (req, res) => {
    const controller = await getReservationController();
    await controller.cancelReservation(req, res);
});
// Выполнить резервирование (списать со склада)
router.post('/:id/fulfill', async (req, res) => {
    const controller = await getReservationController();
    await controller.fulfillReservation(req, res);
});
// Очистить истекшие резервирования
router.post('/cleanup/expired', async (req, res) => {
    const controller = await getReservationController();
    await controller.cleanupExpiredReservations(req, res);
});
exports.default = router;
