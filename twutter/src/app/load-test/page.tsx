"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FloatingActionButton from "@/components/FloatingActionButton";

// Sample usernames for generating posts
const SAMPLE_USERNAMES = [
  "alice_dev", "bob_coder", "charlie_tech", "diana_web", "eddie_fullstack",
  "fiona_react", "george_node", "helen_js", "ivan_typescript", "julia_next",
  "kevin_mongo", "lisa_api", "mike_docker", "nina_kubernetes", "oscar_cloud",
  "paula_devops", "quinn_frontend", "rachel_backend", "sam_database", "tina_microservices"
];

// Sample post content templates
const POST_TEMPLATES = [
  "Just deployed my latest project! 🚀 #coding #webdev",
  "Learning {tech} has been amazing so far! 💻",
  "Coffee and code - the perfect combination ☕️",
  "Debugging for 3 hours, found a missing semicolon 😅",
  "New feature released! Users can now {feature} 🎉",
  "Late night coding session in progress 🌙",
  "Code review completed! Great work team 👏",
  "Database optimization complete - 50% faster queries! ⚡",
  "Docker containers are running smoothly 🐳",
  "API endpoints are responding perfectly 📡",
  "Frontend is looking crisp today ✨",
  "Backend is handling traffic like a champ 💪",
  "Microservices architecture is paying off 🏗️",
  "Cloud deployment successful! ☁️",
  "Security audit passed with flying colors 🔒",
  "Performance testing shows great results 📊",
  "User feedback has been overwhelmingly positive 😊",
  "Team collaboration is at an all-time high 🤝",
  "Innovation never stops in tech! 💡",
  "Building the future, one commit at a time 🚀"
];

const TECH_OPTIONS = ["React", "Next.js", "TypeScript", "Node.js", "MongoDB", "Docker", "Kubernetes", "AWS", "GraphQL", "Redis"];
const FEATURE_OPTIONS = ["upload files", "share posts", "follow users", "like content", "comment on posts", "search content", "filter posts", "sort by date", "view profiles", "send messages"];

function generateRandomPost() {
  const username = SAMPLE_USERNAMES[Math.floor(Math.random() * SAMPLE_USERNAMES.length)];
  const template = POST_TEMPLATES[Math.floor(Math.random() * POST_TEMPLATES.length)];
  
  let content = template;
  if (template.includes("{tech}")) {
    content = content.replace("{tech}", TECH_OPTIONS[Math.floor(Math.random() * TECH_OPTIONS.length)]);
  }
  if (template.includes("{feature}")) {
    content = content.replace("{feature}", FEATURE_OPTIONS[Math.floor(Math.random() * FEATURE_OPTIONS.length)]);
  }
  
  return { content, author: username };
}

function generateUserData(username: string) {
  const displayNames = [
    "Alice Developer", "Bob Coder", "Charlie Tech", "Diana Web", "Eddie Fullstack",
    "Fiona React", "George Node", "Helen JS", "Ivan TypeScript", "Julia Next",
    "Kevin Mongo", "Lisa API", "Mike Docker", "Nina Kubernetes", "Oscar Cloud",
    "Paula DevOps", "Quinn Frontend", "Rachel Backend", "Sam Database", "Tina Microservices"
  ];
  
  const displayName = displayNames[SAMPLE_USERNAMES.indexOf(username)] || username;
  const email = `${username}@example.com`;
  
  return {
    username,
    email,
    displayName,
    bio: `Tech enthusiast and ${username.split('_')[1] || 'developer'}`
  };
}

export default function LoadTestPage() {
  const [postCount, setPostCount] = useState<number | ''>(10);
  const [useBulkApi, setUseBulkApi] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    totalTime: number;
    averageTime: number;
    usersCreated: number;
    postCount: number;
    method: string;
  } | null>(null);
  const [fetchResults, setFetchResults] = useState<{
    totalTime: number;
    postCount: number;
    averageTimePerPost: number;
    postsPerSecond: number;
  } | null>(null);

  const queryClient = useQueryClient();

  const createUser = useMutation({
    mutationFn: async (userData: { username: string; email: string; displayName: string; bio: string }) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const error = await response.json();
        // If user already exists, that's fine
        if (error.error?.includes("already exists")) {
          return { success: true, alreadyExists: true };
        }
        throw new Error("Failed to create user");
      }
      return response.json();
    },
  });

  const createPost = useMutation({
    mutationFn: async (postData: { content: string; author: string }) => {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        throw new Error("Failed to create post");
      }
      return response.json();
    },
  });

  const createBulkPosts = useMutation({
    mutationFn: async (posts: { content: string; author: string }[]) => {
      const response = await fetch("/api/posts/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ posts }),
      });
      if (!response.ok) {
        throw new Error("Failed to create posts in bulk");
      }
      return response.json();
    },
  });

  const fetchAllPosts = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/posts?limit=10000", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    },
  });

  const handleBulkCreate = async () => {
    if (postCount === '' || Number.isNaN(postCount) || postCount < 1) return;

    setIsGenerating(true);
    setResults(null);
    
    const startTime = Date.now();
    let successCount = 0;
    let failedCount = 0;
    let usersCreated = 0;
    
    // First, ensure all users exist
    console.log("Creating users...");
    const uniqueUsernames = [...new Set(SAMPLE_USERNAMES)];
    const userPromises = uniqueUsernames.map(async (username) => {
      try {
        const userData = generateUserData(username);
        const result = await createUser.mutateAsync(userData);
        if (!result.alreadyExists) {
          usersCreated++;
        }
      } catch (error) {
        console.error("Failed to create user:", username, error);
      }
    });
    
    await Promise.all(userPromises);
    console.log(`Created ${usersCreated} new users`);
    
    // Generate posts
    const posts = Array.from({ length: postCount }, () => generateRandomPost());
    
    if (useBulkApi) {
      // Use bulk API
      try {
        const result = await createBulkPosts.mutateAsync(posts);
        successCount = result.count;
        failedCount = postCount - successCount;
      } catch (error) {
        console.error("Failed to create posts in bulk:", error);
        failedCount = postCount;
      }
    } else {
      // Use individual API calls
      const postPromises = posts.map(async (post) => {
        try {
          await createPost.mutateAsync(post);
          successCount++;
        } catch (error) {
          console.error("Failed to create post:", error);
          failedCount++;
        }
      });
      
      await Promise.all(postPromises);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const averageTime = postCount > 0 ? totalTime / postCount : 0;
    
    setResults({
      success: successCount,
      failed: failedCount,
      totalTime,
      averageTime,
      usersCreated,
      postCount,
      method: useBulkApi ? "Bulk API" : "Individual API Calls"
    });
    
    setIsGenerating(false);
    
    // Refresh the posts list
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  const handleFetchTest = async () => {
    setIsFetching(true);
    setFetchResults(null);
    
    const startTime = Date.now();
    
    try {
      const result = await fetchAllPosts.mutateAsync();
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const postCount = result.posts.length;
      const averageTimePerPost = totalTime / postCount;
      const postsPerSecond = (postCount / (totalTime / 1000));
      
      setFetchResults({
        totalTime,
        postCount,
        averageTimePerPost,
        postsPerSecond,
      });
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
    
    setIsFetching(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <Header />
      
      <div className="flex justify-center">
        <div className="w-full max-w-screen-xl flex">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content */}
          <main className="flex-1 border-x border-gray-200 dark:border-gray-800">
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
              <div className="px-4 py-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Load Test
                </h1>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Load Test Controls */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  🚀 Backend Load Testing
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Test your backend's performance by generating multiple posts simultaneously. 
                  This will help you understand how well your system handles high traffic.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="postCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Posts to Generate
                    </label>
                    <input
                      type="number"
                      id="postCount"
                      min="1"
                      max="3000"
                      value={postCount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setPostCount("");
                        } else {
                          setPostCount(parseInt(val, 10));
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter number of posts (1-3000)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      API Method
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="apiMethod"
                          checked={useBulkApi}
                          onChange={() => setUseBulkApi(true)}
                          className="mr-2 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Bulk API (Recommended)
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="apiMethod"
                          checked={!useBulkApi}
                          onChange={() => setUseBulkApi(false)}
                          className="mr-2 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Individual API Calls
                        </span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {useBulkApi 
                        ? "Single API call with all posts - much faster for large batches" 
                        : "Multiple concurrent API calls - tests connection handling"
                      }
                    </p>
                  </div>
                  
                  <button
                    onClick={handleBulkCreate}
                    disabled={isGenerating || postCount === '' || Number.isNaN(postCount) || postCount < 1 || postCount > 30000}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Generating {postCount} posts using {useBulkApi ? 'Bulk API' : 'Individual Calls'}...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀 Generate {Number(postCount) > 0 ? postCount : ''} Posts ({useBulkApi ? 'Bulk' : 'Individual'})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Results */}
              {results && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="mr-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H8V20H4V4Z" fill="#34D399"/>
                        <path d="M10 10H14V20H10V10Z" fill="#60A5FA"/>
                        <path d="M16 14H20V20H16V14Z" fill="#F87171"/>
                      </svg>
                    </span>
                    Test Results
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-green-500/20 p-4 rounded-lg text-center">
                      <div className="text-4xl font-bold text-green-300">
                        {results.success}
                      </div>
                      <div className="text-sm text-green-400 mt-1">
                        Successful Posts
                      </div>
                    </div>
                    
                    <div className="bg-red-500/20 p-4 rounded-lg text-center">
                      <div className="text-4xl font-bold text-red-300">
                        {results.failed}
                      </div>
                      <div className="text-sm text-red-400 mt-1">
                        Failed Posts
                      </div>
                    </div>
                    
                    <div className="bg-orange-500/20 p-4 rounded-lg text-center">
                      <div className="text-4xl font-bold text-orange-300">
                        {results.usersCreated}
                      </div>
                      <div className="text-sm text-orange-400 mt-1">
                        Users Created
                      </div>
                    </div>

                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-500/20 p-4 rounded-lg text-center">
                          <div className="text-4xl font-bold text-blue-300">
                            {(results.totalTime / 1000).toFixed(2)}<span className="text-3xl">s</span>
                          </div>
                          <div className="text-sm text-blue-400 mt-1">
                            Total Time
                          </div>
                        </div>

                        <div className="bg-purple-500/20 p-4 rounded-lg text-center">
                          <div className="text-4xl font-bold text-purple-300">
                            {results.averageTime.toFixed(1)}<span className="text-3xl">ms</span>
                          </div>
                          <div className="text-sm text-purple-400 mt-1">
                            Average Time/Post
                          </div>
                        </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-900/70 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">
                      Performance Analysis - {results.method}
                    </h4>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>• <span className="font-medium text-gray-300">Success Rate:</span> {results.postCount > 0 ? ((results.success / results.postCount) * 100).toFixed(1) : 'N/A'}%</p>
                      <p>• <span className="font-medium text-gray-300">Posts per second:</span> {(results.success / (results.totalTime / 1000)).toFixed(1)}</p>
                      <p>• <span className="font-medium text-gray-300">Concurrent requests handled:</span> {results.method === 'Bulk API' ? '1 bulk request' : results.postCount}</p>
                      <p>• <span className="font-medium text-gray-300">Users available for posts:</span> {SAMPLE_USERNAMES.length}</p>
                      <p>• <span className="font-medium text-gray-300">Method used:</span> {results.method}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Fetch Test Controls */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-4">
                  📊 Database Fetch Performance Test
                </h2>
                <p className="text-green-800 dark:text-green-200 mb-6">
                  Test how long it takes to fetch all posts from the database and measure the performance metrics.
                  This helps you understand your database query performance and scalability.
                </p>
                
                <button
                  onClick={handleFetchTest}
                  disabled={isFetching}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {isFetching ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Fetching all posts...</span>
                    </>
                  ) : (
                    <>
                      <span>📊 Test Database Fetch Performance</span>
                    </>
                  )}
                </button>
              </div>

              {/* Fetch Test Results */}
              {fetchResults && (
                <div className="bg-green-800/50 border border-green-700 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="mr-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#34D399" strokeWidth="2"/>
                      </svg>
                    </span>
                    Database Fetch Test Results
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-500/20 p-4 rounded-lg text-center">
                      <div className="text-4xl font-bold text-green-300">
                        {fetchResults.postCount}
                      </div>
                      <div className="text-sm text-green-400 mt-1">
                        Total Posts Fetched
                      </div>
                    </div>
                    
                    <div className="bg-blue-500/20 p-4 rounded-lg text-center">
                      <div className="text-4xl font-bold text-blue-300">
                        {(fetchResults.totalTime / 1000).toFixed(2)}<span className="text-3xl">s</span>
                      </div>
                      <div className="text-sm text-blue-400 mt-1">
                        Total Fetch Time
                      </div>
                    </div>

                    <div className="bg-purple-500/20 p-4 rounded-lg text-center">
                      <div className="text-4xl font-bold text-purple-300">
                        {fetchResults.averageTimePerPost.toFixed(1)}<span className="text-3xl">ms</span>
                      </div>
                      <div className="text-sm text-purple-400 mt-1">
                        Average Time/Post
                      </div>
                    </div>

                    <div className="bg-orange-500/20 p-4 rounded-lg text-center">
                      <div className="text-4xl font-bold text-orange-300">
                        {fetchResults.postsPerSecond.toFixed(1)}
                      </div>
                      <div className="text-sm text-orange-400 mt-1">
                        Posts/Second
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-900/70 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">
                      Database Performance Analysis
                    </h4>
                    <div className="text-sm text-green-400 space-y-1">
                      <p>• <span className="font-medium text-green-300">Database query efficiency:</span> {fetchResults.postsPerSecond.toFixed(1)} posts per second</p>
                      <p>• <span className="font-medium text-green-300">Response time per post:</span> {fetchResults.averageTimePerPost.toFixed(1)}ms average</p>
                      <p>• <span className="font-medium text-green-300">Total database load:</span> {fetchResults.postCount} posts retrieved</p>
                      <p>• <span className="font-medium text-green-300">Query optimization:</span> {fetchResults.totalTime < 1000 ? "Excellent" : fetchResults.totalTime < 3000 ? "Good" : "Needs optimization"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">
                  ℹ️ How it works
                </h3>
                <div className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
                  <p>• <strong>Load Testing:</strong> First creates 20 unique users if they don't exist</p>
                  <p>• <strong>Load Testing:</strong> Posts are generated with random usernames and content</p>
                  <p>• <strong>Bulk API:</strong> Single API call with all posts - much faster for large batches</p>
                  <p>• <strong>Individual API Calls:</strong> Multiple concurrent requests to test connection handling</p>
                  <p>• <strong>Load Testing:</strong> Results show success rate, timing, and performance metrics</p>
                  <p>• <strong>Database Fetch Test:</strong> Fetches all posts from the database to measure query performance</p>
                  <p>• <strong>Database Fetch Test:</strong> Measures total time, post count, and posts per second</p>
                  <p>• <strong>Database Fetch Test:</strong> Helps identify database bottlenecks and optimization opportunities</p>
                  <p>• Use these tests to benchmark your system's capacity under load and database performance</p>
                </div>
              </div>
            </div>
          </main>
          
          {/* Right Sidebar */}
          <aside className="hidden lg:block w-96 p-4">
            <div className="sticky top-4 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Load Testing Tips
                </h2>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Start Small</div>
                    <div>Begin with 10-50 posts to establish a baseline</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Bulk vs Individual</div>
                    <div>Bulk API is faster for large batches, Individual tests connection limits</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Monitor Resources</div>
                    <div>Watch CPU, memory, and database connections</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Gradual Increase</div>
                    <div>Test with 100, 500, 1000, then 3000 posts</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Compare Methods</div>
                    <div>Try both bulk and individual to see performance differences</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">High Load Testing</div>
                    <div>3000 concurrent posts will stress test your system</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Check Logs</div>
                    <div>Review backend logs for errors and bottlenecks</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4">
                <h2 className="text-xl font-bold text-green-900 dark:text-green-100 mb-4">
                  Database Testing Tips
                </h2>
                <div className="space-y-3 text-sm text-green-800 dark:text-green-200">
                  <div>
                    <div className="font-semibold text-green-900 dark:text-green-100">Run After Load Test</div>
                    <div>Test fetch performance after generating posts</div>
                  </div>
                  <div>
                    <div className="font-semibold text-green-900 dark:text-green-100">Monitor Database</div>
                    <div>Watch MongoDB performance and connection pool</div>
                  </div>
                  <div>
                    <div className="font-semibold text-green-900 dark:text-green-100">Check Indexes</div>
                    <div>Ensure proper indexes on frequently queried fields</div>
                  </div>
                  <div>
                    <div className="font-semibold text-green-900 dark:text-green-100">Compare Results</div>
                    <div>Compare fetch times with different post counts</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      
      {/* Floating Action Button for Mobile */}
      <FloatingActionButton />
    </div>
  );
} 