import { Suspense } from "react";
import PostList from "@/components/PostList";
import CreatePost from "@/components/CreatePost";
import CreateUser from "@/components/CreateUser";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto p-4">
        <header className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Twutter
          </h1>
        </header>

        <div className="space-y-6">
          <CreateUser />
          <CreatePost />
          <Suspense
            fallback={
              <div className="text-gray-700 dark:text-gray-300">
                Loading posts...
              </div>
            }
          >
            <PostList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
