-- ============================================================================
-- Employee Management System - Seed Data (10 Realistic Records)
-- ============================================================================

INSERT INTO employees (name, department, role, salary, join_date) VALUES
('Sarah Jenkins', 'Engineering', 'Principal Cloud Architect', 145000.00, '2021-03-15'),
('Alexander Chen', 'Engineering', 'Senior Full-Stack Engineer', 125000.00, '2022-06-01'),
('Elena Rostova', 'Engineering', 'Frontend Specialist', 95000.00, '2023-01-10'),
('Marcus Vance', 'HR', 'People Operations Director', 115000.00, '2020-08-20'),
('Priya Sharma', 'HR', 'Talent Acquisition Lead', 85000.00, '2022-11-14'),
('Jonathan Miller', 'Finance', 'Senior Financial Analyst', 98000.00, '2021-09-05'),
('Beatrice Dubois', 'Finance', 'Chief Financial Controller', 160000.00, '2019-04-12'),
('David Kim', 'Sales', 'Enterprise Account Executive', 105000.00, '2022-02-18'),
('Sophia Martinez', 'Marketing', 'VP of Brand Strategy', 135000.00, '2021-07-22'),
('Liam O''Connor', 'Operations', 'Infrastructure & Ops Manager', 112000.00, '2023-05-30')
ON CONFLICT DO NOTHING;

