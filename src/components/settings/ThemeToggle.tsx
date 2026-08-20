'use client';

import { useTheme, type Theme } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';

const THEME_OPTIONS: { value: Theme; icon: string; labelKey: string }[] = [
  { value: 'light', icon: '☀️', labelKey: 'settings.theme.light' },
  { value: 'dark', icon: '🌙', labelKey: 'settings.theme.dark' },
  { value: 'system', icon: '💻', labelKey: 'settings.theme.system' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-1 rounded-xl bg-gray-100 dark:bg-white/10 p-1">
      {THEME_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setTheme(option.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            theme === option.value
              ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
          }`}
          aria-label={t(option.labelKey)}
        >
          <span>{option.icon}</span>
          <span className="hidden sm:inline">{t(option.labelKey)}</span>
        </button>
      ))}
    </div>
  );
}

export default ThemeToggle;
