import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, loginUser, logoutUser, registerUser } from "@/lib/auth";
import { isAdmin, loginAdmin, logoutAdmin } from "@/lib/admin";
import { Icon } from "@iconify/react";
import { User, Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";



export default function LoginPage() {
  const [existing, setExisting] = useState(getUser());
  const [admin, setAdmin] = useState(isAdmin());
  const navigate = useNavigate();
  
  // Listen for auth state changes and redirect if logged in
  useEffect(() => {
    const handleStorageChange = () => {
      setExisting(getUser());
      setAdmin(isAdmin());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const [mode, setMode] = useState<"login" | "register" | "admin">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  
  // Redirect if already logged in
  useEffect(() => {
    if (existing) {
      navigate('/');
    }
  }, [existing, navigate]);

  useEffect(() => {
    if (mode === "login") {
      const text = "Welcome Back";
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          setTypedText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, [mode]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorTimer);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      if (mode === "login") {
        try {
          const u = await loginUser(username.trim(), password);
          if (u) {
            navigate("/");
          } else {
            setMsg("Invalid credentials");
          }
        } catch (error) {
          setMsg("Login failed. Please try again.");
        }
      } else if (mode === "register") {
        try {
          const u = await registerUser(username.trim(), password, email.trim() || undefined);
          if (u) {
            navigate("/");
          } else {
            setMsg("Registration failed");
          }
        } catch (error) {
          setMsg("Registration failed. Please try again.");
        }
      } else if (mode === "admin") {
        try {
          const success = await loginAdmin(adminUsername.trim(), adminPassword);
          if (success) {
            setMsg("Admin login successful");
            setTimeout(() => navigate("/admin"), 1000);
          } else {
            setMsg("Invalid admin credentials");
          }
        } catch (error) {
          setMsg("Admin login failed. Please try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image */}
      <img 
        src="/images/javacode-bg.jpeg" 
        alt="Background" 
        className="fixed inset-0 w-screen h-screen object-cover object-center"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="w-full max-w-4xl bg-transparent backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/5 relative z-10">
        <div className="grid lg:grid-cols-2 min-h-[600px]">
          {/* Left Side - Image/Visual */}
          <div className="hidden lg:flex relative overflow-hidden">
            {/* Background Image */}
            <img 
              src="/images/login-bg.jpg" 
              alt="JavaRanker Login"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Right Side - Form */}
          <div className="flex flex-col justify-center p-8 lg:p-12 relative">
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-transparent backdrop-blur-xl border-l border-white/5 shadow-inner"></div>
            <div className="w-full max-w-md mx-auto space-y-8 relative z-10">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                  <Icon icon="vscode-icons:file-type-java" className="w-8 h-8" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">JavaRanker</span>
                </div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg" style={{fontFamily: 'Varien, serif'}}>
                  {mode === "login" ? (
                    <span>
                      {typedText}
                      <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>|</span>
                    </span>
                  ) : mode === "register" ? "Create Account" : "Admin Login"}
                </h1>
                <p className="mt-2 text-white/90 drop-shadow">
                  {mode === "login" ? "Sign in to your account" : mode === "register" ? "Join JavaRanker today" : "Admin access required"}
                </p>
              </div>


              
              {admin && (
                <div className="rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span className="text-sm">Admin access enabled</span>
                    </div>
                    <button className="rounded-lg border px-3 py-1 text-xs hover:bg-white dark:hover:bg-slate-700 transition-colors" onClick={()=>{logoutAdmin(); setAdmin(false);}}>Logout Admin</button>
                  </div>
                </div>
              )}
              
              {msg && (
                <div className="rounded-xl bg-slate-50 dark:bg-slate-700 border p-4">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:information" className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">{msg}</span>
                  </div>
                </div>
              )}

              <form onSubmit={submit} className="space-y-6">
                {mode === "admin" ? (
                  <>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 pl-12 pr-4 py-4 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all" 
                        placeholder="Admin Username" 
                        value={adminUsername} 
                        onChange={(e)=>setAdminUsername(e.target.value)} 
                        required
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 pl-12 pr-12 py-4 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all" 
                        placeholder="Admin Password" 
                        type={showPassword ? "text" : "password"} 
                        value={adminPassword} 
                        onChange={(e)=>setAdminPassword(e.target.value)} 
                        required
                      />
                      <button 
                        type="button" 
                        className="absolute inset-y-0 right-0 pr-4 flex items-center" 
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5 text-slate-400" /> : <Eye className="h-5 w-5 text-slate-400" />}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 pl-12 pr-4 py-4 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all" 
                        placeholder="Username" 
                        value={username} 
                        onChange={(e)=>setUsername(e.target.value)} 
                        required
                      />
                    </div>
                    {mode === "register" && (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                          className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 pl-12 pr-4 py-4 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all" 
                          placeholder="Email (optional)" 
                          type="email" 
                          value={email} 
                          onChange={(e)=>setEmail(e.target.value)} 
                        />
                      </div>
                    )}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 pl-12 pr-12 py-4 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all" 
                        placeholder="Password" 
                        type={showPassword ? "text" : "password"} 
                        value={password} 
                        onChange={(e)=>setPassword(e.target.value)} 
                        required
                      />
                      <button 
                        type="button" 
                        className="absolute inset-y-0 right-0 pr-4 flex items-center" 
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5 text-slate-400" /> : <Eye className="h-5 w-5 text-slate-400" />}
                      </button>
                    </div>
                  </>
                )}
                <button 
                  disabled={loading} 
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-4 text-white font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {loading && <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />}
                  {loading ? 
                    (mode === "login" ? "Signing in..." : mode === "register" ? "Creating account..." : "Logging in...") : 
                    (mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Admin Login")
                  }
                </button>
              </form>

              <div className="text-center space-y-3">
                {mode === "login" ? (
                  <>
                    <p className="text-sm text-white/80 drop-shadow">
                      Don't have an account?{" "}
                      <button type="button" className="text-blue-300 hover:text-blue-200 font-medium hover:underline transition-colors drop-shadow" onClick={()=>setMode("register")}>Sign up</button>
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <button type="button" className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors flex items-center justify-center gap-1 mx-auto" onClick={()=>setMode("admin")}>
                        <Shield className="w-4 h-4" />
                        Admin Login
                      </button>
                    </p>
                  </>
                ) : mode === "register" ? (
                  <>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Already have an account?{" "}
                      <button type="button" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors" onClick={()=>setMode("login")}>Sign in</button>
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <button type="button" className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors flex items-center justify-center gap-1 mx-auto" onClick={()=>setMode("admin")}>
                        <Shield className="w-4 h-4" />
                        Admin Login
                      </button>
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <button type="button" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors flex items-center justify-center gap-1 mx-auto" onClick={()=>setMode("login")}>
                      <Icon icon="mdi:arrow-left" className="w-4 h-4" />
                      Back to User Login
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}