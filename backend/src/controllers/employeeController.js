import EmployeeModel from '../models/employeeModel.js';

export const EmployeeController = {
  /**
   * GET /api/employees
   * Retrieve all employees with optional search and sorting
   */
  async getAllEmployees(req, res, next) {
    try {
      const { search = '', sortBy = 'id', order = 'asc' } = req.query;

      const employees = await EmployeeModel.findAll({
        search,
        sortBy,
        order,
      });

      return res.status(200).json({
        success: true,
        data: employees,
        count: employees.length,
        message: 'Employees retrieved successfully.',
        errors: [],
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/employees/:id
   * Retrieve a single employee by primary key
   */
  async getEmployeeById(req, res, next) {
    try {
      const { id } = req.params;
      const employee = await EmployeeModel.findById(id);

      if (!employee) {
        return res.status(404).json({
          success: false,
          data: null,
          message: `Employee with ID ${id} was not found.`,
          errors: [
            {
              field: 'id',
              message: `Record with ID ${id} does not exist in the database.`,
            },
          ],
        });
      }

      return res.status(200).json({
        success: true,
        data: employee,
        message: 'Employee retrieved successfully.',
        errors: [],
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/employees
   * Create a new employee record
   */
  async createEmployee(req, res, next) {
    try {
      const { name, department, role, salary, join_date } = req.body;

      const created = await EmployeeModel.create({
        name,
        department,
        role,
        salary,
        join_date,
      });

      return res.status(201).json({
        success: true,
        data: created,
        message: 'Employee created successfully.',
        errors: [],
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/employees/:id
   * Update an existing employee record
   */
  async updateEmployee(req, res, next) {
    try {
      const { id } = req.params;
      const { name, department, role, salary, join_date } = req.body;

      // Check existence first
      const existing = await EmployeeModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          data: null,
          message: `Cannot update. Employee with ID ${id} does not exist.`,
          errors: [
            {
              field: 'id',
              message: `Record with ID ${id} does not exist in the database.`,
            },
          ],
        });
      }

      const updated = await EmployeeModel.update(id, {
        name,
        department,
        role,
        salary,
        join_date,
      });

      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Employee updated successfully.',
        errors: [],
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/employees/:id
   * Delete an employee record
   */
  async deleteEmployee(req, res, next) {
    try {
      const { id } = req.params;

      const deleted = await EmployeeModel.delete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          data: null,
          message: `Cannot delete. Employee with ID ${id} does not exist.`,
          errors: [
            {
              field: 'id',
              message: `Record with ID ${id} does not exist in the database.`,
            },
          ],
        });
      }

      return res.status(200).json({
        success: true,
        data: deleted,
        message: `Employee "${deleted.name}" (ID ${id}) was deleted successfully.`,
        errors: [],
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/employees/stats/summary
   * Aggregated statistics for dashboard
   */
  async getSummaryStats(req, res, next) {
    try {
      const stats = await EmployeeModel.getSummaryStats();
      return res.status(200).json({
        success: true,
        data: stats,
        message: 'Employee statistics retrieved successfully.',
        errors: [],
      });
    } catch (error) {
      next(error);
    }
  },
};

export default EmployeeController;

