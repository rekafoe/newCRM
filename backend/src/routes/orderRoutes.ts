import { Router, Request, Response, NextFunction } from 'express';
import knex from '../db';

const router = Router();

// Удалить заказ целиком
router.delete(
  '/orders/:orderId',
  async (req, res, next) => {
    try {
      const deleted = await knex('orders')
        .where('id', req.params.orderId)
        .del();
      if (!deleted) return res.status(404).json({ message: 'Заказ не найден' });
      // order_items удалятся автоматически по ON DELETE CASCADE
      res.sendStatus(204);
    } catch (e) { next(e); }
  }
);

// Удалить конкретную позицию
router.delete(
  '/orders/:orderId/items/:itemId',
  async (req, res, next) => {
    try {
      const { orderId, itemId } = req.params;
      const exists = await knex('order_items')
        .where({ id: itemId, order_id: orderId })
        .first();
      if (!exists) return res.status(404).json({ message: 'Позиция не найдена' });

      await knex('order_items').where('id', itemId).del();

      // Пересчёт суммы заказа
      const items = await knex('order_items').where('order_id', orderId);
      const newTotal = items.reduce(
        (sum, i) => sum + Number(i.unit_price) * i.quantity,
        0
      );
      await knex('orders')
        .where('id', orderId)
        .update({ total_amount: newTotal });

      res.sendStatus(204);
    } catch (e) { next(e); }
  }
);

export default router;
