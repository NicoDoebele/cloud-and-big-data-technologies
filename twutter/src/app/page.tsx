import { Suspense } from "react";
import PostList from "@/components/PostList";
import CreatePost from "@/components/CreatePost";
import CreateUser from "@/components/CreateUser";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FloatingActionButton from "@/components/FloatingActionButton";
import WhoToFollow from "@/components/WhoToFollow";
import { UserProvider } from "@/components/UserContext";
import Login from "@/components/Login";

export default function Home() {
  return (
    <UserProvider>
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
                    Home
                  </h1>
                </div>
              </div>
              
              <div className="p-4 space-y-6">
                <Login />
                <CreateUser />
                <CreatePost />
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-8">
                      <div className="text-gray-500 dark:text-gray-400">
                        Loading posts...
                      </div>
                    </div>
                  }
                >
                  <PostList />
                </Suspense>
              </div>
            </main>
            
            {/* Right Sidebar - Trending/Who to follow */}
            <aside className="hidden lg:block w-96 p-4">
              <div className="sticky top-4 space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    What's happening
                  </h2>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Trending in Technology
                    </div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      #NextJS
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      50.5K posts
                    </div>
                  </div>
                </div>
                
                <WhoToFollow />
              </div>
            </aside>
          </div>
        </div>
        
        {/* Floating Action Button for Mobile */}
        <FloatingActionButton />
      </div>
    </UserProvider>
  );
}
