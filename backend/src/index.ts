// backend/src/index.ts

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { initDB } from './db'
import { Order, Item, Material, ProductMaterial, DailyReport } from './types'
import 'dotenv/config';
async function main() {
  const db = await initDB()
  const app = express()

  app.use(cors())
  app.use(express.json())
  // Routes are defined inline against sqlite database
  // Обёртка для async-роутов
  const asyncHandler =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction) =>
      fn(req, res, next).catch(next)

  // GET /api/orders — список заказов с их позициями
  app.get(
    '/api/orders',
    asyncHandler(async (_req, res) => {
      const orders = (await db.all<Order>(
        'SELECT id, number, status, createdAt FROM orders ORDER BY id DESC'
      )) as unknown as Order[]
      for (const o of orders) {
        const itemsRaw = (await db.all<{
          id: number
          orderId: number
          type: string
          params: string
          price: number
        }>(
          'SELECT id, orderId, type, params, price FROM items WHERE orderId = ?',
          o.id
        )) as unknown as Array<{
          id: number
          orderId: number
          type: string
          params: string
          price: number
        }>
        o.items = itemsRaw.map(ir => ({
          id: ir.id,
          orderId: ir.orderId,
          type: ir.type,
          params: JSON.parse(ir.params),
          price: ir.price
        }))
      }
      res.json(orders)
    })
  )

  // POST /api/orders — создать новый заказ
  app.post(
    '/api/orders',
    asyncHandler(async (req, res) => {
      const createdAt = new Date().toISOString()
      const { customerName, customerPhone, customerEmail, prepaymentAmount } = (req.body || {}) as Partial<Order>
      const insertRes = await db.run(
        'INSERT INTO orders (status, createdAt, customerName, customerPhone, customerEmail, prepaymentAmount) VALUES (?, ?, ?, ?, ?, ?)',
        1,
        createdAt,
        customerName || null,
        customerPhone || null,
        customerEmail || null,
        Number(prepaymentAmount || 0)
      )
      const id = insertRes.lastID!
      const number = `ORD-${String(id).padStart(4, '0')}`
      await db.run('UPDATE orders SET number = ? WHERE id = ?', number, id)

      const raw = await db.get<Order>(
        'SELECT * FROM orders WHERE id = ?',
        id
      )
      const order: Order = { ...(raw as Order), items: [] }
      res.status(201).json(order)
    })
  )

  // PUT /api/orders/:id/status — обновить статус заказа
  app.put(
    '/api/orders/:id/status',
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id)
      const { status } = req.body as { status: number }
      await db.run('UPDATE orders SET status = ? WHERE id = ?', status, id)

      const raw = await db.get<Order>(
        'SELECT * FROM orders WHERE id = ?',
        id
      )
      const updated: Order = { ...(raw as Order), items: [] }
      res.json(updated)
    })
  )

  // POST /api/orders/:id/prepay — создать ссылку на предоплату (через BePaid-стаб)
  app.post(
    '/api/orders/:id/prepay',
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id)
      const order = await db.get<Order>('SELECT * FROM orders WHERE id = ?', id)
      if (!order) { res.status(404).json({ message: 'Заказ не найден' }); return }
      const amount = Number((req.body as any)?.amount ?? order.prepaymentAmount ?? 0)
      if (!amount || amount <= 0) { res.status(400).json({ message: 'Сумма предоплаты не задана' }); return }
      // BePaid integration stub: normally create payment via API and get redirect url
      const paymentId = `BEP-${Date.now()}-${id}`
      const paymentUrl = `https://checkout.bepaid.by/redirect/${paymentId}`
      await db.run('UPDATE orders SET prepaymentAmount = ?, prepaymentStatus = ?, paymentUrl = ?, paymentId = ? WHERE id = ?', amount, 'pending', paymentUrl, paymentId, id)
      const updated = await db.get<Order>('SELECT * FROM orders WHERE id = ?', id)
      res.json(updated)
    })
  )

  // POST /api/webhooks/bepaid — обработчик вебхуков статуса оплаты
  app.post(
    '/api/webhooks/bepaid',
    asyncHandler(async (req, res) => {
      const { payment_id, status, order_id } = req.body as { payment_id: string; status: string; order_id: number }
      if (!payment_id) { res.status(400).json({}); return }
      await db.run('UPDATE orders SET prepaymentStatus = ? WHERE paymentId = ?', status, payment_id)
      res.status(204).end()
    })
  )

  // POST /api/orders/:id/items — добавить позицию и списать материалы (атомарно)
  app.post(
    '/api/orders/:id/items',
    asyncHandler(async (req, res) => {
      const orderId = Number(req.params.id)
      const { type, params, price } = req.body as {
        type: string
        params: { description: string }
        price: number
      }

      // Узнаём материалы и остатки
      const needed = (await db.all<{
        materialId: number
        qtyPerItem: number
        quantity: number
      }>(
        `SELECT pm.materialId, pm.qtyPerItem, m.quantity
           FROM product_materials pm
           JOIN materials m ON m.id = pm.materialId
           WHERE pm.presetCategory = ? AND pm.presetDescription = ?`,
        type,
        params.description
      )) as unknown as Array<{
        materialId: number
        qtyPerItem: number
        quantity: number
      }>

      // Транзакция: проверка остатков, списание и вставка позиции
      await db.run('BEGIN')
      try {
        for (const n of needed) {
          if (n.quantity < n.qtyPerItem) {
            const err: any = new Error(`Недостаточно материала ID=${n.materialId}`)
            err.status = 400
            throw err
          }
          await db.run(
            'UPDATE materials SET quantity = quantity - ? WHERE id = ?',
            n.qtyPerItem,
            n.materialId
          )
        }

        const insertItem = await db.run(
          'INSERT INTO items (orderId, type, params, price) VALUES (?, ?, ?, ?)',
          orderId,
          type,
          JSON.stringify(params),
          price
        )
        const itemId = insertItem.lastID!
        const rawItem = await db.get<{
          id: number
          orderId: number
          type: string
          params: string
          price: number
        }>(
          'SELECT id, orderId, type, params, price FROM items WHERE id = ?',
          itemId
        )

        await db.run('COMMIT')

        const item: Item = {
          id: rawItem!.id,
          orderId: rawItem!.orderId,
          type: rawItem!.type,
          params: JSON.parse(rawItem!.params),
          price: rawItem!.price
        }
        res.status(201).json(item)
        return
      } catch (e) {
        await db.run('ROLLBACK')
        throw e
      }
    })
  )

  // ===== Daily Reports =====
  app.get(
    '/api/daily-reports',
    asyncHandler(async (_req, res) => {
      const rows = (await db.all<DailyReport>(
        'SELECT id, report_date, orders_count, total_revenue, created_at, updated_at FROM daily_reports ORDER BY report_date DESC'
      )) as unknown as DailyReport[]
      res.json(rows)
    })
  )

  app.get(
    '/api/daily/:date',
    asyncHandler(async (req, res) => {
      const row = await db.get<DailyReport>(
        'SELECT id, report_date, orders_count, total_revenue, created_at, updated_at FROM daily_reports WHERE report_date = ?',
        req.params.date
      )
      if (!row) {
        res.status(404).json({ message: 'Отчёт не найден' })
        return
      }
      res.json(row)
    })
  )

  app.patch(
    '/api/daily/:date',
    asyncHandler(async (req, res) => {
      const { orders_count, total_revenue } = req.body as {
        orders_count?: number
        total_revenue?: number
      }
      if (orders_count == null && total_revenue == null) {
        res.status(400).json({ message: 'Нет данных для обновления' })
        return
      }
      const existing = await db.get<DailyReport>(
        'SELECT id FROM daily_reports WHERE report_date = ?',
        req.params.date
      )
      if (!existing) {
        res.status(404).json({ message: 'Отчёт не найден' })
        return
      }

      await db.run(
        `UPDATE daily_reports
           SET 
             ${orders_count != null ? 'orders_count = ?,' : ''}
             ${total_revenue != null ? 'total_revenue = ?,' : ''}
             updated_at = datetime('now')
         WHERE report_date = ?`,
        ...([orders_count != null ? orders_count : []] as any),
        ...([total_revenue != null ? total_revenue : []] as any),
        req.params.date
      )
      const updated = await db.get<DailyReport>(
        'SELECT id, report_date, orders_count, total_revenue, created_at, updated_at FROM daily_reports WHERE report_date = ?',
        req.params.date
      )
      res.json(updated)
    })
  )

  // DELETE /api/orders/:orderId/items/:itemId — удалить позицию
  app.delete(
    '/api/orders/:orderId/items/:itemId',
    asyncHandler(async (req, res) => {
      await db.run(
        'DELETE FROM items WHERE orderId = ? AND id = ?',
        Number(req.params.orderId),
        Number(req.params.itemId)
      )
      res.status(204).end()
    })
  )

  // DELETE /api/orders/:id — удалить заказ
  app.delete(
    '/api/orders/:id',
    asyncHandler(async (req, res) => {
      await db.run('DELETE FROM orders WHERE id = ?', Number(req.params.id))
      res.status(204).end()
    })
  )

  // GET /api/materials — список материалов
  app.get(
    '/api/materials',
    asyncHandler(async (_req, res) => {
      const materials = await db.all<Material>(
        'SELECT * FROM materials ORDER BY name'
      )
      res.json(materials)
    })
  )

  // POST /api/materials — создать или обновить материал
  app.post(
    '/api/materials',
    asyncHandler(async (req, res) => {
      const mat = req.body as Material
      try {
        if (mat.id) {
          await db.run(
            'UPDATE materials SET name = ?, unit = ?, quantity = ? WHERE id = ?',
            mat.name,
            mat.unit,
            mat.quantity,
            mat.id
          )
        } else {
          await db.run(
            'INSERT INTO materials (name, unit, quantity) VALUES (?, ?, ?)',
            mat.name,
            mat.unit,
            mat.quantity
          )
        }
      } catch (e: any) {
        // Обрабатываем конфликт уникальности имени
        if (e && typeof e.message === 'string' && e.message.includes('UNIQUE constraint failed: materials.name')) {
          const err: any = new Error('Материал с таким именем уже существует')
          err.status = 409
          throw err
        }
        throw e
      }
      const allMats = await db.all<Material>(
        'SELECT * FROM materials ORDER BY name'
      )
      res.json(allMats)
    })
  )

  // DELETE /api/materials/:id — удалить материал
  app.delete(
    '/api/materials/:id',
    asyncHandler(async (req, res) => {
      await db.run('DELETE FROM materials WHERE id = ?', Number(req.params.id))
      res.status(204).end()
    })
  )

  // GET /api/product-materials/:category/:description
  app.get(
    '/api/product-materials/:category/:description',
    asyncHandler(async (req, res) => {
      const rows = await db.all<ProductMaterial & {
        name: string
        unit: string
        quantity: number
      }>(
        `SELECT pm.materialId, pm.qtyPerItem, m.name, m.unit, m.quantity
           FROM product_materials pm
           JOIN materials m ON m.id = pm.materialId
           WHERE pm.presetCategory = ? AND pm.presetDescription = ?`,
        req.params.category,
        req.params.description
      )
      res.json(rows)
    })
  )

  // GET /api/presets — список категорий с их товарами и допами
  app.get(
    '/api/presets',
    asyncHandler(async (_req, res) => {
      const categories = (await db.all<{ id: number; category: string; color: string }>(
        'SELECT id, category, color FROM preset_categories ORDER BY category'
      )) as unknown as Array<{ id: number; category: string; color: string }>
      const items = (await db.all<{ id: number; category_id: number; description: string; price: number }>(
        'SELECT id, category_id, description, price FROM preset_items'
      )) as unknown as Array<{ id: number; category_id: number; description: string; price: number }>
      const extras = (await db.all<{ id: number; category_id: number; name: string; price: number; type: string; unit: string | null }>(
        'SELECT id, category_id, name, price, type, unit FROM preset_extras'
      )) as unknown as Array<{ id: number; category_id: number; name: string; price: number; type: string; unit: string | null }>
      const result = categories.map((c) => ({
        category: c.category,
        color: c.color,
        items: items
          .filter((i) => i.category_id === c.id)
          .map((i) => ({ description: i.description, price: i.price })),
        extras: extras
          .filter((e) => e.category_id === c.id)
          .map((e) => ({ name: e.name, price: e.price, type: e.type as any, unit: e.unit || undefined }))
      }))
      res.json(result)
    })
  )

  // POST /api/product-materials — задать состав материалов для пресета
  app.post(
    '/api/product-materials',
    asyncHandler(async (req, res) => {
      const {
        presetCategory,
        presetDescription,
        materials
      } = req.body as {
        presetCategory: string
        presetDescription: string
        materials: { materialId: number; qtyPerItem: number }[]
      }

      await db.run(
        'DELETE FROM product_materials WHERE presetCategory = ? AND presetDescription = ?',
        presetCategory,
        presetDescription
      )
      for (const m of materials) {
        await db.run(
          'INSERT INTO product_materials (presetCategory, presetDescription, materialId, qtyPerItem) VALUES (?, ?, ?, ?)',
          presetCategory,
          presetDescription,
          m.materialId,
          m.qtyPerItem
        )
      }
      res.status(204).end()
    })
  )

  // Error-handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('🔥 Unhandled error:', err)
    res
      .status(err.status || 500)
      .json({ error: err.message, stack: err.stack })
  })

  const PORT = Number(process.env.PORT || 3001)
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API running at http://localhost:${PORT}`)
  })
}

main().catch(err => {
  console.error('⛔ Fatal startup error:', err)
  process.exit(1)
})
