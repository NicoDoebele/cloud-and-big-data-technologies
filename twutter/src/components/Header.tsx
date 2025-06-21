"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  _id: string;
  type: "post" | "user";
  content?: string;
  author?: string;
  username?: string;
  displayName?: string;
  bio?: string;
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search function with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      
      const allResults = [
        ...data.users.map((user: any) => ({
          _id: user._id,
          type: "user" as const,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio
        })),
        ...data.posts.map((post: any) => ({
          _id: post._id,
          type: "post" as const,
          content: post.content,
          author: post.author
        }))
      ];
      
      setSearchResults(allResults);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "user" && result.username) {
      router.push(`/explore?q=@${encodeURIComponent(result.username)}`);
    } else {
      router.push(`/explore?q=${encodeURIComponent(result.content || '')}`);
    }
    setShowSearchResults(false);
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Image
              src="/Twutter_Logo.png"
              alt="Twutter"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              Twutter
            </span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search bar - hidden on mobile */}
          <div className="hidden md:block relative flex-1 max-w-md mx-4" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search Twutter"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                  className="bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-full"
                />
                {isSearching && (
                  <div className="ml-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </form>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={`${result.type}-${result._id}`}
                    onClick={() => handleResultClick(result)}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    {result.type === "user" ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {result.displayName?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {result.displayName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            @{result.username}
                          </div>
                          {result.bio && (
                            <div className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                              {result.bio}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Post by @{result.author}
                        </div>
                        <div className="text-gray-900 dark:text-white line-clamp-2">
                          {result.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Notifications */}
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
            </svg>
          </button>
          
          {/* User avatar */}
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity">
            U
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <div className="px-4 py-2">
            <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 mb-4">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search Twutter"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-full"
                />
              </div>
            </form>
            
            <div className="space-y-1">
              <Link 
                href="/"
                className="w-full flex items-center space-x-4 px-4 py-3 rounded-full text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-xl">🏠</span>
                <span className="text-gray-900 dark:text-white">Home</span>
              </Link>
              <Link 
                href="/explore"
                className="w-full flex items-center space-x-4 px-4 py-3 rounded-full text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-xl">🔍</span>
                <span className="text-gray-900 dark:text-white">Explore</span>
              </Link>
              <button className="w-full flex items-center space-x-4 px-4 py-3 rounded-full text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <span className="text-xl">🔔</span>
                <span className="text-gray-900 dark:text-white">Notifications</span>
              </button>
              <button className="w-full flex items-center space-x-4 px-4 py-3 rounded-full text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <span className="text-xl">✉️</span>
                <span className="text-gray-900 dark:text-white">Messages</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 