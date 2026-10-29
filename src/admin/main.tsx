import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AdminPanel from './AdminPanel';
import '../styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminPanel />
  </StrictMode>,
);
