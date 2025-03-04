import React from 'react';
import { useAuth } from '~/context/AuthContext';

export default function DashboardHome() {
  const { profile } = useAuth();
  
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Welcome, {profile?.display_name || profile?.first_name || 'User'}!</h2>
          <p className="mt-1 text-sm text-gray-500">{profile?.email}</p>
        </div>
      </div>
    </div>
  );
} 