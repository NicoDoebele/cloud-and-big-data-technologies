"use client";

import { useState } from "react";

export default function FloatingActionButton() {
  const [isVisible, setIsVisible] = useState(true);

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setIsVisible(scrollTop < 100);
  };

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", handleScroll);
  }

  return (
    <div className="md:hidden fixed bottom-6 right-6 z-50">
      <button
        className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        onClick={() => {
          // Scroll to the create post section
          const createPostElement = document.querySelector('[data-create-post]');
          if (createPostElement) {
            createPostElement.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
} 