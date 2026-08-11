import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

const canUseServiceWorker =
  'serviceWorker' in navigator &&
  (window.location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(window.location.hostname));

if (canUseServiceWorker) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  });
}
