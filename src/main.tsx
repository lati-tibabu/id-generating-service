import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import CardPage from './CardPage.tsx';
import './index.css';

const RootComponent = window.location.pathname === '/card' ? CardPage : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
);
