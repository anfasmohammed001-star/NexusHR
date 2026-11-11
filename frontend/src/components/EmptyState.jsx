import React from 'react';
import { Users, SearchX, Plus, RefreshCw } from 'lucide-react';

export default function EmptyState({ isFiltered, onReset, onAddNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      <div
        className="w-16 h-16 rounded-2xl bg-muted border border-borderToken flex items-center justify-center mb-4 text-mutedFg shadow-inner"
        aria-hidden="true"
      >
        {isFiltered ? (
          <SearchX className="w-8 h-8 text-accent" />
        ) : (
          <Users className="w-8 h-8 text-primary" />
        )}
      </div>

      <h3 className="text-lg font-bold text-foreground mb-1">
        {isFiltered ? 'No matching employees found' : 'No employee records yet'}
      </h3>

      <p className="text-sm text-mutedFg max-w-sm mb-6">
        {isFiltered
          ? 'No employees matched your active search query or department filters. Try adjusting your search term or clear the filter.'
          : 'Your organization directory is currently empty. Get started by registering your first employee record.'}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {isFiltered ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-sm font-semibold rounded-xl border border-borderToken bg-card text-foreground hover:bg-muted cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Clear Filters</span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={onAddNew}
          className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-sm font-semibold rounded-xl bg-primary hover:bg-primaryHover text-onPrimary shadow-glow-primary cursor-pointer transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Employee</span>
        </button>
      </div>
    </div>
  );
}
