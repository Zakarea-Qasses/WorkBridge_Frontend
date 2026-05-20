import { Button } from '@/app/components/ui';
import { useLanguage } from '@/app/providers/LanguageProvider';

interface LanguageToggleProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  className?: string;
}

export default function LanguageToggle({
  variant = 'outline',
  className,
}: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button type="button" variant={variant} onClick={toggleLanguage} className={className}>
      {language === 'ar' ? 'English' : 'العربية'}
    </Button>
  );
}
