import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Bootstrap the React application and inject it into the root DOM node
createRoot(document.getElementById('root')).render(
  // Wrap the entire application in Reacts StrictMode to enable additional checks and warnings during development
  <StrictMode>
    <App />
  </StrictMode>
);