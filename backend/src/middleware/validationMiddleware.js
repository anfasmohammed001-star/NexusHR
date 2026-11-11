/**
 * Helper to validate ISO Date string (YYYY-MM-DD) and real calendar validity
 */
function isValidDate(dateString) {
  if (typeof dateString !== 'string') return false;

  const trimmed = dateString.trim();
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(trimmed)) return false;

  const [year, month, day] = trimmed.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Validation middleware for POST and PUT /api/employees
 */
export function validateEmployeePayload(req, res, next) {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const { name, department, role, salary, join_date } = body;
  const errors = [];

  // Name validation
  if (name === undefined || name === null || typeof name !== 'string' || name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Name is required and cannot be empty or whitespace only.',
    });
  } else if (name.trim().length > 100) {
    errors.push({
      field: 'name',
      message: 'Name cannot exceed 100 characters.',
    });
  }

  // Department validation
  if (department === undefined || department === null || typeof department !== 'string' || department.trim() === '') {
    errors.push({
      field: 'department',
      message: 'Department is required and cannot be empty.',
    });
  } else if (department.trim().length > 100) {
    errors.push({
      field: 'department',
      message: 'Department cannot exceed 100 characters.',
    });
  }

  // Role validation
  if (role === undefined || role === null || typeof role !== 'string' || role.trim() === '') {
    errors.push({
      field: 'role',
      message: 'Role is required and cannot be empty.',
    });
  } else if (role.trim().length > 100) {
    errors.push({
      field: 'role',
      message: 'Role cannot exceed 100 characters.',
    });
  }

  // Salary validation
  if (
    salary === undefined ||
    salary === null ||
    (typeof salary !== 'number' && typeof salary !== 'string') ||
    (typeof salary === 'string' && salary.trim() === '')
  ) {
    errors.push({
      field: 'salary',
      message: 'Salary is required and must be a numeric value.',
    });
  } else {
    const numSalary = Number(salary);
    if (isNaN(numSalary) || !isFinite(numSalary)) {
      errors.push({
        field: 'salary',
        message: 'Salary must be a valid numeric value.',
      });
    } else if (numSalary <= 0) {
      errors.push({
        field: 'salary',
        message: 'Salary must be a positive number greater than 0.',
      });
    } else if (numSalary > 9999999999.99) {
      errors.push({
        field: 'salary',
        message: 'Salary cannot exceed 9,999,999,999.99.',
      });
    }
  }

  // Join Date validation
  if (!join_date) {
    errors.push({
      field: 'join_date',
      message: 'Join date is required.',
    });
  } else if (!isValidDate(join_date)) {
    errors.push({
      field: 'join_date',
      message: 'Join date must be a valid calendar date in YYYY-MM-DD format.',
    });
  }

  // If validation errors exist, return 400 Bad Request
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Validation failed. Please correct the highlighted errors.',
      errors,
    });
  }

  // Sanitize trimmed strings & round salary to 2 decimal places onto req.body
  req.body = {
    name: name.trim(),
    department: department.trim(),
    role: role.trim(),
    salary: Math.round(Number(salary) * 100) / 100,
    join_date: join_date.trim(),
  };

  next();
}

/**
 * Validate strict positive integer ID in route params
 */
export function validateEmployeeId(req, res, next) {
  const { id } = req.params;

  if (!/^\d+$/.test(String(id))) {
    return res.status(400).json({
      success: false,
      data: null,
      message: `Invalid employee ID: '${id}'. ID must be a positive integer.`,
      errors: [{ field: 'id', message: 'Employee ID must be a positive integer.' }],
    });
  }

  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) {
    return res.status(400).json({
      success: false,
      data: null,
      message: `Invalid employee ID: '${id}'. ID must be a positive integer.`,
      errors: [{ field: 'id', message: 'Employee ID must be a positive integer.' }],
    });
  }

  req.params.id = numericId;
  next();
}
