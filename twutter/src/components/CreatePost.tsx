"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "./UserContext";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const { currentUser } = useUser();
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setContent("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    createPost.mutate({ content, author: currentUser.username });
  };

  if (!currentUser) {
    return (
      <div className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Please login to create a post
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 pb-4" data-create-post>
      <div className="flex space-x-3">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {currentUser.username[0].toUpperCase()}
        </div>
        
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg resize-none focus:outline-none min-h-[120px]"
                placeholder="What's happening?"
                required
                maxLength={280}
              />
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-4 text-blue-500">
                <button type="button" className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  📷
                </button>
                <button type="button" className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  🎥
                </button>
                <button type="button" className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  😊
                </button>
                <button type="button" className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  📍
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {content.length}/280
                </span>
                <button
                  type="submit"
                  disabled={createPost.isPending || !content.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-full transition-colors"
                >
                  {createPost.isPending ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
