"use client";

import { useState, useEffect } from "react";

interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatar: string;
  createdAt: string;
  followers: string[];
  following: string[];
}

export default function WhoToFollow() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/users?limit=10");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleFollow = async (userId: string) => {
    // TODO: Implement follow functionality
    console.log("Follow user:", userId);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Who to follow
        </h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
              <div className="w-16 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Who to follow
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Unable to load suggestions
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Who to follow
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          No users found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Who to follow
      </h2>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user._id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-gray-900 dark:text-white truncate">
                  {user.displayName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  @{user.username}
                </div>
                {user.bio && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                    {user.bio}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => handleFollow(user._id)}
              className="bg-black dark:bg-white text-white dark:text-black px-4 py-1 rounded-full text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              Follow
            </button>
          </div>
        ))}
      </div>
      {users.length >= 10 && (
        <button className="w-full text-left text-sm text-blue-500 hover:text-blue-600 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          Show more
        </button>
      )}
    </div>
  );
}