"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FloatingActionButton from "@/components/FloatingActionButton";
import PostList from "@/components/PostList";

interface SearchResult {
  _id: string;
  type: "post" | "user";
  content?: string;
  author?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  createdAt?: string;
  likes?: number;
}

export default function Explore() {
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");

  const query = searchParams.get("q");
  const userQuery = searchParams.get("user");
  const postQuery = searchParams.get("post");

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    } else if (userQuery) {
      setSearchQuery(`@${userQuery}`);
      performUserSearch(userQuery);
    } else if (postQuery) {
      performPostSearch(postQuery);
    }
  }, [query, userQuery, postQuery]);

  const performSearch = async (searchTerm: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}&limit=20`);
      const data = await response.json();
      
      const allResults = [
        ...data.users.map((user: any) => ({
          _id: user._id,
          type: "user" as const,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          createdAt: user.createdAt
        })),
        ...data.posts.map((post: any) => ({
          _id: post._id,
          type: "post" as const,
          content: post.content,
          author: post.author,
          createdAt: post.createdAt,
          likes: post.likes
        }))
      ];
      
      setSearchResults(allResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const performUserSearch = async (username: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      
      const userResults = data.users.map((user: any) => ({
        _id: user._id,
        type: "user" as const,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        createdAt: user.createdAt
      }));
      
      setSearchResults(userResults);
    } catch (error) {
      console.error("User search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const performPostSearch = async (postId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts?post_id=${postId}`);
      const data = await response.json();
      
      if (data.posts && data.posts.length > 0) {
        const postResults = data.posts.map((post: any) => ({
          _id: post._id,
          type: "post" as const,
          content: post.content,
          author: post.author,
          createdAt: post.createdAt,
          likes: post.likes
        }));
        
        setSearchResults(postResults);
      }
    } catch (error) {
      console.error("Post search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults = searchResults.filter(result => 
    (activeTab === "posts" && result.type === "post") || 
    (activeTab === "users" && result.type === "user")
  );

  // If no search is active, show the original capybara content
  if (!query && !userQuery && !postQuery) {
    return <CapybaraExplore />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      
      <div className="flex justify-center">
        <div className="w-full max-w-screen-xl flex">
          <Sidebar />
          
          <main className="flex-1 border-x border-gray-200 dark:border-gray-800">
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
              <div className="px-4 py-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Search Results
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {searchQuery ? `Results for "${searchQuery}"` : "Search results"}
                </p>
              </div>
            </div>
            
            <div className="p-4">
              {/* Search Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "posts"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Posts ({searchResults.filter(r => r.type === "post").length})
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "users"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Users ({searchResults.filter(r => r.type === "user").length})
                </button>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Searching...</span>
                </div>
              )}

              {/* Results */}
              {!isLoading && (
                <div className="space-y-4">
                  {filteredResults.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                        No {activeTab} found
                      </div>
                      <div className="text-sm text-gray-400 dark:text-gray-500">
                        Try adjusting your search terms
                      </div>
                    </div>
                  ) : (
                    filteredResults.map((result) => (
                      <div
                        key={`${result.type}-${result._id}`}
                        className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                      >
                        {result.type === "user" ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {result.displayName?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-900 dark:text-white">
                                {result.displayName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                @{result.username}
                              </div>
                              {result.bio && (
                                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                  {result.bio}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {result.author?.[0]?.toUpperCase() || "U"}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                @{result.author}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {result.createdAt && new Date(result.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-gray-900 dark:text-white">
                              {result.content}
                            </div>
                            {result.likes !== undefined && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ❤️ {result.likes} likes
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </main>
          
          <aside className="hidden lg:block w-96 p-4">
            <div className="sticky top-4 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Search Tips
                </h2>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div>• Use @username to find specific users</div>
                  <div>• Search for posts by content or author</div>
                  <div>• Try different keywords for better results</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      
      <FloatingActionButton />
    </div>
  );
}

// Original capybara content component
function CapybaraExplore() {
  const capybaraFacts = [
    {
      title: "The World's Largest Rodent",
      description: "Capybaras can grow up to 4 feet long and weigh over 100 pounds, making them the largest rodents in the world.",
      image: "https://images.unsplash.com/photo-1599482499632-136d895f3731?q=80&w=2824&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 85
    },
    {
      title: "Nature's Zen Masters",
      description: "Capybaras are known for their incredibly calm and peaceful nature. They rarely get stressed and are often seen lounging in water.",
      image: "https://images.unsplash.com/photo-1559934382-654d580c885c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 95
    },
    {
      title: "Social Butterflies",
      description: "These gentle giants live in groups of 10-20 individuals and are incredibly social animals that get along with almost everyone.",
      image: "https://images.unsplash.com/photo-1628183353426-9f041e6c384e?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 90
    },
    {
      title: "Water Lovers",
      description: "Capybaras are excellent swimmers and spend much of their time in water to stay cool and avoid predators.",
      image: "https://images.unsplash.com/photo-1628183353426-9f041e6c384e?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 88
    },
    {
      title: "The Ultimate Chill Buddies",
      description: "Known as 'nature's therapists', capybaras have a calming presence that makes other animals feel safe around them.",
      image: "https://images.unsplash.com/photo-1572948604164-947c569a331d?q=80&w=2954&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 92
    },
    {
      title: "Living Stress-Free",
      description: "Capybaras teach us the art of relaxation - they take life slow, enjoy good company, and never rush through their day.",
      image: "https://images.unsplash.com/photo-1543682441-160a7489953d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 96
    }
  ];

  const capybaraGallery = [
    {
      title: "Ultra Chill - Baby Riding on Mom",
      description: "Baby capybara floating in water at golden hour",
      image: "https://images.unsplash.com/photo-1599482499632-136d895f3731?q=80&w=2824&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 100,
      type: "image"
    },
    {
      title: "Super Relaxed - Group Soaking",
      description: "Group soaking in shallow water, barely moving",
      image: "https://images.unsplash.com/photo-1559934382-654d580c885c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 95,
      type: "image"
    },
    {
      title: "Floating Calm - Serene Drift",
      description: "Artistic depiction of a capybara serenely drifting",
      image: "https://images.unsplash.com/photo-1628183353426-9f041e6c384e?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 98,
      type: "image"
    },
    {
      title: "Laid-back Lone Soak",
      description: "Single capybara chilling in a steamy hot spring",
      image: "https://images.unsplash.com/photo-1572948604164-947c569a331d?q=80&w=2954&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 93,
      type: "image"
    },
    {
      title: "Chill with Snack",
      description: "Capybara lying with oranges lined on its back",
      image: "https://images.unsplash.com/photo-1543682441-160a7489953d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 87,
      type: "image"
    },
    {
      title: "Very Mellow - Water's Edge",
      description: "A capybara standing calmly by the water's edge",
      image: "https://images.unsplash.com/photo-1614028290516-abea9b6ac613?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 89,
      type: "image"
    },
    {
      title: "Just Chillin' - Grass Buddies",
      description: "Two capybaras hanging out on grass, eyes half-closed",
      video: "https://www.youtube.com/watch?v=1-qaQuggBno",
      chillLevel: 91,
      type: "video"
    },
    {
      title: "Zen Vibes - Lofi Sunset",
      description: "Lofi vibes with a capybara and turtle at sunset",
      video: "https://www.youtube.com/watch?v=0wB7iuER2X0",
      chillLevel: 99,
      type: "video"
    },
    {
      title: "Extended Relaxation - Hot Spring",
      description: "Capybara soaking in Japanese zoo hot spring for an hour",
      video: "https://www.youtube.com/watch?v=FR3i0qKzRvg",
      chillLevel: 97,
      type: "video"
    },
    {
      title: "Spa Day - Vaporwave Vibes",
      description: "Capybara enjoying spa-like downtime in calming hot spring",
      video: "https://boingboing.net/2023/12/27/capybaras-vaporwave-the-most-relaxing-video-ever.html",
      chillLevel: 100,
      type: "video"
    }
  ];

  const getChillEmoji = (level: number) => {
    if (level >= 95) return "😌";
    if (level >= 90) return "😊";
    if (level >= 85) return "😎";
    if (level >= 80) return "😄";
    return "🙂";
  };

  const getChillStatus = (level: number) => {
    if (level >= 95) return "Maximum Chill";
    if (level >= 90) return "Super Relaxed";
    if (level >= 85) return "Very Mellow";
    if (level >= 80) return "Pretty Chill";
    return "Getting There";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      
      <div className="flex justify-center">
        <div className="w-full max-w-screen-xl flex">
          <Sidebar />
          
          <main className="flex-1 border-x border-gray-200 dark:border-gray-800">
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
              <div className="px-4 py-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Explore Capybaras 🦦
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Discover the world's most chill animals
                </p>
              </div>
            </div>
            
            <div className="p-4">
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-8 mb-8 text-white">
                <div className="text-center">
                  <h2 className="text-4xl font-bold mb-4">Welcome to Capybara Paradise</h2>
                  <p className="text-xl opacity-90">
                    Where stress doesn't exist and every day is a spa day
                  </p>
                </div>
              </div>

              {/* Capybara Gallery */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Capybara Chill Gallery 📸
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {capybaraGallery.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="relative h-48 overflow-hidden">
                        {item.type === "video" ? (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="text-4xl mb-2">🎥</div>
                              <div className="text-sm font-medium">{item.title}</div>
                              <div className="text-xs opacity-80 mt-1">{item.description}</div>
                            </div>
                          </div>
                        ) : (
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling!.classList.remove('hidden');
                            }}
                          />
                        )}
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {item.type === "video" ? "Watch Video" : "📸 Image"}
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {getChillEmoji(item.chillLevel)} {getChillStatus(item.chillLevel)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capybara Facts */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Why Capybaras Are Amazing 🦦
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {capybaraFacts.map((fact, index) => (
                    <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="relative h-32 mb-4 rounded-lg overflow-hidden">
                        <img 
                          src={fact.image} 
                          alt={fact.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {getChillEmoji(fact.chillLevel)} {fact.chillLevel}% Chill
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">{fact.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{fact.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
          
          <aside className="hidden lg:block w-96 p-4">
            <div className="sticky top-4 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Chill Level Guide
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">95-100%</span>
                    <span className="text-lg">😌 Maximum Chill</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">90-94%</span>
                    <span className="text-lg">😊 Super Relaxed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">85-89%</span>
                    <span className="text-lg">😎 Very Mellow</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">80-84%</span>
                    <span className="text-lg">😄 Pretty Chill</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl p-4 text-white">
                <h2 className="text-xl font-bold mb-2">Join the Chill</h2>
                <p className="text-sm opacity-90 mb-4">
                  Follow capybara accounts and embrace the zen lifestyle
                </p>
                <button className="bg-white text-green-500 px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors">
                  Start Following
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
      
      <FloatingActionButton />
    </div>
  );
} 