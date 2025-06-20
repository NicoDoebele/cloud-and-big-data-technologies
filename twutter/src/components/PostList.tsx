"use client";

import { useQuery } from "@tanstack/react-query";

interface Post {
  _id: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: Array<{
    content: string;
    author: string;
    createdAt: string;
  }>;
}

export default function PostList() {
  const { data, isLoading, error } = useQuery<{ posts: Post[] }>({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await fetch("/api/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 text-center py-8">
        Error loading posts: {error.message}
      </div>
    );
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  return (
    <div className="space-y-0">
      {data?.posts.map((post) => (
        <article
          key={post._id}
          className="border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
        >
          <div className="flex space-x-3">
            {/* Avatar */}
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {post.author ? post.author[0].toUpperCase() : "U"}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-bold text-gray-900 dark:text-white hover:underline">
                  {post.author}
                </span>
                <span className="text-gray-500 dark:text-gray-400">·</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {formatTimeAgo(post.createdAt)}
                </span>
              </div>
              
              {/* Post content */}
              <p className="text-gray-900 dark:text-white text-lg mb-3 leading-relaxed">
                {post.content}
              </p>
              
              {/* Interaction buttons */}
              <div className="flex items-center justify-between max-w-md">
                <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors group">
                  <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    💬
                  </div>
                  <span className="text-sm">{post.comments.length}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors group">
                  <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors">
                    🔄
                  </div>
                  <span className="text-sm">0</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors group">
                  <div className="p-2 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                    ❤️
                  </div>
                  <span className="text-sm">{post.likes}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors group">
                  <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    📊
                  </div>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors group">
                  <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    📤
                  </div>
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
      
      {data?.posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            No posts yet
          </div>
          <div className="text-gray-400 dark:text-gray-500">
            Be the first to share something!
          </div>
        </div>
      )}
    </div>
  );
}
