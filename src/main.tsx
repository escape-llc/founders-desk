import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToolcribProvider } from '#toolcrib';
import App from './App';
import './index.css';

/**
 * Founder's Desk theme — a confident corporate blue, distinct from Feed
 * Farmer's green. HSV hue 218 is a deep, executive blue; analogous harmony
 * spreads into adjacent blues/indigos rather than anything overly playful.
 */
const founderTheme = {
  initialParameters: {
    baseColor: { h: 218, s: 62, v: 62 },
    harmonyMode: 'analogous',
    hueSpread: 20,
    isDarkMode: true,
  },
} as const;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToolcribProvider theme={founderTheme}>
      <App />
    </ToolcribProvider>
  </StrictMode>,
);
