import React from 'react';
import Root from './root';
import Auth from './routes/auth';
import Home from './routes/home';
import Dashboard from './routes/dashboard';
import Profile from './routes/dashboard.profile';
import { useAuth } from './context/AuthContext';

// Create placeholder components for new routes
const DashboardHome = () => {
  const { profile } = useAuth();
  
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Welcome, {profile?.display_name || profile?.first_name || 'User'}!</h2>
          <p className="mt-1 text-sm text-gray-500">{profile?.email}</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-lg font-medium text-gray-900">Recent Grant Applications</h3>
            <p className="mt-2 text-sm text-gray-500">You haven't created any applications yet.</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Deadlines</h3>
            <p className="mt-2 text-sm text-gray-500">No upcoming deadlines found.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const UnsubmittedApplications = () => (
  <div className="p-8">
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-xl font-bold mb-6">Unsubmitted Applications</h1>
      <p className="text-gray-600">You don't have any unsubmitted applications yet.</p>
      <button className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500">
        Create New Application
      </button>
    </div>
  </div>
);

const SubmittedApplications = () => (
  <div className="p-8">
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-xl font-bold mb-6">Submitted Applications</h1>
      <p className="text-gray-600">You haven't submitted any applications yet.</p>
    </div>
  </div>
);

// Add a New Application component
const NewApplication = () => (
  <div className="p-8">
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-xl font-bold mb-6">Create New Application</h1>
      <p className="text-gray-600 mb-6">Start your new grant application below.</p>
      
      <form className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Application Title</label>
          <input 
            type="text" 
            id="title"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter a name for your application"
          />
        </div>
        
        <div>
          <label htmlFor="funder" className="block text-sm font-medium text-gray-700">Funding Organization</label>
          <input 
            type="text" 
            id="funder"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter the name of the funding organization"
          />
        </div>
        
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Submission Deadline</label>
          <input 
            type="date" 
            id="deadline"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        
        <div>
          <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Create Application
          </button>
        </div>
      </form>
    </div>
  </div>
);

export const routes = [
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'auth',
        element: <Auth />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
        children: [
          {
            index: true,
            element: <DashboardHome />,
          },
          {
            path: 'new',
            element: <NewApplication />,
          },
          {
            path: 'unsubmitted',
            element: <UnsubmittedApplications />,
          },
          {
            path: 'submitted',
            element: <SubmittedApplications />,
          },
          {
            path: 'profile',
            element: <Profile />,
          }
        ]
      }
    ],
  },
]; 