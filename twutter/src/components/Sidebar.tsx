"use client";

export default function Sidebar() {
  const navItems = [
    { icon: "🏠", label: "Home", active: true },
    { icon: "🔍", label: "Explore" },
    { icon: "🔔", label: "Notifications" },
    { icon: "✉️", label: "Messages" },
    { icon: "📋", label: "Lists" },
    { icon: "👥", label: "Communities" },
    { icon: "👤", label: "Profile" },
    { icon: "⚙️", label: "Settings" },
  ];

  return (
    <aside className="hidden md:block w-64 p-4 border-r border-gray-200 dark:border-gray-800">
      <div className="sticky top-20 space-y-2">
        {navItems.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center space-x-4 px-4 py-3 rounded-full text-left transition-colors ${
              item.active
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-lg">{item.label}</span>
          </button>
        ))}
        
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-full transition-colors mt-4">
          Post
        </button>
        
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              U
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white">User</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">@username</div>
            </div>
          </div>
          <button className="w-full text-left text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            More
          </button>
        </div>
      </div>
    </aside>
  );
} 