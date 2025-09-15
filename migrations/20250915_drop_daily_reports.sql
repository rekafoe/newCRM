-- migrations/20250915_create_daily_reports.sql
CREATE TABLE daily_reports (
  id SERIAL PRIMARY KEY,
  report_date DATE NOT NULL UNIQUE,
  orders_count INTEGER NOT NULL,
  total_revenue NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
