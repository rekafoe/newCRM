// backend/src/index.ts

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { initDB } from './db'
import { Order, Item, Material, ProductMaterial, DailyReport } from './types'
import 'dotenv/config';
import { createHash } from 'crypto'
import path from 'path'
import fs from 'fs'
// Use require to avoid TS type resolution issues for multer
// eslint-disable-next-line @typescript-eslint/no-var-requires
const multer = require('multer') as any
async function main() {
  const db = await initDB()
  const app = express()

  app.use(cors())
  app.use(express.json())
  // Files storage
  const uploadsDir = path.resolve(__dirname, '../uploads')
  try { fs.mkdirSync(uploadsDir, { recursive: true }) } catch {}
  const storage = multer.diskStorage({
    destination: (_req: Request, _file: any, cb: (err: any, dest: string) => void) => cb(null, uploadsDir),
    filename: (_req: Request, file: any, cb: (err: any, filename: string) => void) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
      const ext = path.extname(file.originalname || '')
      cb(null, unique + ext)
    }
  })
  const upload = multer({ storage })
  app.use('/uploads', express.static(uploadsDir))
  app.use('/api/uploads', express.static(uploadsDir))
  // Password auth
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body as { email: string; password: string }
    if (!email || !password) return res.status(400).json({ message: 'Email и пароль обязательны' })
    const hp = createHash('sha256').update(password).digest('hex')
    const u = await db.get<{ api_token: string; name: string; role: string }>(
      'SELECT api_token, name, role FROM users WHERE email = ? AND password_hash = ?',
      email,
      hp
    )
    if (!u) return res.status(401).json({ message: 'Неверные данные' })
    res.json({ token: u.api_token, name: u.name, role: u.role })
  })
  // Simple token auth middleware (API token from users.api_token)
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    const openPaths = [
      // public widget needs these
      /^\/api\/presets/,
      /^\/api\/orders$/,
      /^\/api\/orders\/[0-9]+\/items$/,
      /^\/api\/orders\/[0-9]+\/prepay$/,
      /^\/api\/webhooks\/bepaid$/
    ]
    if (openPaths.some(r => r.test(req.path))) return next()
    const auth = req.headers['authorization'] || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined
    if (!token) { res.status(401).json({ message: 'Unauthorized' }); return }
    const u = await db.get<{ id: number; role: string }>('SELECT id, role FROM users WHERE api_token = ?', token)
    if (!u) { res.status(401).json({ message: 'Unauthorized' }); return }
    ;(req as any).user = u
    next()
  })
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
          'SELECT id, orderId, type, params, price, quantity, printerId, sides, sheets, waste, clicks FROM items WHERE orderId = ?',
          o.id
        )) as unknown as Array<{
          id: number
          orderId: number
          type: string
          params: string
          price: number
          quantity: number
          printerId: number | null
          sides: number
          sheets: number
          waste: number
          clicks: number
        }>
        o.items = itemsRaw.map(ir => ({
          id: ir.id,
          orderId: ir.orderId,
          type: ir.type,
          params: JSON.parse(ir.params),
          price: ir.price,
          quantity: ir.quantity ?? 1,
          printerId: ir.printerId ?? undefined,
          sides: ir.sides,
          sheets: ir.sheets,
          waste: ir.waste,
          clicks: ir.clicks
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
      const { type, params, price, quantity = 1, printerId, sides = 1, sheets = 0, waste = 0 } = req.body as {
        type: string
        params: { description: string }
        price: number
        quantity?: number
        printerId?: number
        sides?: number
        sheets?: number
        waste?: number
      }
      const authUser = (req as any).user as { id: number } | undefined

      // Узнаём материалы и остатки
      const needed = (await db.all<{
        materialId: number
        qtyPerItem: number
        quantity: number
        min_quantity: number | null
      }>(
        `SELECT pm.materialId, pm.qtyPerItem, m.quantity, m.min_quantity as min_quantity
           FROM product_materials pm
           JOIN materials m ON m.id = pm.materialId
           WHERE pm.presetCategory = ? AND pm.presetDescription = ?`,
        type,
        params.description
      )) as unknown as Array<{
        materialId: number
        qtyPerItem: number
        quantity: number
        min_quantity: number | null
      }>

      // Транзакция: проверка остатков, списание и вставка позиции
      await db.run('BEGIN')
      try {
        for (const n of needed) {
          const needQty = n.qtyPerItem * Math.max(1, Number(quantity) || 1)
          const minQ = n.min_quantity == null ? -Infinity : Number(n.min_quantity)
          if (n.quantity - needQty < minQ) {
            const err: any = new Error(`Недостаточно материала с учётом минимального остатка ID=${n.materialId}`)
            err.status = 400
            throw err
          }
          await db.run(
            'UPDATE materials SET quantity = quantity - ? WHERE id = ?',
            needQty,
            n.materialId
          )
          await db.run(
            'INSERT INTO material_moves (materialId, delta, reason, orderId, user_id) VALUES (?, ?, ?, ?, ?)',
            n.materialId,
            -needQty,
            'order add item',
            orderId,
            authUser?.id ?? null
          )
        }

        const clicks = Math.max(0, Number(sheets) || 0) * (Math.max(1, Number(sides) || 1) * 2) // SRA3 one-side=2 clicks, two-sides=4
        const insertItem = await db.run(
          'INSERT INTO items (orderId, type, params, price, quantity, printerId, sides, sheets, waste, clicks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          orderId,
          type,
          JSON.stringify(params),
          price,
          Math.max(1, Number(quantity) || 1),
          printerId || null,
          Math.max(1, Number(sides) || 1),
          Math.max(0, Number(sheets) || 0),
          Math.max(0, Number(waste) || 0),
          clicks
        )
        const itemId = insertItem.lastID!
        const rawItem = await db.get<{
          id: number
          orderId: number
          type: string
          params: string
          price: number
          quantity: number
          printerId: number | null
          sides: number
          sheets: number
          waste: number
          clicks: number
        }>(
          'SELECT id, orderId, type, params, price, quantity, printerId, sides, sheets, waste, clicks FROM items WHERE id = ?',
          itemId
        )

        await db.run('COMMIT')

        const item: Item = {
          id: rawItem!.id,
          orderId: rawItem!.orderId,
          type: rawItem!.type,
          params: JSON.parse(rawItem!.params),
          price: rawItem!.price,
          quantity: rawItem!.quantity ?? 1,
          printerId: rawItem!.printerId ?? undefined,
          sides: rawItem!.sides,
          sheets: rawItem!.sheets,
          waste: rawItem!.waste,
          clicks: rawItem!.clicks
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
    asyncHandler(async (req, res) => {
      const { user_id, from, to } = req.query as any
      const params: any[] = []
      const where: string[] = []
      if (user_id) { where.push('dr.user_id = ?'); params.push(Number(user_id)) }
      if (from) { where.push('dr.report_date >= ?'); params.push(String(from)) }
      if (to) { where.push('dr.report_date <= ?'); params.push(String(to)) }
      const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : ''
      const rows = (await db.all<DailyReport & { user_name: string | null }>(
        `SELECT dr.id, dr.report_date, dr.orders_count, dr.total_revenue, dr.created_at, dr.updated_at, dr.user_id,
                u.name as user_name
           FROM daily_reports dr
           LEFT JOIN users u ON u.id = dr.user_id
           ${whereSql}
           ORDER BY dr.report_date DESC`,
        ...params
      )) as unknown as Array<DailyReport & { user_name: string | null }>
      res.json(rows)
    })
  )

  app.get(
    '/api/daily/:date',
    asyncHandler(async (req, res) => {
      const row = await db.get<DailyReport & { user_name: string | null }>(
        `SELECT dr.id, dr.report_date, dr.orders_count, dr.total_revenue, dr.created_at, dr.updated_at, dr.user_id,
                u.name as user_name
           FROM daily_reports dr
           LEFT JOIN users u ON u.id = dr.user_id
          WHERE dr.report_date = ?`,
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
      const { orders_count, total_revenue, user_id } = req.body as {
        orders_count?: number
        total_revenue?: number
        user_id?: number
      }
      if (orders_count == null && total_revenue == null && user_id == null) {
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
             ${user_id != null ? 'user_id = ?,' : ''}
             updated_at = datetime('now')
         WHERE report_date = ?`,
        ...([orders_count != null ? orders_count : []] as any),
        ...([total_revenue != null ? total_revenue : []] as any),
        ...([user_id != null ? user_id : []] as any),
        req.params.date
      )
      const updated = await db.get<DailyReport & { user_name: string | null }>(
        `SELECT dr.id, dr.report_date, dr.orders_count, dr.total_revenue, dr.created_at, dr.updated_at, dr.user_id,
                u.name as user_name
           FROM daily_reports dr
           LEFT JOIN users u ON u.id = dr.user_id
          WHERE dr.report_date = ?`,
        req.params.date
      )
      res.json(updated)
    })
  )

  // POST /api/daily — создать отчёт на дату с пользователем
  app.post(
    '/api/daily',
    asyncHandler(async (req, res) => {
      const { report_date, user_id, orders_count = 0, total_revenue = 0 } = req.body as {
        report_date: string; user_id?: number; orders_count?: number; total_revenue?: number
      }
      if (!report_date) { res.status(400).json({ message: 'Нужна дата YYYY-MM-DD' }); return }
      try {
        await db.run(
          'INSERT INTO daily_reports (report_date, orders_count, total_revenue, user_id) VALUES (?, ?, ?, ?)',
          report_date,
          orders_count,
          total_revenue,
          user_id ?? null
        )
      } catch (e: any) {
        if (String(e?.message || '').includes('UNIQUE')) { res.status(409).json({ message: 'Отчёт уже существует' }); return }
        throw e
      }
      const row = await db.get<DailyReport & { user_name: string | null }>(
        `SELECT dr.id, dr.report_date, dr.orders_count, dr.total_revenue, dr.created_at, dr.updated_at, dr.user_id,
                u.name as user_name
           FROM daily_reports dr
           LEFT JOIN users u ON u.id = dr.user_id
          WHERE dr.report_date = ?`,
        report_date
      )
      res.status(201).json(row)
    })
  )

  // GET /api/users — список пользователей
  app.get(
    '/api/users',
    asyncHandler(async (_req, res) => {
      const users = await db.all<{ id: number; name: string }>('SELECT id, name FROM users ORDER BY name')
      res.json(users)
    })
  )

  // DELETE /api/orders/:orderId/items/:itemId — удалить позицию
  app.delete(
    '/api/orders/:orderId/items/:itemId',
    asyncHandler(async (req, res) => {
      const orderId = Number(req.params.orderId)
      const itemId = Number(req.params.itemId)
      const authUser = (req as any).user as { id: number } | undefined

      // Находим позицию и её состав материалов
      const it = await db.get<{
        id: number
        type: string
        params: string
        quantity: number
      }>(
        'SELECT id, type, params, quantity FROM items WHERE orderId = ? AND id = ?',
        orderId,
        itemId
      )

      if (!it) {
        // Нечего возвращать, просто 204
        await db.run('DELETE FROM items WHERE orderId = ? AND id = ?', orderId, itemId)
        res.status(204).end()
        return
      }

      const paramsObj = JSON.parse(it.params || '{}') as { description?: string }
      const composition = (await db.all<{
        materialId: number
        qtyPerItem: number
      }>(
        'SELECT materialId, qtyPerItem FROM product_materials WHERE presetCategory = ? AND presetDescription = ?',
        it.type,
        paramsObj.description || ''
      )) as unknown as Array<{ materialId: number; qtyPerItem: number }>

      await db.run('BEGIN')
      try {
        for (const c of composition) {
          const returnQty = (c.qtyPerItem || 0) * Math.max(1, Number(it.quantity) || 1)
          if (returnQty > 0) {
            await db.run(
              'UPDATE materials SET quantity = quantity + ? WHERE id = ?',
              returnQty,
              c.materialId
            )
            await db.run(
              'INSERT INTO material_moves (materialId, delta, reason, orderId, user_id) VALUES (?, ?, ?, ?, ?)',
              c.materialId,
              returnQty,
              'order delete item',
              orderId,
              authUser?.id ?? null
            )
          }
        }

        await db.run('DELETE FROM items WHERE orderId = ? AND id = ?', orderId, itemId)
        await db.run('COMMIT')
        res.status(204).end()
      } catch (e) {
        await db.run('ROLLBACK')
        throw e
      }
    })
  )

  // DELETE /api/orders/:id — удалить заказ
  app.delete(
    '/api/orders/:id',
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id)
      const authUser = (req as any).user as { id: number } | undefined
      // Собираем все позиции заказа и их состав
      const items = (await db.all<{
        id: number
        type: string
        params: string
        quantity: number
      }>(
        'SELECT id, type, params, quantity FROM items WHERE orderId = ?',
        id
      )) as unknown as Array<{ id: number; type: string; params: string; quantity: number }>

      // Агрегируем возвраты по materialId
      const returns: Record<number, number> = {}
      for (const it of items) {
        const paramsObj = JSON.parse(it.params || '{}') as { description?: string }
        const composition = (await db.all<{
          materialId: number
          qtyPerItem: number
        }>(
          'SELECT materialId, qtyPerItem FROM product_materials WHERE presetCategory = ? AND presetDescription = ?',
          it.type,
          paramsObj.description || ''
        )) as unknown as Array<{ materialId: number; qtyPerItem: number }>
        for (const c of composition) {
          const add = (c.qtyPerItem || 0) * Math.max(1, Number(it.quantity) || 1)
          returns[c.materialId] = (returns[c.materialId] || 0) + add
        }
      }

      await db.run('BEGIN')
      try {
        for (const mid of Object.keys(returns)) {
          const materialId = Number(mid)
          const addQty = returns[materialId]
          if (addQty > 0) {
            await db.run(
              'UPDATE materials SET quantity = quantity + ? WHERE id = ?',
              addQty,
              materialId
            )
            await db.run(
              'INSERT INTO material_moves (materialId, delta, reason, orderId, user_id) VALUES (?, ?, ?, ?, ?)',
              materialId,
              addQty,
              'order delete',
              id,
              authUser?.id ?? null
            )
          }
        }

        // Удаляем заказ (позиции удалятся каскадно)
        await db.run('DELETE FROM orders WHERE id = ?', id)
        await db.run('COMMIT')
        res.status(204).end()
      } catch (e) {
        await db.run('ROLLBACK')
        throw e
      }
    })
  )

  // GET /api/materials — список материалов
  app.get(
    '/api/materials',
    asyncHandler(async (_req, res) => {
      const materials = await db.all<Material>(
        'SELECT id, name, unit, quantity, min_quantity as min_quantity FROM materials ORDER BY name'
      ) as any
      res.json(materials)
    })
  )

  // ===== Files per order =====
  // GET list
  app.get(
    '/api/orders/:id/files',
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id)
      const rows = await db.all<any>(
        'SELECT id, orderId, filename, originalName, mime, size, uploadedAt, approved, approvedAt, approvedBy FROM order_files WHERE orderId = ? ORDER BY id DESC',
        id
      )
      res.json(rows)
    })
  )
  // POST upload
  app.post(
    '/api/orders/:id/files',
    upload.single('file'),
    asyncHandler(async (req, res) => {
      const orderId = Number(req.params.id)
      const f = (req as any).file as { filename: string; originalname?: string; mimetype?: string; size?: number } | undefined
      if (!f) { res.status(400).json({ message: 'Файл не получен' }); return }
      await db.run(
        'INSERT INTO order_files (orderId, filename, originalName, mime, size) VALUES (?, ?, ?, ?, ?)',
        orderId,
        f.filename,
        f.originalname || null,
        f.mimetype || null,
        f.size || null
      )
      const row = await db.get<any>(
        'SELECT id, orderId, filename, originalName, mime, size, uploadedAt, approved, approvedAt, approvedBy FROM order_files WHERE orderId = ? ORDER BY id DESC LIMIT 1',
        orderId
      )
      res.status(201).json(row)
    })
  )
  // DELETE file
  app.delete(
    '/api/orders/:orderId/files/:fileId',
    asyncHandler(async (req, res) => {
      const orderId = Number(req.params.orderId)
      const fileId = Number(req.params.fileId)
      const row = await db.get<any>('SELECT filename FROM order_files WHERE id = ? AND orderId = ?', fileId, orderId)
      if (row && row.filename) {
        const p = path.join(uploadsDir, String(row.filename))
        try { fs.unlinkSync(p) } catch {}
      }
      await db.run('DELETE FROM order_files WHERE id = ? AND orderId = ?', fileId, orderId)
      res.status(204).end()
    })
  )
  // APPROVE file
  app.post(
    '/api/orders/:orderId/files/:fileId/approve',
    asyncHandler(async (req, res) => {
      const orderId = Number(req.params.orderId)
      const fileId = Number(req.params.fileId)
      const user = (req as any).user as { id: number } | undefined
      await db.run(
        "UPDATE order_files SET approved = 1, approvedAt = datetime('now'), approvedBy = ? WHERE id = ? AND orderId = ?",
        user?.id ?? null,
        fileId,
        orderId
      )
      const row = await db.get<any>(
        'SELECT id, orderId, filename, originalName, mime, size, uploadedAt, approved, approvedAt, approvedBy FROM order_files WHERE id = ? AND orderId = ?',
        fileId,
        orderId
      )
      res.json(row)
    })
  )

  // GET /api/order-statuses — список статусов для фронта
  app.get(
    '/api/order-statuses',
    asyncHandler(async (_req, res) => {
      const rows = await db.all<{ id: number; name: string; color: string | null; sort_order: number }>(
        'SELECT id, name, color, sort_order FROM order_statuses ORDER BY sort_order'
      )
      res.json(rows)
    })
  )

  // Printers
  app.get(
    '/api/printers',
    asyncHandler(async (_req, res) => {
      const rows = await db.all<{ id: number; code: string; name: string }>('SELECT id, code, name FROM printers ORDER BY name')
      res.json(rows)
    })
  )

  // Materials low stock and reports
  app.get(
    '/api/materials/low-stock',
    asyncHandler(async (_req, res) => {
      const rows = await db.all<any>(`SELECT id, name, unit, quantity, min_quantity as min_quantity FROM materials WHERE min_quantity IS NOT NULL AND quantity <= min_quantity ORDER BY name`)
      res.json(rows)
    })
  )
  app.get(
    '/api/materials/report/top',
    asyncHandler(async (req, res) => {
      const { from, to, limit = 10 } = req.query as any
      const where: string[] = []
      const params: any[] = []
      if (from) { where.push('mm.created_at >= ?'); params.push(String(from)) }
      if (to) { where.push('mm.created_at <= ?'); params.push(String(to)) }
      const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : ''
      const rows = await db.all<any>(
        `SELECT m.id, m.name, SUM(CASE WHEN mm.delta < 0 THEN -mm.delta ELSE 0 END) AS spent
           FROM material_moves mm
           JOIN materials m ON m.id = mm.materialId
          ${whereSql}
          GROUP BY m.id, m.name
          ORDER BY spent DESC
          LIMIT ?`,
        ...params,
        Number(limit)
      )
      res.json(rows)
    })
  )
  app.get(
    '/api/materials/report/forecast',
    asyncHandler(async (_req, res) => {
      const rows = await db.all<any>(
        `SELECT m.id, m.name, m.unit, m.quantity, m.min_quantity,
                ROUND(m.quantity * 0.5, 2) AS suggested_order
           FROM materials m
          WHERE m.min_quantity IS NOT NULL AND m.quantity <= m.min_quantity
          ORDER BY (m.min_quantity - m.quantity) DESC`
      )
      res.json(rows)
    })
  )

  // Printer counters submit
  app.post(
    '/api/printers/:id/counters',
    asyncHandler(async (req, res) => {
      const user = (req as any).user as { id: number; role: string } | undefined
      if (!user || user.role !== 'admin') { res.status(403).json({ message: 'Forbidden' }); return }
      const id = Number(req.params.id)
      const { counter_date, value } = req.body as { counter_date: string; value: number }
      try {
        await db.run('INSERT OR REPLACE INTO printer_counters (printer_id, counter_date, value) VALUES (?, ?, ?)', id, counter_date, Number(value))
      } catch (e) { throw e }
      const row = await db.get<any>('SELECT id, printer_id, counter_date, value, created_at FROM printer_counters WHERE printer_id = ? AND counter_date = ?', id, counter_date)
      res.status(201).json(row)
    })
  )

  // POST /api/materials — создать или обновить материал
  app.post(
    '/api/materials',
    asyncHandler(async (req, res) => {
      const user = (req as any).user as { id: number; role: string } | undefined
      if (!user || user.role !== 'admin') { res.status(403).json({ message: 'Forbidden' }); return }
      const mat = req.body as Material
      try {
        if (mat.id) {
          await db.run(
            'UPDATE materials SET name = ?, unit = ?, quantity = ?, min_quantity = ? WHERE id = ?',
            mat.name,
            mat.unit,
            mat.quantity,
            mat.min_quantity ?? null,
            mat.id
          )
        } else {
          await db.run(
            'INSERT INTO materials (name, unit, quantity, min_quantity) VALUES (?, ?, ?, ?)',
            mat.name,
            mat.unit,
            mat.quantity,
            mat.min_quantity ?? null
          )
        }
      } catch (e: any) {
        if (e && typeof e.message === 'string' && e.message.includes('UNIQUE constraint failed: materials.name')) {
          const err: any = new Error('Материал с таким именем уже существует')
          err.status = 409
          throw err
        }
        throw e
      }
      const allMats = await db.all<Material>(
        'SELECT id, name, unit, quantity, min_quantity as min_quantity FROM materials ORDER BY name'
      ) as any
      res.json(allMats)
    })
  )

  // GET /api/materials/moves — история движений с фильтрами
  app.get(
    '/api/materials/moves',
    asyncHandler(async (req, res) => {
      const { materialId, user_id, orderId, from, to } = req.query as any
      const where: string[] = []
      const params: any[] = []
      if (materialId) { where.push('mm.materialId = ?'); params.push(Number(materialId)) }
      if (user_id) { where.push('mm.user_id = ?'); params.push(Number(user_id)) }
      if (orderId) { where.push('mm.orderId = ?'); params.push(Number(orderId)) }
      if (from) { where.push('mm.created_at >= ?'); params.push(String(from)) }
      if (to) { where.push('mm.created_at <= ?'); params.push(String(to)) }
      const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : ''
      const rows = await db.all<any>(
        `SELECT mm.id, mm.materialId, m.name as material_name, mm.delta, mm.reason, mm.orderId, mm.user_id, mm.created_at
           FROM material_moves mm
           JOIN materials m ON m.id = mm.materialId
          ${whereSql}
          ORDER BY mm.created_at DESC, mm.id DESC`,
        ...params
      )
      res.json(rows)
    })
  )

  // DELETE /api/materials/:id — удалить материал
  app.delete(
    '/api/materials/:id',
    asyncHandler(async (req, res) => {
      const user = (req as any).user as { id: number; role: string } | undefined
      if (!user || user.role !== 'admin') { res.status(403).json({ message: 'Forbidden' }); return }
      await db.run('DELETE FROM materials WHERE id = ?', Number(req.params.id))
      res.status(204).end()
    })
  )

  // POST /api/materials/spend — админское движение материалов (+/-)
  app.post(
    '/api/materials/spend',
    asyncHandler(async (req, res) => {
      const user = (req as any).user as { id: number; role: string } | undefined
      if (!user || user.role !== 'admin') { res.status(403).json({ message: 'Forbidden' }); return }
      const { materialId, delta, reason, orderId } = req.body as { materialId: number; delta: number; reason?: string; orderId?: number }
      await db.run('BEGIN')
      try {
        await db.run('UPDATE materials SET quantity = quantity + ? WHERE id = ?', Number(delta), Number(materialId))
        await db.run('INSERT INTO material_moves (materialId, delta, reason, orderId, user_id) VALUES (?, ?, ?, ?, ?)', materialId, Number(delta), reason || null, orderId || null, user.id)
        await db.run('COMMIT')
      } catch (e) {
        await db.run('ROLLBACK')
        throw e
      }
      const mat = await db.get<Material>('SELECT * FROM materials WHERE id = ?', Number(materialId))
      res.json(mat)
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
        min_quantity: number | null
      }>(
        `SELECT pm.materialId, pm.qtyPerItem, m.name, m.unit, m.quantity, m.min_quantity as min_quantity
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
      const user = (req as any).user as { id: number; role: string } | undefined
      if (!user || user.role !== 'admin') { res.status(403).json({ message: 'Forbidden' }); return }
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

  // PATCH /api/orders/:orderId/items/:itemId — обновление позиции (и перерасчёт материалов при смене количества)
  app.patch(
    '/api/orders/:orderId/items/:itemId',
    asyncHandler(async (req, res) => {
      const orderId = Number(req.params.orderId)
      const itemId = Number(req.params.itemId)
      const body = req.body as Partial<{
        price: number
        quantity: number
        printerId: number | null
        sides: number
        sheets: number
        waste: number
      }>

      const existing = await db.get<{
        id: number
        orderId: number
        type: string
        params: string
        price: number
        quantity: number
        printerId: number | null
        sides: number
        sheets: number
        waste: number
      }>('SELECT id, orderId, type, params, price, quantity, printerId, sides, sheets, waste FROM items WHERE id = ? AND orderId = ?', itemId, orderId)
      if (!existing) { res.status(404).json({ message: 'Позиция не найдена' }); return }

      const newQuantity = body.quantity != null ? Math.max(1, Number(body.quantity) || 1) : existing.quantity
      const deltaQty = newQuantity - (existing.quantity ?? 1)

      await db.run('BEGIN')
      try {
        if (deltaQty !== 0) {
          const paramsObj = JSON.parse(existing.params || '{}') as { description?: string }
          const composition = (await db.all<{
            materialId: number
            qtyPerItem: number
            quantity: number
          }>(
            `SELECT pm.materialId, pm.qtyPerItem, m.quantity
               FROM product_materials pm
               JOIN materials m ON m.id = pm.materialId
              WHERE pm.presetCategory = ? AND pm.presetDescription = ?`,
            existing.type,
            paramsObj.description || ''
          )) as unknown as Array<{ materialId: number; qtyPerItem: number; quantity: number }>
          if (deltaQty > 0) {
            // Проверяем остатки
            for (const c of composition) {
              const need = (c.qtyPerItem || 0) * deltaQty
              if (c.quantity < need) {
                const err: any = new Error(`Недостаточно материала ID=${c.materialId}`)
                err.status = 400
                throw err
              }
            }
            for (const c of composition) {
              const need = (c.qtyPerItem || 0) * deltaQty
              if (need > 0) await db.run('UPDATE materials SET quantity = quantity - ? WHERE id = ?', need, c.materialId)
              if (need > 0) await db.run('INSERT INTO material_moves (materialId, delta, reason, orderId, user_id) VALUES (?, ?, ?, ?, ?)', c.materialId, -need, 'order update qty +', orderId, (req as any).user?.id ?? null)
            }
          } else {
            for (const c of composition) {
              const back = (c.qtyPerItem || 0) * Math.abs(deltaQty)
              if (back > 0) await db.run('UPDATE materials SET quantity = quantity + ? WHERE id = ?', back, c.materialId)
              if (back > 0) await db.run('INSERT INTO material_moves (materialId, delta, reason, orderId, user_id) VALUES (?, ?, ?, ?, ?)', c.materialId, back, 'order update qty -', orderId, (req as any).user?.id ?? null)
            }
          }
        }

        const nextSides = body.sides != null ? Math.max(1, Number(body.sides) || 1) : existing.sides
        const nextSheets = body.sheets != null ? Math.max(0, Number(body.sheets) || 0) : existing.sheets
        const clicks = nextSheets * (nextSides * 2)

        await db.run(
          `UPDATE items SET 
              ${body.price != null ? 'price = ?,' : ''}
              ${body.quantity != null ? 'quantity = ?,' : ''}
              ${body.printerId !== undefined ? 'printerId = ?,' : ''}
              ${body.sides != null ? 'sides = ?,' : ''}
              ${body.sheets != null ? 'sheets = ?,' : ''}
              ${body.waste != null ? 'waste = ?,' : ''}
              clicks = ?
           WHERE id = ? AND orderId = ?`,
          ...([body.price != null ? Number(body.price) : []] as any),
          ...([body.quantity != null ? newQuantity : []] as any),
          ...([body.printerId !== undefined ? (body.printerId as any) : []] as any),
          ...([body.sides != null ? nextSides : []] as any),
          ...([body.sheets != null ? nextSheets : []] as any),
          ...([body.waste != null ? Math.max(0, Number(body.waste) || 0) : []] as any),
          clicks,
          itemId,
          orderId
        )

        await db.run('COMMIT')
      } catch (e) {
        await db.run('ROLLBACK')
        throw e
      }

      const updated = await db.get<any>('SELECT id, orderId, type, params, price, quantity, printerId, sides, sheets, waste, clicks FROM items WHERE id = ? AND orderId = ?', itemId, orderId)
      res.json({
        id: updated.id,
        orderId: updated.orderId,
        type: updated.type,
        params: JSON.parse(updated.params || '{}'),
        price: updated.price,
        quantity: updated.quantity,
        printerId: updated.printerId ?? undefined,
        sides: updated.sides,
        sheets: updated.sheets,
        waste: updated.waste,
        clicks: updated.clicks
      })
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
