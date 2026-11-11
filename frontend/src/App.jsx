import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Navbar from './components/Navbar.jsx';
import StatCards from './components/StatCards.jsx';
import EmployeeTable from './components/EmployeeTable.jsx';
import EmployeeFormModal from './components/EmployeeFormModal.jsx';
import DeleteConfirmModal from './components/DeleteConfirmModal.jsx';
import Toast from './components/Toast.jsx';
import apiService from './services/api.js';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Application Data States
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(null);

  // Search, Filter & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Focus restoration reference when modals close
  const lastTriggerRef = useRef(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Theme State (Light mode default per UI/UX Pro Max SaaS spec; honors saved preference)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  // Apply theme class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Debounce search term while typing; flush immediately when cleared
  useEffect(() => {
    if (!searchTerm) {
      setDebouncedSearchTerm('');
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  /**
   * Fetch employee records from API
   */
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setNetworkError(null);
    try {
      const res = await apiService.getEmployees({
        search: debouncedSearchTerm,
        sortBy,
        order: sortOrder,
      });

      if (res && res.data) {
        setEmployees(res.data);
      }
    } catch (err) {
      console.error('Fetch employees failed:', err);
      setNetworkError(err.message || 'Unable to connect to backend server.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, sortBy, sortOrder]);

  /**
   * Fetch dashboard statistics
   */
  const fetchStats = useCallback(async () => {
    try {
      const res = await apiService.getSummaryStats();
      if (res && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Failed to load stats:', err);
    }
  }, []);

  // Initial load & reactive updates
  useEffect(() => {
    fetchEmployees();
    fetchStats();
  }, [fetchEmployees, fetchStats]);

  /**
   * Client-side Department filter
   */
  const filteredEmployees = useMemo(() => {
    if (departmentFilter === 'All') return employees;
    return employees.filter(
      (emp) => emp.department.toLowerCase() === departmentFilter.toLowerCase()
    );
  }, [employees, departmentFilter]);

  /**
   * Collect known departments for dynamic filter pills
   */
  const allDepartments = useMemo(() => {
    const names = new Set();
    stats?.departments?.forEach((d) => d.department && names.add(d.department));
    employees.forEach((e) => e.department && names.add(e.department));
    return Array.from(names);
  }, [stats, employees]);

  /**
   * Handle Column Sort Click or Explicit Mobile Dropdown Selection
   */
  const handleSort = (columnKey, explicitOrder = null) => {
    if (explicitOrder) {
      setSortBy(columnKey);
      setSortOrder(explicitOrder);
      return;
    }

    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  const restoreFocus = () => {
    const el = lastTriggerRef.current;
    lastTriggerRef.current = null;
    if (el && typeof el.focus === 'function') {
      setTimeout(() => el.focus(), 20);
    }
  };

  /**
   * Open Add Form
   */
  const handleOpenAdd = () => {
    lastTriggerRef.current = document.activeElement;
    setEditingEmployee(null);
    setIsFormModalOpen(true);
  };

  /**
   * Open Edit Form
   */
  const handleOpenEdit = (emp) => {
    lastTriggerRef.current = document.activeElement;
    setEditingEmployee(emp);
    setIsFormModalOpen(true);
  };

  /**
   * Form Submit handler (Create or Update)
   */
  const handleFormSubmit = async (payload) => {
    setFormSubmitting(true);
    try {
      let savedRecord;
      if (editingEmployee && editingEmployee.id) {
        const updated = await apiService.updateEmployee(editingEmployee.id, payload);
        savedRecord = updated.data;
        showToast(`Employee "${savedRecord.name}" updated successfully!`, 'success');
      } else {
        const created = await apiService.createEmployee(payload);
        savedRecord = created.data;
        showToast(`Employee "${savedRecord.name}" added to directory!`, 'success');
      }

      const trimmedSearch = debouncedSearchTerm.trim().toLowerCase();
      const searchStillMatches =
        !trimmedSearch ||
        [savedRecord.name, savedRecord.department, savedRecord.role].some((val) =>
          String(val || '').toLowerCase().includes(trimmedSearch)
        );

      if (!searchStillMatches) {
        setSearchTerm('');
        setDebouncedSearchTerm('');
      }

      if (
        departmentFilter !== 'All' &&
        savedRecord.department?.toLowerCase() !== departmentFilter.toLowerCase()
      ) {
        setDepartmentFilter('All');
      }

      const freshList = await apiService.getEmployees({
        search: searchStillMatches ? debouncedSearchTerm : '',
        sortBy,
        order: sortOrder,
      });
      if (freshList && freshList.data) {
        setEmployees(freshList.data);
      }

      await fetchStats();
      setIsFormModalOpen(false);
      setEditingEmployee(null);
      restoreFocus();
    } catch (err) {
      showToast(err.message || 'Operation failed. Please verify input data.', 'error');
      throw err;
    } finally {
      setFormSubmitting(false);
    }
  };

  /**
   * Open Delete Confirmation
   */
  const handleOpenDelete = (emp) => {
    lastTriggerRef.current = document.activeElement;
    setEmployeeToDelete(emp);
    setIsDeleteModalOpen(true);
  };

  /**
   * Confirm Deletion
   */
  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    setDeleteSubmitting(true);
    try {
      await apiService.deleteEmployee(employeeToDelete.id);
      showToast(`Record for "${employeeToDelete.name}" deleted successfully.`, 'success');

      setEmployees((prev) => prev.filter((emp) => emp.id !== employeeToDelete.id));
      await fetchStats();

      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
      restoreFocus();
    } catch (err) {
      showToast(err.message || 'Failed to delete employee record.', 'error');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  /**
   * Export to CSV safely using Blob
   */
  const handleExportCsv = () => {
    if (filteredEmployees.length === 0) return;

    const headers = ['ID', 'Name', 'Department', 'Role', 'Salary', 'Join Date', 'Created At'];
    const rows = filteredEmployees.map((emp) => [
      emp.id,
      `"${String(emp.name).replace(/"/g, '""')}"`,
      `"${String(emp.department).replace(/"/g, '""')}"`,
      `"${String(emp.role).replace(/"/g, '""')}"`,
      emp.salary,
      emp.join_date,
      emp.created_at || '',
    ]);

    const csvString = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const dateStamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;

    const link = document.createElement('a');
    link.href = url;
    link.download = `employees_export_${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${filteredEmployees.length} employee records to CSV!`, 'success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-foreground transition-colors">
      {/* Top Navbar */}
      <Navbar
        onAddNew={handleOpenAdd}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Offline / Backend Error Alert Banner */}
        {networkError && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-800 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-modal"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">
                  Backend API Connection Notice
                </p>
                <p className="text-xs opacity-90">
                  {networkError} Ensure the server is started with{' '}
                  <code className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 font-mono">
                    cd backend && npm start
                  </code>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                fetchEmployees();
                fetchStats();
              }}
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-rose-100 dark:bg-rose-500/20 hover:bg-rose-200 dark:hover:bg-rose-500/30 text-rose-900 dark:text-rose-100 cursor-pointer transition-colors shrink-0 self-start sm:self-center focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* Dashboard Title & Introduction */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Employee Management Directory
              </h1>
            </div>
            <p className="text-sm text-mutedFg mt-1.5 max-w-2xl">
              Streamlined HR console to view, search, filter, register, update, and manage company employee records.
            </p>
          </div>
        </div>

        {/* Aggregate Stats Cards & Department Mix */}
        <StatCards
          stats={stats}
          employeeCount={employees.length}
          departmentFilter={departmentFilter}
          onSelectDepartment={setDepartmentFilter}
        />

        {/* Primary Data Table / Mobile Cards */}
        <EmployeeTable
          employees={filteredEmployees}
          allDepartments={allDepartments}
          loading={loading || (!searchTerm && Boolean(debouncedSearchTerm))}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          departmentFilter={departmentFilter}
          setDepartmentFilter={setDepartmentFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onAddNew={handleOpenAdd}
          onExportCsv={handleExportCsv}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-borderToken py-5 bg-card/60 transition-colors text-xs text-mutedFg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-semibold text-foreground">NexusHR CRUD System</span>
            <span aria-hidden="true">•</span>
            <span>React.js (Vite) + Node.js (Express) + PostgreSQL / SQLite</span>
          </div>

          <div className="flex items-center gap-3 text-mutedFg">
            <span>
              REST API: <code className="text-primary font-mono font-medium">/api/employees</code>
            </span>
            <span aria-hidden="true">•</span>
            <span>Postman v2.1 Ready</span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Form Modal */}
      <EmployeeFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingEmployee(null);
          restoreFocus();
        }}
        onSubmit={handleFormSubmit}
        employee={editingEmployee}
        loading={formSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEmployeeToDelete(null);
          restoreFocus();
        }}
        onConfirm={handleDeleteConfirm}
        employee={employeeToDelete}
        loading={deleteSubmitting}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
