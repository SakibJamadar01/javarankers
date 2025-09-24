import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import { getUser, logoutUser, updateProfilePhoto } from "@/lib/auth";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "@/lib/theme";
import { isAdmin, logoutAdmin } from "@/lib/admin";
import { Icon } from "@iconify/react";

const nav = [
  { to: "/", label: "Home", icon: "mdi:home" },
  { to: "/advanced-analytics", label: "Analytics", icon: "mdi:chart-line" },
];

const modules = [
  { to: "/challenges", label: "Challenges", icon: "mdi:trophy" },
  { to: "/practice-mode", label: "Practice Mode", icon: "mdi:code-braces" },
];

export function Header() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(getUser());
  const [admin, setAdmin] = useState(isAdmin());
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [customColor, setCustomColor] = useState("#3b82f6");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showModulesDropdown, setShowModulesDropdown] = useState(false);
  const modulesRef = useRef<HTMLDivElement>(null);

  const updateUserState = () => {
    setUser(getUser());
    setAdmin(isAdmin());
  };

  useEffect(() => {
    // Refresh user state on mount
    updateUserState();
    
    const onStorage = () => {
      updateUserState();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Also refresh on pathname change
  useEffect(() => {
    updateUserState();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (modulesRef.current && !modulesRef.current.contains(event.target as Node)) {
        setShowModulesDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  const handleUserLogout = () => {
    logoutUser();
    updateUserState();
    setShowDropdown(false);
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    updateUserState();
    setShowDropdown(false);
    // Redirect to home page after admin logout
    window.location.href = '/';
  };



  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const success = await updateProfilePhoto(base64);
      if (success) {
        updateUserState(); // This will refresh the user state from localStorage
      } else {
        alert('Failed to update profile photo');
      }
    };
    reader.readAsDataURL(file);
  };

  const applyCustomColor = (color: string) => {
    // Convert hex to HSL for CSS custom properties
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    const l = (max + min) / 2;
    const d = max - min;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    
    let h = 0;
    if (d !== 0) {
      switch (max) {
        case r / 255: h = ((g - b) / 255 / d + (g < b ? 6 : 0)) / 6; break;
        case g / 255: h = ((b - r) / 255 / d + 2) / 6; break;
        case b / 255: h = ((r - g) / 255 / d + 4) / 6; break;
      }
    }
    
    const hsl = `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    
    document.documentElement.style.setProperty('--primary', hsl);
    document.documentElement.style.setProperty('--primary-foreground', '0 0% 98%');
    localStorage.setItem('customThemeColor', color);
  };

  useEffect(() => {
    const savedColor = localStorage.getItem('customThemeColor');
    if (savedColor) {
      setCustomColor(savedColor);
      applyCustomColor(savedColor);
    }
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <Icon icon="vscode-icons:file-type-java" className="w-8 h-8" />
          <span className="text-xl font-semibold text-gradient">JavaRanker</span>
        </Link>
        <nav className="flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium hover:bg-accent flex items-center gap-2 transition-colors",
                pathname === n.to && "bg-primary text-primary-foreground"
              )}
            >
              <Icon icon={n.icon} className="w-4 h-4" />
              {n.label}
            </Link>
          ))}
          
          {/* Modules Dropdown */}
          <div className="relative" ref={modulesRef}>
            <button
              onClick={() => setShowModulesDropdown(!showModulesDropdown)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium hover:bg-accent flex items-center gap-2 transition-colors",
                (pathname === '/challenges' || pathname === '/practice-mode' || pathname.startsWith('/practice')) && "bg-primary text-primary-foreground"
              )}
            >
              <Icon icon="mdi:view-module" className="w-4 h-4" />
              Modules
              <Icon icon="mdi:chevron-down" className="w-4 h-4" />
            </button>
            {showModulesDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border bg-popover shadow-lg z-50">
                <div className="p-1">
                  {modules.map((module) => (
                    <Link
                      key={module.to}
                      to={module.to}
                      onClick={() => setShowModulesDropdown(false)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-sm transition-colors",
                        pathname === module.to && "bg-accent"
                      )}
                    >
                      <Icon icon={module.icon} className="w-4 h-4" />
                      {module.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          {admin && (
            <Link
              to="/admin"
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium hover:bg-accent flex items-center gap-2 transition-colors",
                pathname === '/admin' && "bg-primary text-primary-foreground"
              )}
            >
              <Icon icon="mdi:shield-account" className="w-4 h-4" />
              Admin
            </Link>
          )}
          <button
            onClick={toggleTheme}
            className="ml-3 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            <Icon icon={theme === "dark" ? "mdi:weather-sunny" : "mdi:weather-night"} className="w-4 h-4" />
          </button>
          <div className="ml-2 relative" ref={dropdownRef}>
            {user ? (
              <>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 hover:opacity-80 transition-all duration-300 hover:scale-105"
                >
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt="Profile" className="h-10 w-10 rounded-full object-cover border-2 border-premium-teal/20" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-premium-gradient text-white text-sm font-bold border-2 border-premium-teal/20">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-52 rounded-lg border bg-popover shadow-lg z-50">
                    <div className="p-1">
                      <div className="px-3 py-2 text-sm font-medium border-b">{user.username}</div>
                      <label className="block px-3 py-2 text-sm hover:bg-accent cursor-pointer rounded-sm">
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <button 
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm"
                      >
                        Theme Color
                      </button>
                      {showColorPicker && (
                        <div className="px-3 py-2 space-y-3 border-t">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={customColor}
                              onChange={(e) => {
                                setCustomColor(e.target.value);
                                applyCustomColor(e.target.value);
                              }}
                              className="w-8 h-8 rounded border cursor-pointer"
                            />
                            <input
                              type="text"
                              value={customColor}
                              onChange={(e) => {
                                setCustomColor(e.target.value);
                                if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
                                  applyCustomColor(e.target.value);
                                }
                              }}
                              placeholder="#3b82f6"
                              className="flex-1 px-2 py-1 text-xs border rounded bg-background"
                            />
                          </div>
                          <div className="flex gap-1">
                            {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map(color => (
                              <button
                                key={color}
                                onClick={() => {
                                  setCustomColor(color);
                                  applyCustomColor(color);
                                }}
                                className="w-6 h-6 rounded border-2 border-white shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {admin && (
                        <button 
                          onClick={handleAdminLogout}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm text-destructive"
                        >
                          Logout Admin
                        </button>
                      )}
                      <button 
                        onClick={handleUserLogout}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
                User Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
