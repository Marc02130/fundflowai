import { useState, useEffect } from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { supabase } from '~/lib/supabase';
import { useAuth } from '~/context/AuthContext';
import type { Route } from '~/+types/auth';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "All Applications - Fund Flow AI" },
    { name: "description", content: "View and manage all your grant applications" },
  ];
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error('Applications route error:', error);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-4">We encountered an error while loading your applications.</p>
        <Link
          to="/dashboard"
          className="text-indigo-600 hover:text-indigo-800"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

interface Application {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Applications List View
 * 
 * Displays a list of user's grant applications with filtering and sorting.
 * Provides quick actions and status management for applications.
 * 
 * Features:
 * - Application status filtering
 * - Sort by date, status, or title
 * - Quick actions menu
 * - Real-time updates
 * 
 * @route /dashboard/applications
 */
export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  // Fetch applications with filters
  useEffect(() => {
    let isMounted = true;

    async function fetchApplications() {
      if (!user) return;

      try {
        setLoading(true);
        let query = supabase
          .from('grant_applications')
          .select('*')
          .eq('user_id', user.id);

        // Apply status filter
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        // Apply date range filter
        if (dateRange.start) {
          query = query.gte('created_at', dateRange.start);
        }
        if (dateRange.end) {
          query = query.lte('created_at', dateRange.end);
        }

        // Apply search filter
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query.order('updated_at', { ascending: false });

        if (error) throw error;
        if (isMounted) {
          setApplications(data || []);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load applications');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchApplications();

    return () => {
      isMounted = false;
    };
  }, [user, searchQuery, statusFilter, dateRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters Section */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="cancelled">Cancelled</option>
            <option value="in-progress">In Progress</option>
            <option value="submitted">Submitted</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="flex space-x-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <span className="self-center">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No applications found
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link 
                      to={`/dashboard/applications/${app.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {app.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-xs">
                      {app.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(app.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
