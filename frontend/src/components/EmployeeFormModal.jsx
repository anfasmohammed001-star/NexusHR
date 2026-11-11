import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Loader2, User, Building, Briefcase, IndianRupee, Calendar, AlertCircle } from 'lucide-react';

const DEFAULT_DEPARTMENTS = [
  'Engineering',
  'HR',
  'Finance',
  'Sales',
  'Operations',
  'Marketing',
];

const FIELD_ORDER = ['name', 'department', 'role', 'salary', 'join_date'];

function getLocalTodayString() {
  const now = new Date();
  const yr = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const dy = String(now.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${dy}`;
}

export default function EmployeeFormModal({
  isOpen,
  onClose,
  onSubmit,
  employee = null, // null for Add, object for Edit
  loading = false,
}) {
  const isEdit = Boolean(employee && employee.id);

  const nameInputRef = useRef(null);
  const errorSummaryRef = useRef(null);

  const departmentOptions = useMemo(() => {
    if (employee?.department && !DEFAULT_DEPARTMENTS.includes(employee.department)) {
      return [employee.department, ...DEFAULT_DEPARTMENTS];
    }
    return DEFAULT_DEPARTMENTS;
  }, [employee]);

  const [formData, setFormData] = useState({
    name: '',
    department: 'Engineering',
    role: '',
    salary: '',
    join_date: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Escape key closes modal when not submitting
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  // Reset or pre-fill on open/change & focus first input
  useEffect(() => {
    if (isOpen) {
      if (employee) {
        let formattedDate = employee.join_date || '';
        if (formattedDate.includes('T')) {
          formattedDate = formattedDate.split('T')[0];
        }

        setFormData({
          name: employee.name || '',
          department: employee.department || 'Engineering',
          role: employee.role || '',
          salary: employee.salary !== undefined ? employee.salary.toString() : '',
          join_date: formattedDate,
        });
      } else {
        setFormData({
          name: '',
          department: 'Engineering',
          role: '',
          salary: '',
          join_date: getLocalTodayString(),
        });
      }
      setErrors({});
      setTouched({});
      setSubmitAttempted(false);

      // Move focus to first form control when modal mounts
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 20);
    }
  }, [isOpen, employee]);

  if (!isOpen) return null;

  const validate = (data = formData) => {
    const errs = {};

    if (!data.name || data.name.trim() === '') {
      errs.name = 'Full name is required and cannot be empty.';
    } else if (data.name.trim().length > 100) {
      errs.name = 'Name cannot exceed 100 characters.';
    }

    if (!data.department || data.department.trim() === '') {
      errs.department = 'Department selection is required.';
    } else if (data.department.trim().length > 100) {
      errs.department = 'Department cannot exceed 100 characters.';
    }

    if (!data.role || data.role.trim() === '') {
      errs.role = 'Role / Job title is required.';
    } else if (data.role.trim().length > 100) {
      errs.role = 'Role cannot exceed 100 characters.';
    }

    if (
      data.salary === '' ||
      data.salary === undefined ||
      data.salary === null ||
      String(data.salary).trim() === ''
    ) {
      errs.salary = 'Salary is required.';
    } else {
      const num = Number(data.salary);
      if (isNaN(num) || !isFinite(num)) {
        errs.salary = 'Salary must be a valid number.';
      } else if (num <= 0) {
        errs.salary = 'Salary must be a positive number greater than 0.';
      } else if (num > 9999999999.99) {
        errs.salary = 'Salary cannot exceed 9,999,999,999.99.';
      }
    }

    if (!data.join_date) {
      errs.join_date = 'Join date is required.';
    } else {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(data.join_date)) {
        errs.join_date = 'Date must be in YYYY-MM-DD format.';
      } else {
        const [year, month, day] = data.join_date.split('-').map(Number);
        const parsed = new Date(year, month - 1, day);
        if (
          parsed.getFullYear() !== year ||
          parsed.getMonth() !== month - 1 ||
          parsed.getDate() !== day
        ) {
          errs.join_date = 'Please enter a valid calendar date.';
        }
      }
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (touched[name]) {
      setErrors(validate(updated));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    setTouched({
      name: true,
      department: true,
      role: true,
      salary: true,
      join_date: true,
    });

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setTimeout(() => {
        errorSummaryRef.current?.focus();
      }, 10);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      department: formData.department.trim(),
      role: formData.role.trim(),
      salary: Math.round(parseFloat(formData.salary) * 100) / 100,
      join_date: formData.join_date,
    };

    try {
      await onSubmit(payload);
    } catch (apiErr) {
      if (apiErr.errors && Array.isArray(apiErr.errors)) {
        const backendErrs = {};
        apiErr.errors.forEach((err) => {
          if (err.field) backendErrs[err.field] = err.message;
        });
        setErrors(backendErrs);
        setTimeout(() => {
          errorSummaryRef.current?.focus();
        }, 10);
      }
    }
  };

  const activeErrorList = FIELD_ORDER.filter((field) => errors[field]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-opacity"
      style={{ backgroundColor: 'var(--scrim-bg)' }}
      onClick={() => !loading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-form-title"
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-card border border-borderToken shadow-2xl p-6 sm:p-7 text-cardFg animate-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-borderToken">
          <div>
            <h2 id="employee-form-title" className="text-xl font-bold tracking-tight text-cardFg">
              {isEdit ? 'Edit Employee Details' : 'Add New Employee'}
            </h2>
            <p className="text-xs text-mutedFg mt-0.5">
              {isEdit
                ? `Update record for ID #${employee.id}`
                : 'Fill in the information below to register a new employee.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center justify-center min-h-[38px] min-w-[38px] p-1.5 rounded-xl text-mutedFg hover:text-foreground hover:bg-muted cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-5" noValidate>
          {/* Focusable Error Summary for Failed Submission (Accessibility UX Guideline) */}
          {submitAttempted && activeErrorList.length > 0 && (
            <div
              ref={errorSummaryRef}
              role="alert"
              tabIndex={-1}
              aria-labelledby="form-error-summary-title"
              className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 text-rose-800 dark:text-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1.5">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" aria-hidden="true" />
                <span id="form-error-summary-title">
                  Please fix {activeErrorList.length} {activeErrorList.length === 1 ? 'error' : 'errors'} before submitting
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                {activeErrorList.map((field) => (
                  <li key={field}>
                    <a
                      href={`#emp-field-${field}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(`emp-field-${field}`)?.focus();
                      }}
                      className="underline font-medium hover:text-destructive focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive rounded"
                    >
                      {errors[field]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label
              htmlFor="emp-field-name"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Full Name <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <User
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedFg pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={nameInputRef}
                id="emp-field-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Alex Morgan"
                disabled={loading}
                aria-required="true"
                aria-invalid={Boolean(errors.name && touched.name)}
                aria-describedby={errors.name && touched.name ? 'emp-field-name-error' : undefined}
                className={`w-full min-h-[42px] pl-10 pr-4 py-2.5 rounded-xl bg-canvas border text-sm text-foreground placeholder:text-mutedFg focus:outline-none focus-visible:ring-2 transition-colors ${
                  errors.name && touched.name
                    ? 'border-destructive focus-visible:ring-destructive'
                    : 'border-borderToken focus:border-primary focus-visible:ring-ringToken'
                }`}
              />
            </div>
            {errors.name && touched.name && (
              <p
                id="emp-field-name-error"
                className="mt-1.5 text-xs font-medium text-destructive flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Department & Role Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <label
                htmlFor="emp-field-department"
                className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
              >
                Department <span className="text-destructive" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <Building
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedFg pointer-events-none"
                  aria-hidden="true"
                />
                <select
                  id="emp-field-department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  aria-required="true"
                  aria-invalid={Boolean(errors.department && touched.department)}
                  aria-describedby={
                    errors.department && touched.department ? 'emp-field-department-error' : undefined
                  }
                  className={`w-full min-h-[42px] pl-10 pr-8 py-2.5 rounded-xl bg-canvas border text-sm text-foreground focus:outline-none focus-visible:ring-2 transition-colors appearance-none cursor-pointer ${
                    errors.department && touched.department
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'border-borderToken focus:border-primary focus-visible:ring-ringToken'
                  }`}
                >
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept} className="bg-card text-cardFg">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              {errors.department && touched.department && (
                <p
                  id="emp-field-department-error"
                  className="mt-1.5 text-xs font-medium text-destructive flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.department}</span>
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="emp-field-role"
                className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
              >
                Role / Title <span className="text-destructive" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <Briefcase
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedFg pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="emp-field-role"
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Senior Engineer"
                  disabled={loading}
                  aria-required="true"
                  aria-invalid={Boolean(errors.role && touched.role)}
                  aria-describedby={errors.role && touched.role ? 'emp-field-role-error' : undefined}
                  className={`w-full min-h-[42px] pl-10 pr-4 py-2.5 rounded-xl bg-canvas border text-sm text-foreground placeholder:text-mutedFg focus:outline-none focus-visible:ring-2 transition-colors ${
                    errors.role && touched.role
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'border-borderToken focus:border-primary focus-visible:ring-ringToken'
                  }`}
                />
              </div>
              {errors.role && touched.role && (
                <p
                  id="emp-field-role-error"
                  className="mt-1.5 text-xs font-medium text-destructive flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.role}</span>
                </p>
              )}
            </div>
          </div>

          {/* Salary & Join Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Salary */}
            <div>
              <label
                htmlFor="emp-field-salary"
                className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
              >
                Annual Salary (₹) <span className="text-destructive" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <IndianRupee
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedFg pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="emp-field-salary"
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. 115000"
                  step="0.01"
                  min="0.01"
                  disabled={loading}
                  aria-required="true"
                  aria-invalid={Boolean(errors.salary && touched.salary)}
                  aria-describedby={
                    errors.salary && touched.salary ? 'emp-field-salary-error' : undefined
                  }
                  className={`w-full min-h-[42px] pl-10 pr-4 py-2.5 rounded-xl bg-canvas border text-sm text-foreground tabular-nums placeholder:text-mutedFg focus:outline-none focus-visible:ring-2 transition-colors ${
                    errors.salary && touched.salary
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'border-borderToken focus:border-primary focus-visible:ring-ringToken'
                  }`}
                />
              </div>
              {errors.salary && touched.salary && (
                <p
                  id="emp-field-salary-error"
                  className="mt-1.5 text-xs font-medium text-destructive flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.salary}</span>
                </p>
              )}
            </div>

            {/* Join Date */}
            <div>
              <label
                htmlFor="emp-field-join_date"
                className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
              >
                Join Date <span className="text-destructive" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedFg pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="emp-field-join_date"
                  type="date"
                  name="join_date"
                  value={formData.join_date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  aria-required="true"
                  aria-invalid={Boolean(errors.join_date && touched.join_date)}
                  aria-describedby={
                    errors.join_date && touched.join_date ? 'emp-field-join_date-error' : undefined
                  }
                  className={`w-full min-h-[42px] pl-10 pr-4 py-2.5 rounded-xl bg-canvas border text-sm text-foreground tabular-nums placeholder:text-mutedFg focus:outline-none focus-visible:ring-2 transition-colors cursor-pointer ${
                    errors.join_date && touched.join_date
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'border-borderToken focus:border-primary focus-visible:ring-ringToken'
                  }`}
                />
              </div>
              {errors.join_date && touched.join_date && (
                <p
                  id="emp-field-join_date-error"
                  className="mt-1.5 text-xs font-medium text-destructive flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.join_date}</span>
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-borderToken">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="min-h-[42px] px-4 py-2 rounded-xl border border-borderToken text-sm font-semibold text-foreground hover:bg-muted cursor-pointer transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2 rounded-xl bg-primary hover:bg-primaryHover text-onPrimary text-sm font-semibold shadow-glow-primary cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              <span>
                {loading
                  ? isEdit
                    ? 'Saving Changes...'
                    : 'Creating Record...'
                  : isEdit
                  ? 'Save Changes'
                  : 'Create Employee'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
