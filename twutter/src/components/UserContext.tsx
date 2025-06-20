"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  username: string;
  displayName: string;
  email: string;
  bio?: string;
}

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (username: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (username: string) => {
    // For now, we'll create a simple user object
    // In a real app, you'd fetch the user from the API
    setCurrentUser({
      username,
      displayName: username,
      email: `${username}@example.com`,
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
} 