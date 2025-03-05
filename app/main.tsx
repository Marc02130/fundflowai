import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './styles/tailwind.css';

// Import route components
import Home from './routes/home';
import Auth from './routes/auth';
import Dashboard from './routes/dashboard';
import DashboardHome from './routes/dashboard.home';
import Profile from './routes/dashboard.profile';
import NewApplication from './routes/dashboard.new';
import ApplicationView from './routes/dashboard.applications.$id';
import SectionEditor from './routes/dashboard.applications.$id.sections.$sectionId';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'new',
        element: <NewApplication />,
      },
      {
        path: 'applications/:id',
        element: <ApplicationView />,
        errorElement: <div>Error loading application</div>
      },
      {
        path: 'applications/:id/sections/:sectionId',
        element: <SectionEditor />,
        errorElement: <div>Error loading section</div>
      },
    ],
  },
]);

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
); 