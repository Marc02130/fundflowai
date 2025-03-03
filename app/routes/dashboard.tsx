import { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router';
import { useAuth } from '~/context/AuthContext';
import type { Route } from '~/+types/auth';
import { supabase } from '~/lib/supabase'; 

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Fund Flow AI" },
    { name: "description", content: "Your Fund Flow AI Dashboard" },
  ];
}

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUnsubmittedExpanded, setIsUnsubmittedExpanded] = useState(false);
  const [inProgressApplications, setInProgressApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);
  
  // Determine active route for highlight in nav
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Fetch in-progress applications when accordion is expanded
  useEffect(() => {
    if (isUnsubmittedExpanded && user) {
      fetchInProgressApplications();
    }
  }, [isUnsubmittedExpanded, user]);

  // Function to fetch in-progress applications from database
  const fetchInProgressApplications = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('grant_applications')
        .select('id, title, status')
        .eq('user_id', user?.id)
        .in('status', ['Draft', 'In Progress', 'In Review'])
        .order('updated_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setInProgressApplications(data || []);
    } catch (error) {
      console.error('Error fetching in-progress applications:', error);
    } finally {
      setIsLoading(false);
    }
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
    <div className="min-h-screen flex">
      {/* Left navigation sidebar with collapse functionality */}
      <div className={`${navCollapsed ? 'w-16' : 'w-64'} border-r border-gray-200 min-h-screen transition-all duration-300 relative`} style={{ minWidth: navCollapsed ? '4rem' : '16rem' }}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          {!navCollapsed && (
            <Link to="/" className="flex items-center">
              <img className="h-8 w-auto" src="/logo.svg?v=1" alt="Fund Flow AI" />
            </Link>
          )}
          <button 
            onClick={() => setNavCollapsed(!navCollapsed)} 
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label={navCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {navCollapsed ? '→' : '←'}
          </button>
        </div>
        
        <nav className="py-8" style={{ padding: '1rem 0' }}>
          <ul className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link 
                to="/dashboard" 
                className={`flex items-center px-6 py-6 text-lg hover:bg-gray-200 rounded-md ${isActiveRoute('/dashboard') ? 'bg-gray-200 font-semibold' : ''}`}
                title="Home"
                style={{ 
                  display: 'flex', 
                  padding: '0.75rem 1.25rem', 
                  fontSize: '1.125rem', 
                  lineHeight: '1.5rem',
                  borderRadius: '0.375rem'
                }}
              >
                <span className="text-2xl" style={{ fontSize: '1.5rem' }}>⌂</span>
                {!navCollapsed && <span style={{ marginLeft: '0.75rem', display: 'inline-block' }}>Home</span>}
              </Link>
            </li>
            
            <li style={{ marginBottom: '0.5rem' }}>
              <Link 
                to="/dashboard/new" 
                className={`flex items-center px-6 py-6 text-lg hover:bg-gray-200 rounded-md ${isActiveRoute('/dashboard/new') ? 'bg-gray-200 font-semibold' : ''}`}
                title="New Application"
                style={{ 
                  display: 'flex', 
                  padding: '0.75rem 1.25rem', 
                  fontSize: '1.125rem', 
                  lineHeight: '1.5rem',
                  borderRadius: '0.375rem'
                }}
              >
                <span className="text-2xl" style={{ fontSize: '1.5rem' }}>+</span>
                {!navCollapsed && <span style={{ marginLeft: '0.75rem', display: 'inline-block' }}>New Application</span>}
              </Link>
            </li>

            {/* Unsubmitted Applications - pure accordion */}
            <li style={{ marginBottom: '0.5rem' }}>
              <div 
                className="flex items-center px-6 py-6 text-lg hover:bg-gray-200 cursor-pointer rounded-md"
                onClick={() => setIsUnsubmittedExpanded(!isUnsubmittedExpanded)}
                title="Unsubmitted Applications"
                style={{ 
                  display: 'flex', 
                  padding: '0.75rem 1.25rem', 
                  fontSize: '1.125rem', 
                  lineHeight: '1.5rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                <span className="text-2xl" style={{ fontSize: '1.5rem' }}>○</span>
                {!navCollapsed && (
                  <>
                    <span style={{ marginLeft: '0.75rem', display: 'inline-block' }}>Unsubmitted Applications</span>
                    <span style={{ marginLeft: 'auto', fontSize: '1.25rem' }}>{isUnsubmittedExpanded ? '▾' : '▸'}</span>
                  </>
                )}
              </div>
              
              {/* Dropdown content */}
              {isUnsubmittedExpanded && (
                <ul style={{ 
                  paddingLeft: navCollapsed ? '0.75rem' : '2rem',
                  marginTop: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {isLoading ? (
                    <li style={{ 
                      padding: '0.5rem 0.75rem', 
                      color: '#6b7280',
                      fontSize: '1.125rem'
                    }}>
                      {!navCollapsed && "Loading..."}
                    </li>
                  ) : inProgressApplications.length > 0 ? (
                    <>
                      {!navCollapsed && inProgressApplications.map(app => (
                        <li key={app.id} style={{ marginBottom: '0.5rem' }}>
                          <Link 
                            to={`/dashboard/unsubmitted/${app.id}`}
                            style={{ 
                              display: 'block',
                              padding: '0.5rem 0.75rem',
                              fontSize: '1.125rem',
                              borderRadius: '0.375rem'
                            }}
                          >
                            {app.title} [{app.status}]
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link 
                          to="/dashboard/unsubmitted"
                          style={{ 
                            display: 'block',
                            padding: '0.5rem 0.75rem',
                            fontSize: '1.125rem',
                            borderRadius: '0.375rem'
                          }}
                        >
                          {!navCollapsed && "View all →"}
                        </Link>
                      </li>
                    </>
                  ) : (
                    <li style={{ 
                      padding: '0.5rem 0.75rem', 
                      color: '#6b7280',
                      fontSize: '1.125rem'
                    }}>
                      {!navCollapsed && "No applications"}
                    </li>
                  )}
                </ul>
              )}
            </li>

            <li style={{ marginBottom: '0.5rem' }}>
              <Link 
                to="/dashboard/submitted" 
                className={`flex items-center px-6 py-6 text-lg hover:bg-gray-200 rounded-md ${isActiveRoute('/dashboard/submitted') ? 'bg-gray-200 font-semibold' : ''}`}
                title="Submitted Applications"
                style={{ 
                  display: 'flex', 
                  padding: '0.75rem 1.25rem', 
                  fontSize: '1.125rem', 
                  lineHeight: '1.5rem',
                  borderRadius: '0.375rem'
                }}
              >
                <span className="text-2xl" style={{ fontSize: '1.5rem' }}>●</span>
                {!navCollapsed && <span style={{ marginLeft: '0.75rem', display: 'inline-block' }}>Submitted Applications</span>}
              </Link>
            </li>

            {/* Profile navigation item */}
            <li style={{ marginBottom: '0.5rem', marginTop: '1.5rem' }}>
              <Link 
                to="/dashboard/profile" 
                className={`flex items-center px-6 py-6 text-lg hover:bg-gray-200 rounded-md ${isActiveRoute('/dashboard/profile') ? 'bg-gray-200 font-semibold' : ''}`}
                title="Profile"
                style={{ 
                  display: 'flex', 
                  padding: '0.75rem 1.25rem', 
                  fontSize: '1.125rem', 
                  lineHeight: '1.5rem',
                  borderRadius: '0.375rem'
                }}
              >
                <span className="text-2xl" style={{ fontSize: '1.5rem' }}>◆</span>
                {!navCollapsed && <span style={{ marginLeft: '0.75rem', display: 'inline-block' }}>Profile</span>}
              </Link>
            </li>

            <li style={{ 
              marginTop: '2rem', 
              paddingTop: '0.75rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <Link 
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  signOut();
                  navigate('/');
                }}
                style={{ 
                  display: 'flex', 
                  padding: '0.75rem 1.25rem', 
                  fontSize: '1.125rem', 
                  lineHeight: '1.5rem',
                  borderRadius: '0.375rem'
                }}
                title="Sign out"
              >
                <span style={{ fontSize: '1.5rem' }}>⤴</span>
                {!navCollapsed && <span style={{ marginLeft: '0.75rem', display: 'inline-block' }}>Sign out</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main content area */}
      <div className="flex-1">
        <header className="bg-white shadow">
          <div className="px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isActiveRoute('/dashboard') && 'Dashboard'}
              {isActiveRoute('/dashboard/new') && 'New Application'}
              {isActiveRoute('/dashboard/unsubmitted') && 'Unsubmitted Applications'}
              {isActiveRoute('/dashboard/submitted') && 'Submitted Applications'}
            </h1>
          </div>
        </header>
        
        <main className="py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 