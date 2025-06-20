"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "./UserContext";

export default function Login() {
  const [selectedUser, setSelectedUser] = useState("");
  const { currentUser, login, logout } = useUser();

  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
  });

  const handleLogin = () => {
    if (selectedUser) {
      login(selectedUser);
    }
  };

  if (currentUser) {
    return (
      <div className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
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
          <button
            onClick={logout}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 p-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
        Login as User
      </h3>
      <div className="space-y-3">
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a user...</option>
          {usersData?.users?.map((user: any) => (
            <option key={user._id} value={user.username}>
              {user.displayName} (@{user.username})
            </option>
          ))}
        </select>
        <button
          onClick={handleLogin}
          disabled={!selectedUser}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Login
        </button>
      </div>
    </div>
  );
} 