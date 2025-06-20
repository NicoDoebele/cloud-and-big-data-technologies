"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FloatingActionButton from "@/components/FloatingActionButton";

export default function Explore() {
  const capybaraFacts = [
    {
      title: "The World's Largest Rodent",
      description: "Capybaras can grow up to 4 feet long and weigh over 100 pounds, making them the largest rodents in the world.",
      image: "https://images.unsplash.com/photo-1599482499632-136d895f3731?q=80&w=2824&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 85
    },
    {
      title: "Nature's Zen Masters",
      description: "Capybaras are known for their incredibly calm and peaceful nature. They rarely get stressed and are often seen lounging in water.",
      image: "https://images.unsplash.com/photo-1559934382-654d580c885c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 95
    },
    {
      title: "Social Butterflies",
      description: "These gentle giants live in groups of 10-20 individuals and are incredibly social animals that get along with almost everyone.",
      image: "https://images.unsplash.com/photo-1628183353426-9f041e6c384e?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 90
    },
    {
      title: "Water Lovers",
      description: "Capybaras are excellent swimmers and spend much of their time in water to stay cool and avoid predators.",
      image: "https://images.unsplash.com/photo-1628183353426-9f041e6c384e?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 88
    },
    {
      title: "The Ultimate Chill Buddies",
      description: "Known as 'nature's therapists', capybaras have a calming presence that makes other animals feel safe around them.",
      image: "https://images.unsplash.com/photo-1572948604164-947c569a331d?q=80&w=2954&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 92
    },
    {
      title: "Living Stress-Free",
      description: "Capybaras teach us the art of relaxation - they take life slow, enjoy good company, and never rush through their day.",
      image: "https://images.unsplash.com/photo-1543682441-160a7489953d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 96
    }
  ];

  const capybaraGallery = [
    {
      title: "Ultra Chill - Baby Riding on Mom",
      description: "Baby capybara floating in water at golden hour",
      image: "https://images.unsplash.com/photo-1599482499632-136d895f3731?q=80&w=2824&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 100,
      type: "image"
    },
    {
      title: "Super Relaxed - Group Soaking",
      description: "Group soaking in shallow water, barely moving",
      image: "https://images.unsplash.com/photo-1559934382-654d580c885c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 95,
      type: "image"
    },
    {
      title: "Floating Calm - Serene Drift",
      description: "Artistic depiction of a capybara serenely drifting",
      image: "https://images.unsplash.com/photo-1628183353426-9f041e6c384e?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 98,
      type: "image"
    },
    {
      title: "Laid-back Lone Soak",
      description: "Single capybara chilling in a steamy hot spring",
      image: "https://images.unsplash.com/photo-1572948604164-947c569a331d?q=80&w=2954&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 93,
      type: "image"
    },
    {
      title: "Chill with Snack",
      description: "Capybara lying with oranges lined on its back",
      image: "https://images.unsplash.com/photo-1543682441-160a7489953d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 87,
      type: "image"
    },
    {
      title: "Very Mellow - Water's Edge",
      description: "A capybara standing calmly by the water's edge",
      image: "https://images.unsplash.com/photo-1614028290516-abea9b6ac613?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      chillLevel: 89,
      type: "image"
    },
    {
      title: "Just Chillin' - Grass Buddies",
      description: "Two capybaras hanging out on grass, eyes half-closed",
      video: "https://www.youtube.com/watch?v=1-qaQuggBno",
      chillLevel: 91,
      type: "video"
    },
    {
      title: "Zen Vibes - Lofi Sunset",
      description: "Lofi vibes with a capybara and turtle at sunset",
      video: "https://www.youtube.com/watch?v=0wB7iuER2X0",
      chillLevel: 99,
      type: "video"
    },
    {
      title: "Extended Relaxation - Hot Spring",
      description: "Capybara soaking in Japanese zoo hot spring for an hour",
      video: "https://www.youtube.com/watch?v=FR3i0qKzRvg",
      chillLevel: 97,
      type: "video"
    },
    {
      title: "Spa Day - Vaporwave Vibes",
      description: "Capybara enjoying spa-like downtime in calming hot spring",
      video: "https://boingboing.net/2023/12/27/capybaras-vaporwave-the-most-relaxing-video-ever.html",
      chillLevel: 100,
      type: "video"
    }
  ];

  const getChillEmoji = (level: number) => {
    if (level >= 95) return "😌";
    if (level >= 90) return "😊";
    if (level >= 85) return "😎";
    if (level >= 80) return "😄";
    return "🙂";
  };

  const getChillStatus = (level: number) => {
    if (level >= 95) return "Maximum Chill";
    if (level >= 90) return "Super Relaxed";
    if (level >= 85) return "Very Mellow";
    if (level >= 80) return "Pretty Chill";
    return "Getting There";
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
                  Explore Capybaras 🦦
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Discover the world's most chill animals
                </p>
              </div>
            </div>
            
            <div className="p-4">
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-8 mb-8 text-white">
                <div className="text-center">
                  <h2 className="text-4xl font-bold mb-4">Welcome to Capybara Paradise</h2>
                  <p className="text-xl opacity-90">
                    Where stress doesn't exist and every day is a spa day
                  </p>
                </div>
              </div>

              {/* Capybara Gallery */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Capybara Chill Gallery 📸
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {capybaraGallery.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="relative h-48 overflow-hidden">
                        {item.type === "video" ? (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="text-4xl mb-2">🎥</div>
                              <div className="text-sm font-medium">{item.title}</div>
                              <div className="text-xs opacity-80 mt-1">{item.description}</div>
                            </div>
                          </div>
                        ) : (
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling!.classList.remove('hidden');
                            }}
                          />
                        )}
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {item.type === "video" ? "Watch Video" : "📸 Image"}
                        </div>
                        {/* Fallback for failed images */}
                        {item.type === "image" && (
                          <div className="hidden w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="text-4xl mb-2">🦦</div>
                              <div className="text-sm font-medium">{item.title}</div>
                              <div className="text-xs opacity-80 mt-1">{item.description}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          {item.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getChillEmoji(item.chillLevel)}</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {getChillStatus(item.chillLevel)}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {item.chillLevel}% chill
                          </div>
                        </div>
                        {item.type === "video" && (
                          <a 
                            href={item.video} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-3 inline-block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                          >
                            Watch Video 🎬
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capybara Facts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {capybaraFacts.map((fact, index) => (
                  <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={fact.image} 
                        alt={fact.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                      {/* Fallback for failed images */}
                      <div className="hidden w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="text-6xl mb-2">🦦</div>
                          <div className="text-sm font-medium">{fact.title}</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {fact.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        {fact.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getChillEmoji(fact.chillLevel)}</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {getChillStatus(fact.chillLevel)}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {fact.chillLevel}% chill
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chill Vibes Section */}
              <div className="mt-12 bg-gray-50 dark:bg-gray-900 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                  Life Lessons from Capybaras 🧘‍♂️
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">😌</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Stay Calm</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Nothing is worth stressing over</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">💧</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Take a Bath</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Water is therapeutic</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">👥</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Be Social</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Good friends make life better</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">🌿</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Eat Well</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Fresh greens are always good</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">😴</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Rest Often</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Naps are essential</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">❤️</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Spread Love</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Be kind to everyone</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote Section */}
              <div className="mt-8 text-center">
                <blockquote className="text-2xl font-light text-gray-700 dark:text-gray-300 italic">
                  "Be like a capybara: chill, friendly, and always ready for a good time in the water."
                </blockquote>
                <p className="text-gray-500 dark:text-gray-400 mt-2">- Ancient Capybara Wisdom</p>
              </div>
            </div>
          </main>
          
          {/* Right Sidebar */}
          <aside className="hidden lg:block w-96 p-4">
            <div className="sticky top-4 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Capybara Facts
                </h2>
                <div className="space-y-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Scientific Name
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    Hydrochoerus hydrochaeris
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Native to South America
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Why Capybaras Are Awesome
                </h2>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• They're incredibly peaceful</li>
                  <li>• Great swimmers</li>
                  <li>• Social animals</li>
                  <li>• Help other animals relax</li>
                  <li>• Live stress-free lives</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Capybara Mood Today
                </h2>
                <div className="text-center">
                  <div className="text-6xl mb-2">😌</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Maximum Chill Mode
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    100% relaxation achieved
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Featured Videos
                </h2>
                <div className="space-y-3">
                  <a 
                    href="https://www.youtube.com/watch?v=0wB7iuER2X0" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">🎵 Zen Vibes - Lofi Sunset</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">99% chill level</div>
                  </a>
                  <a 
                    href="https://www.youtube.com/watch?v=FR3i0qKzRvg" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">🛁 Extended Hot Spring Relaxation</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">97% chill level</div>
                  </a>
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