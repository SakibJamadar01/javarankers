import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

interface WelcomeScreenProps {
  username: string;
  onComplete: () => void;
}

export default function WelcomeScreen({ username, onComplete }: WelcomeScreenProps) {
  const [welcomeText, setWelcomeText] = useState("");
  const [usernameText, setUsernameText] = useState("");
  const [showUsername, setShowUsername] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Type "WELCOME" first
    const welcome = "WELCOME";
    let i = 0;
    const welcomeTimer = setInterval(() => {
      if (i < welcome.length) {
        setWelcomeText(welcome.slice(0, i + 1));
        i++;
      } else {
        clearInterval(welcomeTimer);
        setTimeout(() => setShowUsername(true), 500);
      }
    }, 150);

    return () => clearInterval(welcomeTimer);
  }, []);

  useEffect(() => {
    if (showUsername) {
      // Type username after welcome
      let i = 0;
      const usernameTimer = setInterval(() => {
        if (i < username.length) {
          setUsernameText(username.slice(0, i + 1));
          i++;
        } else {
          clearInterval(usernameTimer);
          // Auto hide after 3 seconds
          setTimeout(() => {
            onComplete();
          }, 3000);
        }
      }, 100);

      return () => clearInterval(usernameTimer);
    }
  }, [showUsername, username, onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Simple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"></div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Java Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
            <Icon icon="vscode-icons:file-type-java" className="w-32 h-32 relative z-10 animate-bounce" />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-4">
          <h1 
            className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl tracking-wider"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
              {welcomeText}
            </span>
          </h1>

          {/* Username with different styling */}
          {showUsername && (
            <h2 
              className="text-4xl md:text-6xl font-bold text-white drop-shadow-xl transform transition-all duration-800 ease-out"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                {usernameText}
              </span>
            </h2>
          )}
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center space-x-8 mt-12">
          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-ping delay-200"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-ping delay-400"></div>
        </div>
      </div>


    </div>
  );
}