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
        
        <div className="px-6 py-4 mb-6 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Meet Your Grant Assistants!</h3>
          <p className="text-gray-700 mb-3">
            We've assembled a friendly team to help you every step of the way:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">🔍</span>
              <span><strong>Research Assistant</strong> – Your thoughtful inquiry companion, using the Socratic method to guide your grant development. Through targeted questions and relevant insights, we help you strengthen your proposal at every step. Generate a comprehensive summary of your progress whenever you need it.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✍️</span>
              <span><strong>Grant Writing Assistant</strong> – Your creative partner who helps craft compelling content</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">👀</span>
              <span><strong>Grant Reviewer Assistant</strong> – Your eagle-eyed friend who spots areas for improvement</span>
            </li>
          </ul>
          <p className="mt-3 text-gray-700">
            The best part? They're all working together behind the scenes! Any documents you upload and conversations you have are shared with all assistants, so everyone's on the same page. Think of them as your grant dream team - always available, always helpful!
          </p>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Creating a Grant Application</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <ol className="list-decimal list-inside space-y-4 text-gray-600">
              <li className="pl-2">
                <span className="font-medium text-gray-900">Select Organization & Opportunity</span>
                <p className="mt-1 ml-6">Choose your funding organization and search for available grant opportunities.</p>
              </li>
              <li className="pl-2">
                <span className="font-medium text-gray-900">Enter Basic Information</span>
                <p className="mt-1 ml-6">Provide your application title and grant type. The description you provide will be used by our AI to generate the first draft of your grant content - make it detailed and specific to get better results.</p>
              </li>
              <li className="pl-2">
                <span className="font-medium text-gray-900">Choose Optional Sections</span>
                <p className="mt-1 ml-6">Select any additional sections relevant to your application (e.g., inclusion of women and minorities).</p>
              </li>
              <li className="pl-2">
                <span className="font-medium text-gray-900">Complete Sections</span>
                <p className="mt-1 ml-6">Fill out each section with your content. Required sections are automatically included.</p>
              </li>
              <li className="pl-2">
                <span className="font-medium text-gray-900">Add Supporting Documents</span>
                <p className="mt-1 ml-6">Upload any necessary attachments to support your application.</p>
              </li>
              <li className="pl-2">
                <span className="font-medium text-gray-900">Generate & Review</span>
                <p className="mt-1 ml-6">Use AI to help generate content and review your application for completeness.</p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 