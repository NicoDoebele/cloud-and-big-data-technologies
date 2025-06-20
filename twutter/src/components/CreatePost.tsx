"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function CreatePost() {
  const [formData, setFormData] = useState({
    content: "",
    author: "",
  });

  const queryClient = useQueryClient();

  const createPost = useMutation({
    mutationFn: async (postData: typeof formData) => {
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
      setFormData({ content: "", author: "" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPost.mutate(formData);
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 pb-4" data-create-post>
      <div className="flex space-x-3">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {formData.author ? formData.author[0].toUpperCase() : "U"}
        </div>
        
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                className="w-full p-3 bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg focus:outline-none"
                placeholder="What's your username?"
                required
              />
            </div>
            
            <div>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full p-3 bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg resize-none focus:outline-none min-h-[120px]"
                placeholder="What's happening?"
                required
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
              
              <button
                type="submit"
                disabled={createPost.isPending || !formData.content.trim() || !formData.author.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-full transition-colors"
              >
                {createPost.isPending ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
