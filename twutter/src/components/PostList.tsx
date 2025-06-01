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
      <div className="text-gray-700 dark:text-gray-300">Loading posts...</div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400">
        Error loading posts: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data?.posts.map((post) => (
        <div
          key={post._id}
          className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-900 dark:text-white">
                  {post.author}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-gray-800 dark:text-gray-200">
                {post.content}
              </p>
              <div className="mt-3 flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                <button className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <span>❤️</span>
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <span>💬</span>
                  <span>{post.comments.length}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
