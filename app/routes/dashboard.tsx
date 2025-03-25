/**
 * Main Dashboard Layout
 * 
 * Provides the primary layout structure for all dashboard views.
 * Handles navigation, user context, and common UI elements.
 * 
 * Features:
 * - Responsive sidebar navigation
 * - User profile menu
 * - Organization context
 * - Protected route wrapper
 * 
 * @route /dashboard/*
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '~/context/AuthContext';
import type { Route } from '~/+types/auth';
import { supabase } from '~/lib/supabase';

// Remove unused imports and those causing 404s
declare global {
  interface Window {
    refreshUnsubmittedGrants?: () => Promise<void>;
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Fund Flow AI" },
    { name: "description", content: "Your Fund Flow AI Dashboard" },
  ];
}

/**
 * Dashboard Layout Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child routes to render
 */
export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [isUnsubmittedExpanded, setIsUnsubmittedExpanded] = useState(true);
  const [isAdminExpanded, setIsAdminExpanded] = useState(false);
  const [inProgressApplications, setInProgressApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [sectionName, setSectionName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Load section name if we're in a section
  useEffect(() => {
    async function loadSectionName() {
      if (params.sectionId) {
        const { data, error } = await supabase
          .from('grant_application_section')
          .select(`
            grant_section:grant_section_id(
              name
            )
          `)
          .eq('id', params.sectionId)
          .single() as { 
            data: { grant_section: { name: string } } | null, 
            error: any 
          };

        if (!error && data?.grant_section?.name) {
          setSectionName(data.grant_section.name);
        }
      } else {
        setSectionName(null);
      }
    }

    loadSectionName();
  }, [params.sectionId]);

  // Function to fetch in-progress applications
  const fetchInProgressApplications = async (retryCount = 0) => {
    try {
      if (!user?.id) return; // Don't fetch if no user ID

      const { data, error } = await supabase
        .from('grant_applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'in-progress')
        .order('updated_at', { ascending: false });

      if (error) {
        if (retryCount < 3) {
          console.log(`Retry attempt ${retryCount + 1} of 3`);
          // Exponential backoff: 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return fetchInProgressApplications(retryCount + 1);
        }
        console.log('Max retries reached for fetching in-progress applications');
        throw error;
      }

      setInProgressApplications(data || []);
    } catch (err) {
      console.error('Error fetching in-progress applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    }
  };

  // Initial fetch when user is available
  useEffect(() => {
    if (user?.id) {
      fetchInProgressApplications(0);
    }
  }, [user?.id]);

  // Handle new grant creation
  useEffect(() => {
    if (location.state?.newGrantCreated && user?.id) {
      // Clear the state so it doesn't trigger again on refresh
      window.history.replaceState({}, document.title);
      // Fetch the updated list
      fetchInProgressApplications(0);
    }
  }, [location.state?.newGrantCreated, user?.id]);

  // Export the refresh function for other components
  useEffect(() => {
    if (window && user?.id) {
      window.refreshUnsubmittedGrants = () => fetchInProgressApplications(0);
    }
    return () => {
      if (window) {
        window.refreshUnsubmittedGrants = undefined;
      }
    };
  }, [user?.id]);

  // Determine active route for highlight in nav
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Handle unsubmitted section toggle
  const handleUnsubmittedToggle = () => {
    setIsUnsubmittedExpanded(!isUnsubmittedExpanded);
  };

  // Protect the route - redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h3 className="mt-4 text-xl font-medium text-gray-900">Loading...</h3>
        </div>
      </div>
    );
  }

  // In case the redirect hasn't happened yet but we know user is not authenticated
  if (!user) {
    return null;
  }
  
  return (
    <div className={`min-h-screen bg-white ${navCollapsed ? 'dashboard-collapsed' : ''} flex`}>
      {/* Left navigation sidebar with collapse functionality */}
      <div className={`${navCollapsed ? 'w-12' : 'w-64'} border-r border-gray-200 min-h-screen transition-all duration-300 relative`}>
        <div className="py-8 pb-1 px-6 border-b border-gray-200 relative">
          <button 
            onClick={() => setNavCollapsed(!navCollapsed)} 
            className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-100 transition-colors text-sm"
            aria-label={navCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {navCollapsed ? '→' : '←'}
          </button>
          {!navCollapsed && (
            <Link to="/dashboard" className="flex items-center">
              <img className="h-12 w-auto" src="/logo.svg?v=1" alt="Fund Flow AI" />
            </Link>
          )}
        </div>
        
        <nav>
          <ul className="flex flex-col gap-1">
            <li className="mb-1">
              <Link 
                to="/dashboard" 
                className={`flex items-center px-4 text-xl hover:bg-gray-200 rounded-md min-h-14 transition-colors ${isActiveRoute('/dashboard') ? 'bg-gray-200 font-semibold' : ''}`}
                title="Home"
              >
                <span className="text-xl shrink-0">⌂</span>
                {!navCollapsed && <span className="ml-3">Home</span>}
              </Link>
            </li>

            {/* Applications Section */}
            {!navCollapsed && (
              <li className="mt-6">
                <div className="px-4 text-xl">
                  Applications
                </div>
              </li>
            )}
            
            <li className="mb-1 pl-4">
              <Link 
                to="/dashboard/new" 
                className={`flex items-center px-4 text-xl hover:bg-gray-200 rounded-md min-h-14 transition-colors ${isActiveRoute('/dashboard/new') ? 'bg-gray-200 font-semibold' : ''}`}
                title="New Application"
              >
                <span className="text-xl shrink-0">+</span>
                {!navCollapsed && <span className="ml-3">New</span>}
              </Link>
            </li>

            {/* Unsubmitted Applications - pure accordion */}
            <li className="pl-4">
              <div 
                className={`flex items-start px-4 text-xl hover:bg-gray-200 rounded-md min-h-14 transition-colors cursor-pointer ${inProgressApplications.length > 0 ? 'bg-gray-100' : ''}`}
                onClick={handleUnsubmittedToggle}
                title="Unsubmitted Applications"
              >
                <span className="text-xl shrink-0">○</span>
                {!navCollapsed && (
                  <>
                    <span className="ml-3 break-words flex-grow">
                      Unsubmitted
                    </span>
                    <span className="text-xl transition-transform shrink-0">
                      {isUnsubmittedExpanded ? '▾' : '▸'}
                    </span>
                  </>
                )}
              </div>
              
              {/* Dropdown content */}
              {isUnsubmittedExpanded && (
                <ul className={`mt-2 flex flex-col gap-2 ${navCollapsed ? 'pl-3' : 'pl-8'}`}>
                  {isLoading ? (
                    <li className="px-3 text-xl text-gray-500">
                      {!navCollapsed && (
                        <div className="flex items-center">
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Loading...
                        </div>
                      )}
                    </li>
                  ) : inProgressApplications.length > 0 ? (
                    <>
                      {!navCollapsed && inProgressApplications.map(app => (
                        <li key={app.id} className="mb-2">
                          <Link 
                            to={`/dashboard/applications/${app.id}`}
                            className="block px-3 rounded-md hover:bg-gray-100 transition-colors text-gray-900 text-xl"
                          >
                            {app.title}
                          </Link>
                        </li>
                      ))}
                    </>
                  ) : (
                    <li className="px-3 text-xl text-gray-500">
                      {!navCollapsed && "No applications"}
                    </li>
                  )}
                </ul>
              )}
            </li>

            <li className="mb-1 pl-4">
              <Link 
                to="/dashboard/applications" 
                className={`flex items-start px-4 text-xl hover:bg-gray-200 rounded-md min-h-14 transition-colors ${isActiveRoute('/dashboard/applications') ? 'bg-gray-200 font-semibold' : ''}`}
                title="All"
              >
                <span className="text-xl shrink-0">●</span>
                {!navCollapsed && <span className="ml-3 break-words">All</span>}
              </Link>
            </li>

            {/* Profile navigation item */}
            <li className="mb-1 mt-6">
              <Link 
                to="/dashboard/profile" 
                className={`flex items-center px-4 text-xl hover:bg-gray-200 rounded-md min-h-14 transition-colors ${isActiveRoute('/dashboard/profile') ? 'bg-gray-200 font-semibold' : ''}`}
                title="Profile"
              >
                <span className="text-xl shrink-0">◆</span>
                {!navCollapsed && <span className="ml-3">Profile</span>}
              </Link>
            </li>
            
            {/* Admin Accordion */}
            <li className="mt-6 mb-1">
              <div 
                className={`flex items-start px-4 text-xl hover:bg-gray-200 rounded-md min-h-14 transition-colors cursor-pointer ${isAdminExpanded ? 'bg-gray-100' : ''}`}
                onClick={() => setIsAdminExpanded(!isAdminExpanded)}
                title="Admin Functions"
              >
                <span className="text-xl shrink-0">⚙</span>
                {!navCollapsed && (
                  <>
                    <span className="ml-3 break-words flex-grow">
                      Admin
                    </span>
                    <span className="text-xl transition-transform shrink-0">
                      {isAdminExpanded ? '▾' : '▸'}
                    </span>
                  </>
                )}
              </div>
              
              {/* Admin dropdown content */}
              {isAdminExpanded && (
                <ul className={`mt-2 flex flex-col gap-2 ${navCollapsed ? 'pl-3' : 'pl-8'}`}>
                  <li className="mb-2">
                    <Link 
                      to="/dashboard/admin/sections"
                      className={`block px-3 rounded-md hover:bg-gray-100 transition-colors text-gray-900 text-xl ${isActiveRoute('/dashboard/admin/sections') ? 'bg-gray-100 font-semibold' : ''}`}
                    >
                      {!navCollapsed && "Edit Sections"}
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link 
                      to="/dashboard/admin/users"
                      className={`block px-3 rounded-md hover:bg-gray-100 transition-colors text-gray-900 text-xl ${isActiveRoute('/dashboard/admin/users') ? 'bg-gray-100 font-semibold' : ''}`}
                    >
                      {!navCollapsed && "Edit Users"}
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link 
                      to="/dashboard/admin/organizations"
                      className={`block px-3 rounded-md hover:bg-gray-100 transition-colors text-gray-900 text-xl ${isActiveRoute('/dashboard/admin/organizations') ? 'bg-gray-100 font-semibold' : ''}`}
                    >
                      {!navCollapsed && "Edit Organizations"}
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li className="mt-8 pt-3 border-t border-gray-200">
              <Link 
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  signOut();
                  navigate('/');
                }}
                className="flex items-center px-4 py-1 text-xl hover:bg-gray-200 rounded-md min-h-14 transition-colors"
                title="Sign out"
              >
                <span className="text-xl shrink-0">⤴</span>
                {!navCollapsed && <span className="ml-3">Sign out</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main content area */}
      <div className="flex-1">
        <header className="bg-white shadow">
          <div className="flex items-center justify-between py-12 px-6 pb-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {sectionName || (
                <>
                  {isActiveRoute('/dashboard') && 'Dashboard'}
                  {isActiveRoute('/dashboard/new') && 'New Application'}
                  {isActiveRoute('/dashboard/unsubmitted') && 'Unsubmitted Applications'}
                  {isActiveRoute('/dashboard/applications') && 'All Applications'}
                  {isActiveRoute('/dashboard/admin/sections') && 'Edit Grant Sections'}
                  {isActiveRoute('/dashboard/admin/users') && 'Edit User Profiles'}
                  {isActiveRoute('/dashboard/admin/organizations') && 'Edit Organizations'}
                </>
              )}
            </h1>
          </div>
        </header>
        
        <main className="py-6">
          <Outlet context={{ setSectionName }} />
        </main>
      </div>
    </div>
  );
}