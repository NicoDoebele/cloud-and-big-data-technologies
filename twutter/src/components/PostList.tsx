"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "./UserContext";
import Post from "./Post";

interface Post {
  _id: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: Array<{
    _id: string;
    content: string;
    author: string;
    createdAt: string;
  }>;
}

interface PostListProps {
  posts?: Post[];
}

export default function PostList({ posts: initialPosts }: PostListProps) {
  const { currentUser } = useUser();
  
  const { data, isLoading, error } = useQuery<{ posts: Post[] }>({
    queryKey: ["posts"],
    queryFn: async () => {
      if (initialPosts) return { posts: initialPosts };
      const response = await fetch("/api/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    },
    enabled: !initialPosts, // only fetch if initialPosts are not provided
  });

  const postsToRender = initialPosts || data?.posts;

  if (isLoading && !initialPosts) {
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
      {postsToRender?.map((post) => (
        <Post 
          key={post._id}
          post={post}
          currentUser={currentUser}
          formatTimeAgo={formatTimeAgo}
        />
      ))}
      
      {postsToRender?.length === 0 && (
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
