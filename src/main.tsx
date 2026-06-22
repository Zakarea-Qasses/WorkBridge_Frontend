
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { LanguageProvider } from '@/app/providers/LanguageProvider';
import '@/styles/index.css';

createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </LanguageProvider>,
);
