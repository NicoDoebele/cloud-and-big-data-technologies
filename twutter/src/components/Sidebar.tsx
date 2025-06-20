"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUser } from "./UserContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, logout } = useUser();

  const navItems = [
    { icon: "🏠", label: "Home", href: "/", active: pathname === "/" },
    { icon: "🔍", label: "Explore", href: "/explore", active: pathname === "/explore" },
    { icon: "🚀", label: "Load Test", href: "/load-test", active: pathname === "/load-test" },
    { icon: "🔔", label: "Notifications", href: "#", active: false },
    { icon: "✉️", label: "Messages", href: "#", active: false },
    { icon: "📋", label: "Lists", href: "#", active: false },
    { icon: "👥", label: "Communities", href: "#", active: false },
    { icon: "👤", label: "Profile", href: "#", active: false },
    { icon: "⚙️", label: "Settings", href: "#", active: false },
  ];

  return (
    <aside className="hidden md:block w-64 p-4 border-r border-gray-200 dark:border-gray-800">
      <div className="sticky top-20 space-y-2">
        {navItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`w-full flex items-center space-x-4 px-4 py-3 rounded-full text-left transition-colors ${
              item.active
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-lg">{item.label}</span>
          </Link>
        ))}
        
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-full transition-colors mt-4">
          Post
        </button>
        
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
          {currentUser ? (
            <>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {currentUser.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {currentUser.displayName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    @{currentUser.username}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full text-left text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Profile
                </button>
                <button className="w-full text-left text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Settings
                </button>
                <button 
                  onClick={logout}
                  className="w-full text-left text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 mx-auto mb-3">
                👤
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Not logged in
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Login in the main area to comment and post
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
} 