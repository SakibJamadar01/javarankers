import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ChallengesPage from "./pages/Challenges";
import ChallengeDetailPage from "./pages/Challenge";
import AdminPage from "./pages/Admin";
import PracticeCategoryPage from "./pages/PracticeCategory";
import PracticePlayPage from "./pages/PracticePlay";
import PracticeModePage from "./pages/PracticeMode";
import PracticeCodingPage from "./pages/PracticeCoding";
import LoginPage from "./pages/Login";
import AnalyticsPage from "./pages/Analytics";
import AdvancedAnalyticsPage from "./pages/AdvancedAnalytics";
import AboutPage from "./pages/About";
import FeedbackPage from "./pages/Feedback";
import BlogsPage from "./pages/Blogs";
import BlogPostPage from "./pages/BlogPost";
import IDEPage from "./pages/IDE";
import { ThemeProvider } from "./lib/theme";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Handle page visibility change (tab switch, minimize)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Update last activity when page becomes hidden
        localStorage.setItem('lastActivity', Date.now().toString());
        localStorage.setItem('adminLastActivity', Date.now().toString());
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/challenge/:id" element={<ChallengeDetailPage />} />
            <Route path="/practice/:category" element={<PracticeCategoryPage />} />
            <Route path="/practice/:category/play/:idx" element={<PracticePlayPage />} />
            <Route path="/practice-mode" element={<PracticeModePage />} />
            <Route path="/practice-coding/:challengeId" element={<PracticeCodingPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/advanced-analytics" element={<AdvancedAnalyticsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/blogs/:slug" element={<BlogPostPage />} />
            <Route path="/ide" element={<IDEPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
