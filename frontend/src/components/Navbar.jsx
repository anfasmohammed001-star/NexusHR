import React from 'react';
import { Users2, Plus, Sun, Moon } from 'lucide-react';

export default function Navbar({ onAddNew, isDarkMode, toggleTheme }) {
  return (
    <header className="sticky top-0 z-30 border-b border-borderToken glass-header transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center shadow-glow-primary text-white shrink-0"
            aria-hidden="true"
          >
            <Users2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-foreground truncate">
                Nexus<span className="text-primary">HR</span>
              </span>
              <span className="hidden xs:inline-flex items-center text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted text-mutedFg border border-borderToken whitespace-nowrap">
                Directory
              </span>
            </div>
            <p className="text-xs text-mutedFg truncate">
              Employee Records &amp; HR Console
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={isDarkMode}
            className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] p-2 rounded-xl border border-borderToken bg-card text-mutedFg hover:text-foreground hover:bg-muted cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          {/* Primary Add Employee CTA */}
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-sm font-semibold rounded-xl bg-primary hover:bg-primaryHover text-onPrimary shadow-glow-primary cursor-pointer transition-all duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-ringToken focus-visible:ring-offset-2 focus-visible:ring-offset-canvas whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            <span className="hidden sm:inline">Add Employee</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
}
