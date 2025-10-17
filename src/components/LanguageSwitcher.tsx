import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supportedLngs } from '@/i18n';

const languageNames = {
  en: 'English',
  es: 'Español', 
  de: 'Deutsch',
  pt: 'Português',
  nl: 'Nederlands',
} as const;

export const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation('common');

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          aria-label="Switch language"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {languageNames[i18n.language as keyof typeof languageNames] || 'EN'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {supportedLngs.map((lng) => (
          <DropdownMenuItem
            key={lng}
            onClick={() => handleLanguageChange(lng)}
            className={`cursor-pointer ${
              i18n.language === lng ? 'bg-accent' : ''
            }`}
          >
            <span className="mr-2 text-xs font-mono uppercase">{lng}</span>
            {languageNames[lng as keyof typeof languageNames]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};