// backend/src/routes/reportRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import knex from '../db';

const router = Router();

router.get(
  '/daily-reports',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const reports = await knex('daily_reports')
        .orderBy('report_date', 'desc');
      res.json(reports);
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  '/daily/:date',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await knex('daily_reports')
        .where('report_date', req.params.date)
        .first();
      if (!report) {
        return res.status(404).json({ message: 'Отчёт не найден' });
      }
      res.json(report);
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  '/daily/:date',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orders_count, total_revenue } = req.body as {
        orders_count?: number;
        total_revenue?: number;
      };
      if (orders_count == null && total_revenue == null) {
        return res.status(400).json({ message: 'Нет данных для обновления' });
      }
      const updated = await knex('daily_reports')
        .where('report_date', req.params.date)
        .update({
          ...(orders_count != null && { orders_count }),
          ...(total_revenue != null && { total_revenue }),
          updated_at: knex.fn.now()
        })
        .returning('*');
      if (!updated.length) {
        return res.status(404).json({ message: 'Отчёт не найден' });
      }
      res.json(updated[0]);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
