import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import CardPage from './CardPage.tsx';
import ContactPage from './ContactPage.tsx';
import LandingPage from './LandingPage.tsx';
import './index.css';

const routes: Record<string, typeof App> = {
  '/': LandingPage,
  '/docs': App,
  '/contact': ContactPage,
  '/card': CardPage,
};
const RootComponent = routes[window.location.pathname] || LandingPage;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
);
