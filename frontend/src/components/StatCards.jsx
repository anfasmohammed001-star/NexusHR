import React from 'react';
import { Users, IndianRupee, Wallet, Building2, TrendingUp, Layers } from 'lucide-react';
import { formatCurrency } from '../utils/formatters.js';

const DEPT_BAR_COLORS = {
  Engineering: 'bg-blue-600 dark:bg-blue-500',
  HR: 'bg-rose-600 dark:bg-rose-500',
  Finance: 'bg-emerald-600 dark:bg-emerald-500',
  Sales: 'bg-orange-600 dark:bg-orange-500',
  Operations: 'bg-cyan-600 dark:bg-cyan-500',
  Marketing: 'bg-violet-600 dark:bg-violet-500',
};

const DEPT_DOT_COLORS = {
  Engineering: 'bg-blue-600 dark:bg-blue-500',
  HR: 'bg-rose-600 dark:bg-rose-500',
  Finance: 'bg-emerald-600 dark:bg-emerald-500',
  Sales: 'bg-orange-600 dark:bg-orange-500',
  Operations: 'bg-cyan-600 dark:bg-cyan-500',
  Marketing: 'bg-violet-600 dark:bg-violet-500',
};

export default function StatCards({
  stats,
  employeeCount,
  departmentFilter = 'All',
  onSelectDepartment,
}) {
  const totalEmployees = stats?.totalEmployees ?? employeeCount ?? 0;
  const avgSalary = stats?.averageSalary ?? 0;
  const totalPayroll = stats?.totalPayroll ?? 0;
  const departments = stats?.departments ?? [];
  const departmentsCount = departments.length;

  const cards = [
    {
      title: 'Total Headcount',
      value: totalEmployees.toString(),
      subtext: `${departmentsCount} active departments`,
      icon: Users,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      accent: 'from-blue-600/80 via-blue-500/40 to-transparent',
    },
    {
      title: 'Average Salary',
      value: formatCurrency(avgSalary, 0),
      subtext: 'Across all designations',
      icon: IndianRupee,
      iconBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      accent: 'from-emerald-600/80 via-emerald-500/40 to-transparent',
    },
    {
      title: 'Annual Payroll',
      value: formatCurrency(totalPayroll, 0),
      subtext: 'Total compensation budget',
      icon: Wallet,
      iconBg: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
      accent: 'from-orange-600/80 via-orange-500/40 to-transparent',
    },
    {
      title: 'Team Coverage',
      value: `${departmentsCount} Teams`,
      subtext: 'Org-wide distribution',
      icon: Building2,
      iconBg: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20',
      accent: 'from-violet-600/80 via-violet-500/40 to-transparent',
    },
  ];

  return (
    <section aria-label="Organization metrics summary" className="space-y-3 mb-6">
      {/* Dense 4-Column KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl bg-card border border-borderToken p-4 sm:p-5 shadow-token-card hover:shadow-token-card-hover hover:border-blue-500/30 dark:hover:border-blue-400/30 transition-all duration-200 group"
            >
              <div
                className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${card.accent}`}
                aria-hidden="true"
              />

              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold tracking-wider uppercase text-mutedFg">
                  {card.title}
                </span>
                <div
                  className={`p-2 rounded-xl border ${card.iconBg} transition-transform duration-200 group-hover:scale-105`}
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl font-bold tracking-tight text-cardFg tabular-nums mb-1">
                {card.value}
              </div>

              <div className="text-xs text-mutedFg flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                <span>{card.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workforce Distribution Mix Bar + Interactive Legend */}
      {departments.length > 0 && totalEmployees > 0 && (
        <div className="rounded-2xl bg-card border border-borderToken p-4 shadow-token-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-mutedFg">
                Workforce Distribution by Department
              </h2>
            </div>
            <span className="text-xs text-mutedFg">
              Select any team below to filter directory
            </span>
          </div>

          {/* Stacked Proportional Distribution Bar */}
          <div
            className="w-full h-2.5 rounded-full bg-muted overflow-hidden flex gap-0.5 mb-3"
            role="img"
            aria-label={`Workforce distribution across ${departments.length} departments`}
          >
            {departments.map((d) => {
              const count = Number(d.count) || 0;
              const pct = Math.max(2, (count / totalEmployees) * 100);
              const barColor = DEPT_BAR_COLORS[d.department] || 'bg-slate-500';
              const isSelected = departmentFilter === d.department;
              const isDimmed = departmentFilter !== 'All' && !isSelected;

              return (
                <div
                  key={d.department}
                  style={{ width: `${pct}%` }}
                  className={`h-full transition-opacity duration-200 ${barColor} ${
                    isDimmed ? 'opacity-30' : 'opacity-100'
                  }`}
                  title={`${d.department}: ${count} (${Math.round((count / totalEmployees) * 100)}%)`}
                />
              );
            })}
          </div>

          {/* Interactive Accessible Legend Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {departments.map((d) => {
              const count = Number(d.count) || 0;
              const pct = Math.round((count / totalEmployees) * 100);
              const dotColor = DEPT_DOT_COLORS[d.department] || 'bg-slate-500';
              const isSelected = departmentFilter === d.department;

              return (
                <button
                  key={d.department}
                  type="button"
                  onClick={() =>
                    onSelectDepartment &&
                    onSelectDepartment(isSelected ? 'All' : d.department)
                  }
                  aria-pressed={isSelected}
                  className={`inline-flex items-center gap-2 min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken ${
                    isSelected
                      ? 'bg-primary/10 text-primary border-primary/40 font-semibold'
                      : 'bg-canvas text-mutedFg border-borderToken hover:text-foreground hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} aria-hidden="true" />
                  <span>{d.department}</span>
                  <span className="font-mono tabular-nums text-[11px] opacity-80">
                    {count} ({pct}%)
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
