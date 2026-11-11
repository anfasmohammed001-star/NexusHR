import React, { useMemo } from 'react';
import {
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Calendar,
  Briefcase,
  Download,
  Filter,
  Loader2,
} from 'lucide-react';
import EmptyState from './EmptyState.jsx';
import { formatCurrency } from '../utils/formatters.js';

const BASE_DEPARTMENTS = ['All', 'Engineering', 'HR', 'Finance', 'Sales', 'Operations', 'Marketing'];

const DEPARTMENT_COLORS = {
  Engineering: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25',
  HR: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25',
  Finance: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
  Sales: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/25',
  Operations: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/25',
  Marketing: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/25',
};

const AVATAR_COLORS = [
  'from-blue-600 to-blue-800',
  'from-emerald-600 to-teal-800',
  'from-rose-600 to-pink-800',
  'from-orange-600 to-amber-800',
  'from-violet-600 to-purple-800',
  'from-cyan-600 to-sky-800',
];

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function EmployeeTable({
  employees = [],
  allDepartments = [],
  loading = false,
  searchTerm = '',
  setSearchTerm,
  departmentFilter = 'All',
  setDepartmentFilter,
  sortBy = 'id',
  sortOrder = 'asc',
  onSort,
  onEdit,
  onDelete,
  onAddNew,
  onExportCsv,
}) {
  // Include any custom department present in records alongside defaults
  const departments = useMemo(() => {
    const set = new Set(BASE_DEPARTMENTS);
    allDepartments.forEach((d) => {
      if (d) set.add(d);
    });
    return Array.from(set);
  }, [allDepartments]);

  const getAriaSort = (columnKey) => {
    if (sortBy !== columnKey) return 'none';
    return sortOrder === 'asc' ? 'ascending' : 'descending';
  };

  const renderSortIndicator = (columnKey) => {
    if (sortBy !== columnKey) {
      return (
        <ArrowUpDown
          className="w-3.5 h-3.5 text-mutedFg opacity-40 group-hover:opacity-100 transition-opacity shrink-0"
          aria-hidden="true"
        />
      );
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
    );
  };

  const isFiltered = Boolean(searchTerm.trim() || departmentFilter !== 'All');

  return (
    <div className="rounded-2xl border border-borderToken bg-card overflow-hidden shadow-token-card transition-colors">
      {/* Search, Sort (Mobile) & Filter Toolbar */}
      <div className="p-4 sm:p-5 border-b border-borderToken flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <label htmlFor="employee-search" className="sr-only">
              Search employees by name, department, or role
            </label>
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedFg pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="employee-search"
              type="text"
              placeholder="Search by name, department, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-h-[40px] pl-10 pr-16 py-2 rounded-xl bg-canvas border border-borderToken text-sm text-foreground placeholder:text-mutedFg focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken focus:border-primary transition-colors"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {loading && employees.length > 0 && (
                <Loader2 className="w-4 h-4 text-primary animate-spin" aria-hidden="true" />
              )}
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center justify-center min-h-[32px] min-w-[32px] rounded-lg text-mutedFg hover:text-foreground hover:bg-muted cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken"
                  aria-label="Clear search query"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Action Tools: Mobile Sort + Export CSV + Live Count */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Compact Sort Selector for Mobile / Quick Access */}
            <div className="flex md:hidden items-center gap-1.5">
              <label htmlFor="mobile-sort" className="sr-only">
                Sort employees by
              </label>
              <select
                id="mobile-sort"
                value={`${sortBy}:${sortOrder}`}
                onChange={(e) => {
                  const [col, ord] = e.target.value.split(':');
                  onSort(col, ord);
                }}
                className="min-h-[38px] px-3 py-1.5 rounded-xl border border-borderToken bg-canvas text-xs font-semibold text-foreground cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken"
              >
                <option value="id:asc">Sort: Default</option>
                <option value="name:asc">Name (A-Z)</option>
                <option value="name:desc">Name (Z-A)</option>
                <option value="salary:desc">Salary (High-Low)</option>
                <option value="salary:asc">Salary (Low-High)</option>
                <option value="join_date:desc">Newest Hires</option>
                <option value="join_date:asc">Longest Tenure</option>
              </select>
            </div>

            <button
              type="button"
              onClick={onExportCsv}
              disabled={employees.length === 0}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-2 text-xs font-semibold rounded-xl border border-borderToken bg-canvas hover:bg-muted text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken"
              title="Export displayed records to CSV"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Export CSV</span>
            </button>

            <span
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="inline-flex items-center min-h-[38px] text-xs font-medium text-mutedFg px-3 py-2 rounded-xl bg-canvas border border-borderToken tabular-nums whitespace-nowrap"
            >
              Showing {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
            </span>
          </div>
        </div>

        {/* Department Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by department">
          <Filter className="w-3.5 h-3.5 text-mutedFg shrink-0" aria-hidden="true" />
          {departments.map((dept) => {
            const isActive = departmentFilter === dept;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setDepartmentFilter(dept)}
                aria-pressed={isActive}
                className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors shrink-0 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken ${
                  isActive
                    ? 'bg-primary text-onPrimary shadow-sm'
                    : 'bg-canvas text-mutedFg hover:text-foreground hover:bg-muted border border-borderToken'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Card List (< md) — Prevents horizontal table clipping on 375px viewports */}
      <div className="md:hidden divide-y divide-borderToken">
        {loading && employees.length === 0 && (
          <div className="p-4 space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-muted/50 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-20 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-4 w-44 bg-muted rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && employees.length === 0 && (
          <EmptyState
            isFiltered={isFiltered}
            onReset={() => {
              setSearchTerm('');
              setDepartmentFilter('All');
            }}
            onAddNew={onAddNew}
          />
        )}

        {employees.map((emp) => {
          const deptStyle =
            DEPARTMENT_COLORS[emp.department] ||
            'bg-muted text-foreground border-borderToken';

          return (
            <div key={emp.id} className="p-4 space-y-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${getAvatarColor(
                      emp.name
                    )} flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0`}
                    aria-hidden="true"
                  >
                    {getInitials(emp.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate">
                      {emp.name}
                    </div>
                    <div className="text-xs text-mutedFg font-mono tabular-nums">
                      ID #{emp.id}
                    </div>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap shrink-0 ${deptStyle}`}
                >
                  {emp.department}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-mutedFg min-w-0">
                  <Briefcase className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate text-foreground font-medium">{emp.role}</span>
                </div>
                <div className="text-right font-mono font-semibold text-foreground tabular-nums">
                  {formatCurrency(emp.salary, 2)}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-borderToken/60">
                <div className="flex items-center gap-1.5 text-xs text-mutedFg tabular-nums">
                  <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Joined {formatDate(emp.join_date)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(emp)}
                    className="inline-flex items-center gap-1 min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken"
                    aria-label={`Edit ${emp.name}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(emp)}
                    className="inline-flex items-center gap-1 min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                    aria-label={`Delete ${emp.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Data-Dense Table (md+) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead
            className="text-xs uppercase tracking-wider text-mutedFg border-b border-borderToken select-none sticky top-0"
            style={{ backgroundColor: 'var(--table-header-bg)' }}
          >
            <tr>
              <th scope="col" aria-sort={getAriaSort('name')} className="py-3 px-4 font-semibold">
                <button
                  type="button"
                  onClick={() => onSort('name')}
                  className="inline-flex items-center gap-1.5 group text-left hover:text-foreground cursor-pointer transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken"
                >
                  <span>Employee</span>
                  {renderSortIndicator('name')}
                </button>
              </th>

              <th scope="col" aria-sort={getAriaSort('department')} className="py-3 px-4 font-semibold">
                <button
                  type="button"
                  onClick={() => onSort('department')}
                  className="inline-flex items-center gap-1.5 group text-left hover:text-foreground cursor-pointer transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken"
                >
                  <span>Department</span>
                  {renderSortIndicator('department')}
                </button>
              </th>

              <th scope="col" aria-sort={getAriaSort('role')} className="py-3 px-4 font-semibold">
                <button
                  type="button"
                  onClick={() => onSort('role')}
                  className="inline-flex items-center gap-1.5 group text-left hover:text-foreground cursor-pointer transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken"
                >
                  <span>Role / Designation</span>
                  {renderSortIndicator('role')}
                </button>
              </th>

              <th scope="col" aria-sort={getAriaSort('salary')} className="py-3 px-4 font-semibold text-right">
                <button
                  type="button"
                  onClick={() => onSort('salary')}
                  className="inline-flex items-center justify-end gap-1.5 group ml-auto hover:text-foreground cursor-pointer transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken"
                >
                  <span>Salary</span>
                  {renderSortIndicator('salary')}
                </button>
              </th>

              <th scope="col" aria-sort={getAriaSort('join_date')} className="py-3 px-4 font-semibold">
                <button
                  type="button"
                  onClick={() => onSort('join_date')}
                  className="inline-flex items-center gap-1.5 group text-left hover:text-foreground cursor-pointer transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken"
                >
                  <span>Join Date</span>
                  {renderSortIndicator('join_date')}
                </button>
              </th>

              <th scope="col" className="py-3 px-4 font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-borderToken">
            {/* Loading Skeleton */}
            {loading && employees.length === 0 && (
              <>
                {[1, 2, 3, 4, 5].map((idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-muted" />
                        <div className="space-y-1.5">
                          <div className="h-4 w-28 bg-muted rounded" />
                          <div className="h-3 w-16 bg-muted/70 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-6 w-20 bg-muted rounded-full" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-32 bg-muted rounded" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="h-4 w-24 bg-muted rounded ml-auto" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-20 bg-muted rounded" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="h-8 w-20 bg-muted rounded ml-auto" />
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* Empty State */}
            {!loading && employees.length === 0 && (
              <tr>
                <td colSpan={6} className="p-0">
                  <EmptyState
                    isFiltered={isFiltered}
                    onReset={() => {
                      setSearchTerm('');
                      setDepartmentFilter('All');
                    }}
                    onAddNew={onAddNew}
                  />
                </td>
              </tr>
            )}

            {/* Data Rows */}
            {employees.map((emp) => {
              const deptStyle =
                DEPARTMENT_COLORS[emp.department] ||
                'bg-muted text-foreground border-borderToken';

              return (
                <tr
                  key={emp.id}
                  className="hover:bg-blue-500/[0.04] dark:hover:bg-blue-400/[0.06] transition-colors group"
                >
                  {/* Name + Avatar */}
                  <td className="py-3 px-4 max-w-[240px]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getAvatarColor(
                          emp.name
                        )} flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0`}
                        aria-hidden="true"
                      >
                        {getInitials(emp.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {emp.name}
                        </div>
                        <div className="text-[11px] text-mutedFg font-mono tabular-nums">
                          ID #{emp.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department Pill */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${deptStyle}`}
                    >
                      {emp.department}
                    </span>
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4 text-foreground max-w-[240px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Briefcase className="w-3.5 h-3.5 text-mutedFg shrink-0" aria-hidden="true" />
                      <span className="truncate">{emp.role}</span>
                    </div>
                  </td>

                  {/* Salary */}
                  <td className="py-3 px-4 text-right font-semibold font-mono text-foreground tabular-nums whitespace-nowrap">
                    {formatCurrency(emp.salary, 2)}
                  </td>

                  {/* Join Date */}
                  <td className="py-3 px-4 text-mutedFg whitespace-nowrap tabular-nums">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-mutedFg shrink-0" aria-hidden="true" />
                      <span>{formatDate(emp.join_date)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(emp)}
                        className="inline-flex items-center justify-center min-h-[36px] min-w-[36px] p-2 rounded-lg text-mutedFg hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/25 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken"
                        title={`Edit ${emp.name}`}
                        aria-label={`Edit ${emp.name}`}
                      >
                        <Edit2 className="w-4 h-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(emp)}
                        className="inline-flex items-center justify-center min-h-[36px] min-w-[36px] p-2 rounded-lg text-mutedFg hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/25 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                        title={`Delete ${emp.name}`}
                        aria-label={`Delete ${emp.name}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
