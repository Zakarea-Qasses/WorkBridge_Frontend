import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';

interface FreshAuthLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  mode: 'login' | 'register';
}

export const FreshAuthLink = forwardRef<HTMLAnchorElement, FreshAuthLinkProps>(
  function FreshAuthLink({ mode, onClick, ...props }, ref) {
    const { startAuthFlow } = useAuth();

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) {
        return;
      }

      event.preventDefault();
      startAuthFlow(mode);
    };

    return (
      <a
        {...props}
        ref={ref}
        href={mode === 'login' ? '/login' : '/register'}
        onClick={handleClick}
      />
    );
  },
);
