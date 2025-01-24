import React, { useState } from "react";
import { motion } from "framer-motion";
import { FlickeringGrid } from "@/components/ui/flickering-grid";


export default function Hero() {
  const [hoveredLink, setHoveredLink] = useState(null);

  // Mock navigation function
  const handleNavigation = (path) => {
    // In a real app, this would use actual routing
    window.location.href = path;
  };

  const categoryLinks = [
    {
      to: "/movies",
      icon: "🎥",
      title: "Movies",
      description: "Manage your movie watchlist",
      gradientFrom: "from-indigo-600",
      gradientTo: "to-purple-600",
      backgroundEffect: "bg-gradient-to-br from-indigo-50 to-purple-50"
    },
    {
      to: "/studies",
      icon: "📚",
      title: "Studies",
      description: "Organize your study plans",
      gradientFrom: "from-teal-600",
      gradientTo: "to-emerald-600",
      backgroundEffect: "bg-gradient-to-br from-teal-50 to-emerald-50"
    }
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 p-4 overflow-hidden">
      {/* Subtle Background Pattern */}
      
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <FlickeringGrid
                className="relative inset-0 z-0 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
                squareSize={7}
                gridGap={6}
                color="#5e34eb"
                maxOpacity={0.7}
                flickerChance={0.1}
              />
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="subtle-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path 
                d="M0 40 L40 0 Z" 
                strokeWidth="1" 
                stroke="rgba(0,0,0,0.05)" 
                fill="transparent"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#subtle-grid)" />
        </svg>
      </div>

      <div className="relative z-10 text-center max-w-3xl w-full px-6">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-extralight tracking-tight text-gray-800 mb-4">
            Your Personal <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Task Manager</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Streamline your productivity with intuitive task categorization
          </p>
        </motion.div>

        {/* Category Links */}
        <div className="flex flex-col md:flex-row justify-center gap-6 mt-12">
          {categoryLinks.map((category) => (
            <motion.div
              key={category.to}
              className="w-full max-w-xs" // Reduced max width
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onMouseEnter={() => setHoveredLink(category.to.slice(1))}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <button 
                onClick={() => handleNavigation(category.to)}
                className={`
                  relative p-1 rounded-xl 
                  w-full
                  bg-gradient-to-br ${category.gradientFrom} ${category.gradientTo}
                  shadow-lg hover:shadow-xl transition-shadow
                `}
              >
                <div 
                  className={`
                    relative block w-full px-3 py-3 // Reduced padding
                    ${category.backgroundEffect}
                    rounded-lg
                    text-gray-800
                    transition-all duration-300
                    hover:bg-opacity-80
                  `}
                >
                  <span className="text-2xl block mb-2">{category.icon}</span>
                  <span className="text-xl font-bold tracking-wide"> 
                    {category.title}
                  </span>
                </div>
              </button>
              
              {hoveredLink === category.to.slice(1) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 right-0 text-center text-gray-500 text-sm mt-3"
                >
                  {category.description}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Additional Instructions */}
        <p className="text-gray-400 text-sm mt-16">
          Select a category to begin organizing your tasks
        </p>
      </div>
    </div>
  );
}