import { Link } from "react-router-dom";
import { useAuth } from "~/context/AuthContext";
import type { Route } from "./+types/home";

/**
 * Home Page Route
 * 
 * Landing page for the application showcasing features
 * and providing access to authentication.
 * 
 * Features:
 * - Feature showcase
 * - Value proposition
 * - Call-to-action buttons
 * - Navigation to auth
 * 
 * @route /
 */

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Fund Flow AI - Grant Writing Assistant" },
    { name: "description", content: "AI-powered grant writing and fund management" },
    { 
      tagName: "link",
      rel: "stylesheet", 
      href: "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap"
    },
  ];
}

/**
 * Home Page Component
 * 
 * @component
 * @param {Object} props - Component props
 */
export default function Home() {
  const { user } = useAuth();

  return (
    <div className="bg-white min-h-screen overflow-hidden" style={{ fontFamily: 'Lora, serif' }}>
      <nav className="py-6 relative z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center">
              <img className="h-16 w-auto" src="/logo.svg?v=1" alt="Fund Flow AI" />
          </Link>
          {!user && (
            <Link to="/auth" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      </nav>

      <div className="mt-16 relative min-h-[80vh]">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <svg
            className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
            viewBox="0 0 1155 678"
          >
            <path
              fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
              fillOpacity=".3"
              d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
            />
            <defs>
              <linearGradient
                id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
                x1="1155.49"
                x2="-78.208"
                y1=".177"
                y2="474.645"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#9089FC" />
                <stop offset={1} stopColor="#FF80B5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <div className="mx-auto w-4/5 relative z-10">
          <div className="text-center flex flex-col gap-24">
            <div>
              <h1 className="text-4xl font-normal text-indigo-600 sm:text-6xl">
                AI That Lays Grant Writing Bare with Sultry Precision
              </h1>
            </div>
            <div>
              <p className="text-xl font-normal text-gray-800">
                Fund Flow AI doesn't just help you write grants. It seduces funders with irresistible applications, unlocks your most alluring opportunities, and transforms your ideas into captivating narratives that demand attention.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
              <a
                href="/auth"
                className="inline-block rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-500"
              >
                Get started
              </a>
              <a
                href="#learn-more"
                className="inline-block rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-900 shadow-sm hover:bg-gray-50"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl">
          <svg
            className="relative left-[calc(50%+3rem)] h-[21.1875rem] max-w-none -translate-x-1/2 sm:left-[calc(50%+36rem)] sm:h-[30rem]"
            viewBox="0 0 1155 678"
          >
            <path
              fill="url(#ecb5b0c9-546c-4772-8c71-4d3f06d544bc)"
              fillOpacity=".3"
              d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
            />
            <defs>
              <linearGradient
                id="ecb5b0c9-546c-4772-8c71-4d3f06d544bc"
                x1="1155.49"
                x2="-78.208"
                y1=".177"
                y2="474.645"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#9089FC" />
                <stop offset={1} stopColor="#FF80B5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
