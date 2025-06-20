import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FloatingActionButton from "@/components/FloatingActionButton";

export default function Explore() {
  const capybaraFacts = [
    {
      title: "The World's Largest Rodent",
      description: "Capybaras can grow up to 4 feet long and weigh over 100 pounds, making them the largest rodents in the world.",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      title: "Nature's Zen Masters",
      description: "Capybaras are known for their incredibly calm and peaceful nature. They rarely get stressed and are often seen lounging in water.",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
    },
    {
      title: "Social Butterflies",
      description: "These gentle giants live in groups of 10-20 individuals and are incredibly social animals that get along with almost everyone.",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      title: "Water Lovers",
      description: "Capybaras are excellent swimmers and spend much of their time in water to stay cool and avoid predators.",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
    },
    {
      title: "The Ultimate Chill Buddies",
      description: "Known as 'nature's therapists', capybaras have a calming presence that makes other animals feel safe around them.",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
      title: "Living Stress-Free",
      description: "Capybaras teach us the art of relaxation - they take life slow, enjoy good company, and never rush through their day.",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
    }
  ];

  const capybaraImages = [
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
  ];

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

              {/* Capybara Photo Gallery */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Capybara Photo Gallery 📸
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {capybaraImages.map((image, index) => (
                    <div key={index} className="relative group overflow-hidden rounded-2xl">
                      <img 
                        src={image} 
                        alt={`Capybara ${index + 1}`}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                      <div className="absolute bottom-2 left-2 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Chill Level: {Math.floor(Math.random() * 100) + 1}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capybara Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {capybaraFacts.map((fact, index) => (
                  <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={fact.image} 
                        alt={fact.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {fact.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {fact.description}
                      </p>
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