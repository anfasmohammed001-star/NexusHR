import axios from 'axios';

// Use VITE_API_URL when explicitly set; default to localhost:5000 in local dev and same-origin (/api/*) in production
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Handle API error extraction consistently
 */
function extractError(error) {
  if (error.response && error.response.data) {
    return {
      message: error.response.data.message || 'An error occurred with your request.',
      errors: error.response.data.errors || [],
      status: error.response.status,
    };
  }
  if (error.request) {
    return {
      message: API_BASE_URL
        ? `Cannot reach the backend server at ${API_BASE_URL}. Please verify the server is running.`
        : 'Cannot reach the backend API server. Please verify the service is online and retry.',
      errors: [{ field: 'network', message: 'Network connection failed.' }],
      status: 0,
    };
  }
  return {
    message: error.message || 'An unexpected error occurred.',
    errors: [],
    status: 500,
  };
}

export const apiService = {
  /**
   * Fetch all employees with optional search and sorting
   */
  async getEmployees({ search = '', sortBy = 'id', order = 'asc' } = {}) {
    try {
      const params = {};
      if (search && search.trim()) params.search = search.trim();
      if (sortBy) params.sortBy = sortBy;
      if (order) params.order = order;

      const res = await client.get('/api/employees', { params });
      return res.data;
    } catch (err) {
      throw extractError(err);
    }
  },

  /**
   * Fetch single employee by ID
   */
  async getEmployeeById(id) {
    try {
      const res = await client.get(`/api/employees/${id}`);
      return res.data;
    } catch (err) {
      throw extractError(err);
    }
  },

  /**
   * Create a new employee
   */
  async createEmployee(payload) {
    try {
      const res = await client.post('/api/employees', payload);
      return res.data;
    } catch (err) {
      throw extractError(err);
    }
  },

  /**
   * Update an existing employee
   */
  async updateEmployee(id, payload) {
    try {
      const res = await client.put(`/api/employees/${id}`, payload);
      return res.data;
    } catch (err) {
      throw extractError(err);
    }
  },

  /**
   * Delete an employee
   */
  async deleteEmployee(id) {
    try {
      const res = await client.delete(`/api/employees/${id}`);
      return res.data;
    } catch (err) {
      throw extractError(err);
    }
  },

  /**
   * Retrieve aggregate summary metrics
   */
  async getSummaryStats() {
    try {
      const res = await client.get('/api/employees/stats/summary');
      return res.data;
    } catch (err) {
      throw extractError(err);
    }
  },

  /**
   * Server Health Check
   */
  async checkHealth() {
    try {
      const res = await client.get('/health');
      return res.data;
    } catch (err) {
      throw extractError(err);
    }
  },
};

export default apiService;

