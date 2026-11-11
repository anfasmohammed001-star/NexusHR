-- ============================================================================
-- Employee Management System - Database Schema (PostgreSQL Compatible)
-- ============================================================================

-- Drop table if exists during fresh reset (optional)
-- DROP TABLE IF EXISTS employees CASCADE;

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    salary NUMERIC(12, 2) NOT NULL CHECK (salary > 0),
    join_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- B-Tree Indexes on Search and Sort Columns for optimal query performance
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees (name);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees (department);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees (role);
CREATE INDEX IF NOT EXISTS idx_employees_salary ON employees (salary);
CREATE INDEX IF NOT EXISTS idx_employees_join_date ON employees (join_date);

-- Optional trigger function to automatically update updated_at timestamp on row changes (PostgreSQL)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS trg_employees_updated_at ON employees;
CREATE TRIGGER trg_employees_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

