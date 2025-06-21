"use client";

import { useState } from "react";
import CommentSection from "./CommentSection";

// This should be in a types file
interface PostProps {
  post: {
    _id: string;
    content: string;
    author: string;
    createdAt: string;
    likes: number;
    comments?: Array<{
      _id: string;
      content: string;
      author: string;
      createdAt: string;
    }>;
  };
  currentUser: { username: string } | null;
  formatTimeAgo: (dateString: string) => string;
}

export default function Post({ post, currentUser, formatTimeAgo }: PostProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Using a character count heuristic to determine if the post is long
  const isLongPost = post.content.length > 300;

  return (
    <article
      className="border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
    >
      <div className="flex space-x-3">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {post.author ? post.author[0].toUpperCase() : "U"}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-bold text-gray-900 dark:text-white hover:underline">
              {post.author}
            </span>
            <span className="text-gray-500 dark:text-gray-400">·</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {formatTimeAgo(post.createdAt)}
            </span>
          </div>
          
          <div className="text-gray-900 dark:text-white text-lg mb-3 leading-relaxed break-all">
            <p className={isLongPost && !isExpanded ? "line-clamp-4" : ""}>
              {post.content}
            </p>
            {isLongPost && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-500 hover:underline mt-1 text-sm"
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-between max-w-md">
            <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                💬
              </div>
              <span className="text-sm">{post.comments?.length || 0}</span>
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
          
          <CommentSection 
            postId={post._id}
            comments={post.comments || []}
            currentUser={currentUser?.username}
          />
        </div>
      </div>
    </article>
  );
} 