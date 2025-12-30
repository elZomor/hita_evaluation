import { Moon, Sun, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { useLocaleFormatting } from '@/lib/hooks/useLocaleFormatting';
import { useAuthStore } from '@/store/useAuthStore';
import { FlagIcon } from '../FlagIcon';

interface TopBarProps {
  lastUpdated?: Date;
}

export function TopBar({ lastUpdated }: TopBarProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { formatDate } = useLocaleFormatting();
  const logout = useAuthStore((state) => state.logout);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">{t('dashboard.title')}</h1>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              {t('dashboard.lastUpdated')}: {formatDate(lastUpdated, 'PPp')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="transition-transform hover:scale-105"
            aria-label={t('common.language')}
          >
            <FlagIcon variant={i18n.language === 'ar' ? 'uk' : 'eg'} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="transition-transform hover:scale-105"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="transition-transform hover:scale-105 text-destructive hover:text-destructive"
            aria-label={t('login.logout')}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
