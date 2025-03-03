import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

// Initialize React app with hydration
hydrateRoot(document, (
  <StrictMode>
    <HydratedRouter />
  </StrictMode>
)); 