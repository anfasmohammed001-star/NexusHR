import { query } from '../config/db.js';

export const EmployeeModel = {
  /**
   * Find all employees with search and sorting support
   */
  async findAll({ search = '', sortBy = 'id', order = 'asc' } = {}) {
    // Whitelist valid columns to prevent SQL injection
    const allowedSortColumns = {
      id: 'id',
      name: 'name',
      department: 'department',
      role: 'role',
      salary: 'salary',
      join_date: 'join_date',
      created_at: 'created_at',
    };

    const sortColumn = (typeof sortBy === 'string' && allowedSortColumns[sortBy]) || 'id';
    const sortOrder = typeof order === 'string' && order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    let sql = 'SELECT * FROM employees';
    const params = [];

    const trimmedSearch = typeof search === 'string' ? search.trim() : '';

    if (trimmedSearch) {
      const escapedSearch = trimmedSearch.toLowerCase().replace(/[\\%_]/g, '\\$&');
      const term = `%${escapedSearch}%`;
      sql += ` WHERE (
        LOWER(name) LIKE $1 ESCAPE '\\' OR 
        LOWER(department) LIKE $2 ESCAPE '\\' OR 
        LOWER(role) LIKE $3 ESCAPE '\\'
      )`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY ${sortColumn} ${sortOrder}`;

    const result = await query(sql, params);
    return result.rows;
  },

  /**
   * Find a single employee by primary key id
   */
  async findById(id) {
    const sql = 'SELECT * FROM employees WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  },

  /**
   * Create a new employee record
   */
  async create({ name, department, role, salary, join_date }) {
    const sql = `
      INSERT INTO employees (name, department, role, salary, join_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const params = [
      name.trim(),
      department.trim(),
      role.trim(),
      parseFloat(salary),
      join_date,
    ];

    const result = await query(sql, params);
    return result.rows[0];
  },

  /**
   * Update an existing employee record
   */
  async update(id, { name, department, role, salary, join_date }) {
    const sql = `
      UPDATE employees 
      SET 
        name = $1, 
        department = $2, 
        role = $3, 
        salary = $4, 
        join_date = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    const params = [
      name.trim(),
      department.trim(),
      role.trim(),
      parseFloat(salary),
      join_date,
      id,
    ];

    const result = await query(sql, params);
    return result.rows[0] || null;
  },

  /**
   * Delete an employee record
   */
  async delete(id) {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const sql = 'DELETE FROM employees WHERE id = $1';
    await query(sql, [id]);
    return existing;
  },

  /**
   * Retrieve aggregate statistics for dashboard summary cards
   */
  async getSummaryStats() {
    const totalSql = `
      SELECT 
        COUNT(*) AS total_employees,
        COALESCE(AVG(salary), 0) AS average_salary,
        COALESCE(SUM(salary), 0) AS total_payroll
      FROM employees
    `;
    const totalRes = await query(totalSql);

    const deptSql = `
      SELECT department, COUNT(*) AS count 
      FROM employees 
      GROUP BY department 
      ORDER BY count DESC
    `;
    const deptRes = await query(deptSql);

    const stats = totalRes.rows[0] || { total_employees: 0, average_salary: 0, total_payroll: 0 };

    return {
      totalEmployees: parseInt(stats.total_employees, 10) || 0,
      averageSalary: parseFloat(stats.average_salary) || 0,
      totalPayroll: parseFloat(stats.total_payroll) || 0,
      departments: deptRes.rows,
    };
  },
};

export default EmployeeModel;
