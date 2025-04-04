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
import Applications from './routes/dashboard.applications';
import ApplicationView from './routes/dashboard.applications.$id';
import SectionEditor from './routes/dashboard.applications.$id.sections.$sectionId';
import ResearchWindow from './routes/dashboard.applications.$id.research';
import AdminSections from './routes/dashboard.admin.sections';
import AdminUsers from './routes/dashboard.admin.users';
import AdminOrganizations from './routes/dashboard.admin.organizations';

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
        path: 'applications',
        children: [
          {
            index: true,
            element: <Applications />,
            errorElement: <div>Error loading applications</div>
          },
          {
            path: ':id',
            children: [
              {
                index: true,
                element: <ApplicationView />,
                errorElement: <div>Error loading application</div>
              },
              {
                path: 'research',
                element: <ResearchWindow />,
                errorElement: <div>Error loading research window</div>
              },
              {
                path: 'sections/:sectionId',
                element: <SectionEditor />,
                errorElement: <div>Error loading section</div>
              }
            ]
          }
        ]
      },
      {
        path: 'admin',
        children: [
          {
            path: 'sections',
            element: <AdminSections />,
            errorElement: <div>Error loading admin sections</div>
          },
          {
            path: 'users',
            element: <AdminUsers />,
            errorElement: <div>Error loading admin users</div>
          },
          {
            path: 'organizations',
            element: <AdminOrganizations />,
            errorElement: <div>Error loading admin organizations</div>
          }
        ]
      }
    ],
  },
], {
  future: {
    v7_normalizeFormMethod: true,
    v7_relativeSplatPath: true
  }
});

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
); 