
import { addChallenge, getCategories, exportCustom, importCustom, addCategory, allChallenges, removeChallenge, removeCategory, saveChallengeToDB, fetchChallengesFromDB, deleteChallengeFromDB } from "@/data/challenges";
import { useMemo, useState, useEffect, useRef } from "react";
import { isAdmin, loginAdmin, logoutAdmin, getAdminData, updateAdminProfilePhoto } from "@/lib/admin";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useTheme } from "@/lib/theme";
import { getUser, logoutUser } from "@/lib/auth";

export default function AdminPage() {
  const [code, setCode] = useState("");
  const [admin, setAdmin] = useState(isAdmin());
  const [activeTab, setActiveTab] = useState<'challenges' | 'blogs' | 'analytics'>('challenges');
  
  // Check admin status on mount and listen for changes
  useEffect(() => {
    const checkAdmin = () => {
      const adminStatus = isAdmin();
      setAdmin(adminStatus);
      if (!adminStatus && window.location.pathname === '/admin') {
        window.location.href = '/';
      }
    };
    
    checkAdmin();
    window.addEventListener('storage', checkAdmin);
    return () => window.removeEventListener('storage', checkAdmin);
  }, []);



  const tryLogin = async () => {
    const success = await loginAdmin("SAKIBJ", code);
    if (success) {
      setAdmin(true);
    } else {
      alert("Invalid admin code");
    }
  };



  if (!admin) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <main className="container py-8">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <input className="mt-4 w-full rounded-md border px-3 py-2 bg-background text-foreground" placeholder="Enter admin code (default: javadmin)" value={code} onChange={(e)=>setCode(e.target.value)} />
            <button className="mt-3 rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={tryLogin}>Login</button>
          </div>
        </main>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'challenges'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('challenges')}
            >
              <Icon icon="mdi:puzzle" className="w-4 h-4 inline mr-2" />
              Manage Challenges
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'blogs'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('blogs')}
            >
              <Icon icon="mdi:post" className="w-4 h-4 inline mr-2" />
              Blog Management
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              <Icon icon="mdi:chart-line" className="w-4 h-4 inline mr-2" />
              Analytics Dashboard
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'challenges' && <ChallengeManagement />}
          {activeTab === 'blogs' && <BlogManagement />}
          {activeTab === 'analytics' && <AdminAnalytics />}
        </div>
      </main>

    </div>
  );
}

function ChallengeManagement() {
  const [form, setForm] = useState({
    title: "",
    problem: "",
    concept: "",
    category: "Data Types",
    difficulty: "Easy",
    sampleCode: "",
    testCases: [{input: "", expectedOutput: ""}],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importText, setImportText] = useState("");
  const [exportText, setExportText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [dbChallenges, setDbChallenges] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const loadChallenges = async () => {
    const challenges = await fetchChallengesFromDB();
    setDbChallenges(challenges);
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const categoriesList = useMemo(() => getCategories(), [version]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const challengeData = {
        ...form,
        id: editingId || `${form.category.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`
      };
      
      console.log('Saving challenge data:', challengeData);
      console.log('Sample code being saved:', challengeData.sampleCode);
      const success = await saveChallengeToDB(challengeData as any);
      if (success) {
        setNotice(editingId ? `Updated: ${form.title}` : `Added: ${form.title}`);
        setEditingId(null);
        setForm({title:"",problem:"",concept:"",category:"Data Types",difficulty:"Easy",sampleCode:"",testCases:[{input:"",expectedOutput:""}]});
        await loadChallenges();
      } else {
        setNotice("Failed to save challenge");
      }
    } catch (error) {
      setNotice("Error saving challenge");
      console.error('Challenge save error:', error);
    }
  };

  const doImport = () => {
    try {
      importCustom(importText);
      setNotice("Imported custom challenges");
    } catch (e) {
      alert("Import failed: " + e);
    }
  };

  return (
    <div>
      {notice && <p className="mb-4 text-sm text-green-600">{notice}</p>}

      <form onSubmit={submit} className="mb-8 space-y-6 p-6 border rounded-lg bg-blue-50 dark:bg-blue-950">
        <h3 className="text-lg font-semibold mb-4">{editingId ? "Edit Challenge" : "Create New Challenge"}</h3>
        
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input 
              className="w-full rounded-md border px-3 py-2 bg-background text-foreground" 
              placeholder="Enter challenge title" 
              value={form.title} 
              onChange={(e)=>setForm({...form,title:e.target.value})} 
              required
            />
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select 
                className="w-full rounded-md border px-3 py-2 bg-background text-foreground" 
                value={form.category} 
                onChange={(e)=>setForm({...form,category:e.target.value})}
              >
                {categoriesList.map((c)=> <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select 
                className="w-full rounded-md border px-3 py-2 bg-background text-foreground" 
                value={form.difficulty} 
                onChange={(e)=>setForm({...form,difficulty:e.target.value})}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Problem Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Problem Statement</label>
          <textarea 
            className="w-full rounded-md border px-3 py-2 bg-background text-foreground h-24" 
            placeholder="Describe the problem that needs to be solved" 
            value={form.problem} 
            onChange={(e)=>setForm({...form,problem:e.target.value})} 
            required
          />
        </div>
        
        {/* Concept */}
        <div>
          <label className="block text-sm font-medium mb-2">Concept/Learning Objective</label>
          <textarea 
            className="w-full rounded-md border px-3 py-2 bg-background text-foreground h-20" 
            placeholder="What programming concept does this challenge teach?" 
            value={form.concept} 
            onChange={(e)=>setForm({...form,concept:e.target.value})} 
          />
        </div>
        
        {/* Sample Code */}
        <div>
          <label className="block text-sm font-medium mb-2">Sample Code (Java)</label>
          <div className="text-xs text-muted-foreground mb-2">
            This code will be used for comparison in practice mode. Write exact Java code with proper syntax.
          </div>
          <textarea 
            className="w-full rounded-md border px-3 py-2 bg-background text-foreground font-mono text-sm h-40" 
            placeholder={`public class Main {\n    public static void main(String[] args) {\n        // Your solution here\n    }\n}`}
            value={form.sampleCode} 
            onChange={(e)=>setForm({...form,sampleCode:e.target.value})}
            spellCheck={false}
          />
        </div>
        
        {/* Test Cases */}
        <div>
          <label className="block text-sm font-medium mb-2">Test Cases</label>
          <div className="text-xs text-muted-foreground mb-3">
            Define input and expected output for testing the solution
          </div>
          <div className="space-y-3">
            {form.testCases.map((tc, i) => (
              <div key={i} className="p-4 border rounded bg-background">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">Test Case {i + 1}</span>
                  {form.testCases.length > 1 && (
                    <button 
                      type="button" 
                      className="text-red-600 text-xs hover:underline" 
                      onClick={()=>setForm({...form, testCases: form.testCases.filter((_,idx) => idx !== i)})}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Input</label>
                    <input 
                      className="w-full rounded border px-2 py-1 text-sm bg-background" 
                      placeholder="Test input (if any)" 
                      value={tc.input} 
                      onChange={(e)=>setForm({...form, testCases: form.testCases.map((t,idx) => idx === i ? {...t, input: e.target.value} : t)})} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Expected Output</label>
                    <input 
                      className="w-full rounded border px-2 py-1 text-sm bg-background" 
                      placeholder="Expected program output" 
                      value={tc.expectedOutput || ""} 
                      onChange={(e)=>setForm({...form, testCases: form.testCases.map((t,idx) => idx === i ? {...t, expectedOutput: e.target.value} : t)})} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button 
            type="button" 
            className="mt-3 text-sm border rounded px-3 py-2 hover:bg-muted" 
            onClick={()=>setForm({...form, testCases: [...form.testCases, {input: "", expectedOutput: ""}]})}
          >
            + Add Test Case
          </button>
        </div>
        
        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button 
            type="submit" 
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
          >
            {editingId ? "Update Challenge" : "Create Challenge"}
          </button>
          {editingId && (
            <button 
              type="button" 
              className="px-6 py-2 border rounded-md hover:bg-muted" 
              onClick={()=>{
                setEditingId(null); 
                setForm({title:"",problem:"",concept:"",category:"Data Types",difficulty:"Easy",sampleCode:"",testCases:[{input:"",expectedOutput:""}]});
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <div className="rounded-md border p-4 bg-blue-50 dark:bg-blue-950">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Icon icon="mdi:export" className="w-5 h-5" />
            Export Challenges
          </h3>
          <button className="mb-2 rounded-md border px-3 py-2 text-sm flex items-center gap-2" onClick={()=>setExportText(exportCustom())}>
            <Icon icon="mdi:code-json" className="w-4 h-4" />
            Generate JSON
          </button>
          <textarea className="w-full h-32 rounded-md border p-2 font-mono text-xs bg-background text-foreground" value={exportText} readOnly />
        </div>
        <div className="rounded-md border p-4 bg-blue-50 dark:bg-blue-950">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Icon icon="mdi:import" className="w-5 h-5" />
            Import Challenges
          </h3>
          <textarea className="mb-2 w-full h-32 rounded-md border p-2 font-mono text-xs bg-background text-foreground" value={importText} onChange={(e)=>setImportText(e.target.value)} />
          <button className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground flex items-center gap-2" onClick={doImport}>
            <Icon icon="mdi:upload" className="w-4 h-4" />
            Import
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Icon icon="mdi:folder-multiple" className="w-5 h-5" />
          Categories
        </h3>
        <ul className="mb-4 divide-y rounded-md border bg-blue-50 dark:bg-blue-950">
          {categoriesList.map((c) => (
            <li key={c.key} className="p-3 flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium">{c.label}</div>
                <div className="text-xs text-muted-foreground">{c.key}</div>
              </div>
              <button
                className="text-red-600 hover:underline text-sm"
                onClick={() => {
                  if (confirm(`Delete category: ${c.label}?`)) {
                    removeCategory(c.key);
                    setVersion((v) => v + 1);
                    setNotice(`Deleted category: ${c.label}`);
                  }
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <div className="grid gap-2 sm:grid-cols-4">
          <input id="cat-key" className="rounded-md border px-3 py-2 bg-background text-foreground" placeholder="Key" />
          <input id="cat-label" className="rounded-md border px-3 py-2 bg-background text-foreground" placeholder="Label" />
          <input id="cat-desc" className="rounded-md border px-3 py-2 bg-background text-foreground" placeholder="Description" />
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => {
              const key = (document.getElementById("cat-key") as HTMLInputElement)?.value.trim();
              const label = (document.getElementById("cat-label") as HTMLInputElement)?.value.trim();
              const desc = (document.getElementById("cat-desc") as HTMLInputElement)?.value.trim();
              if (!key) return alert("Key is required");
              addCategory({ key, label, description: desc });
              setNotice(`Added category: ${label || key}`);
              setVersion((v) => v + 1);
            }}
          >
            Add Category
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold">All Challenges</h3>
            {selectedChallenges.length > 0 && (
              <button
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                onClick={async () => {
                  if (confirm(`Delete ${selectedChallenges.length} selected challenges?`)) {
                    let successCount = 0;
                    for (const id of selectedChallenges) {
                      const success = await deleteChallengeFromDB(id);
                      if (success) {
                        successCount++;
                        // Remove from local state immediately
                        setDbChallenges(prev => prev.filter(c => c.id !== id));
                      }
                    }
                    setNotice(`Deleted ${successCount} challenges`);
                    setSelectedChallenges([]);
                    setSelectAll(false);
                    await loadChallenges();
                  }
                }}
              >
                <Icon icon="mdi:delete" className="w-4 h-4" />
                Delete Selected ({selectedChallenges.length})
              </button>
            )}
          </div>
          <div className="relative w-64">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-md border px-3 py-2 pl-10 text-sm bg-background w-full"
            />
          </div>
        </div>
        <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => {
              const checked = e.target.checked;
              setSelectAll(checked);
              if (checked) {
                const filteredChallenges = (dbChallenges.length > 0 ? dbChallenges : allChallenges())
                  .filter(c => 
                    searchTerm === "" || 
                    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                setSelectedChallenges(filteredChallenges.map(c => c.id));
              } else {
                setSelectedChallenges([]);
              }
            }}
            className="rounded"
          />
          <span className="text-sm font-medium">Select All</span>
          {selectedChallenges.length > 0 && (
            <span className="text-xs text-muted-foreground">({selectedChallenges.length} selected)</span>
          )}
        </div>
        <ul className="divide-y rounded-md border bg-blue-50 dark:bg-blue-950">
          {dbChallenges
            .filter(c => 
              searchTerm === "" || 
              c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
              c.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((c, index) => (
            <li key={`${c.id}-${index}`} className="p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedChallenges.includes(c.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedChallenges([...selectedChallenges, c.id]);
                    } else {
                      setSelectedChallenges(selectedChallenges.filter(id => id !== c.id));
                      setSelectAll(false);
                    }
                  }}
                  className="rounded"
                />
                <div>
                  <div className="text-sm font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.category} • {c.difficulty} {c.testCases && c.testCases.length > 0 ? `• ${c.testCases.length} test cases` : "• No test cases"}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                  onClick={() => {
                    setForm({
                      title: c.title, 
                      problem: c.problem, 
                      concept: c.concept, 
                      category: c.category, 
                      difficulty: c.difficulty, 
                      sampleCode: c.sampleCode || "", 
                      testCases: c.testCases || [{input:"",expectedOutput:""}]
                    });
                    setEditingId(c.id);
                    window.scrollTo({top: 0, behavior: 'smooth'});
                  }}
                >
                  <Icon icon="mdi:pencil" className="w-3 h-3" />
                  Edit
                </button>
                <button
                  className="text-red-600 hover:underline text-sm flex items-center gap-1"
                  onClick={async () => {
                    if (confirm(`Delete challenge: ${c.title}?`)) {
                      const success = await deleteChallengeFromDB(c.id);
                      if (success) {
                        setDbChallenges(prev => prev.filter(ch => ch.id !== c.id));
                        setNotice(`Deleted: ${c.title}`);
                      } else {
                        removeChallenge(c.id);
                        setVersion((v) => v + 1);
                        setNotice(`Deleted: ${c.title}`);
                      }
                    }
                  }}
                >
                  <Icon icon="mdi:delete" className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AdminHeader() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(getUser());
  const [adminData, setAdminData] = useState(getAdminData());
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Listen for storage changes to update states
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getUser());
      setAdminData(getAdminData());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!adminData) {
      alert('Admin not logged in');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const success = await updateAdminProfilePhoto(base64);
        if (success) {
          setAdminData(getAdminData()); // Refresh admin state
          alert('Admin profile photo updated successfully!');
        } else {
          alert('Failed to update admin profile photo');
        }
      } catch (error) {
        console.error('Admin photo upload error:', error);
        alert('Error uploading photo. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setShowDropdown(false);
    // Redirect to home page
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative">
            <Icon icon="vscode-icons:file-type-java" className="w-8 h-8" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <Icon icon="mdi:star" className="w-2 h-2 text-white" />
            </div>
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">JavaRanker</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
          >
            <Icon icon="mdi:home" className="w-4 h-4" />
            Home
          </Link>
          <Link
            to="/blogs"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
          >
            <Icon icon="mdi:post" className="w-4 h-4" />
            Blogs
          </Link>
          <Link
            to="/about"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
          >
            <Icon icon="mdi:information" className="w-4 h-4" />
            About
          </Link>

          <button
            onClick={toggleTheme}
            className="ml-2 inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
          >
            <Icon icon={theme === "dark" ? "mdi:weather-sunny" : "mdi:weather-night"} className="w-4 h-4" />
          </button>
          <div className="ml-2 relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold cursor-pointer hover:opacity-80"
            >
              {adminData?.profilePhoto ? (
                <img src={adminData.profilePhoto} alt="Admin Profile" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <Icon icon="mdi:shield-account" className="w-4 h-4" />
              )}
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-md border bg-background shadow-lg z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-sm font-medium">{adminData?.username || 'Admin'}</div>
                  <label className="block px-3 py-2 text-sm hover:bg-muted cursor-pointer rounded">
                    Update Admin Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <button 
                    onClick={() => { toggleTheme(); setShowDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded"
                  >
                    Change Theme
                  </button>
                  <button 
                    onClick={() => {
                      logoutAdmin();
                      setAdminData(null);
                      window.location.href = '/';
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded text-red-600"
                  >
                    Logout Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function AdminAnalytics() {
  const [systemStats, setSystemStats] = useState<any>(null);
  const [userStats, setUserStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemAnalytics();
  }, []);

  const loadSystemAnalytics = async () => {
    try {
      // Get system-wide analytics
      const csrfRes = await fetch('/api/csrf-token');
      const csrfData = await csrfRes.json();
      
      const res = await fetch('/api/analytics/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setSystemStats(data.systemStats);
        setUserStats(data.topUsers || []);
      }
    } catch (e) {
      console.error('Failed to load system analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Icon icon="mdi:chart-box" className="w-6 h-6 text-blue-500" />
          System Analytics
        </h2>
        <button
          onClick={loadSystemAnalytics}
          className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 flex items-center gap-2"
        >
          <Icon icon="mdi:refresh" className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {systemStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-md border p-4 bg-gradient-to-br from-background to-muted/20">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Total Users</div>
              <Icon icon="mdi:account-group" className="w-5 h-5 text-blue-500" />
            </div>
            <div className="mt-1 text-2xl font-bold">{systemStats.totalUsers || 0}</div>
          </div>
          <div className="rounded-md border p-4 bg-gradient-to-br from-background to-muted/20">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Active Users (7d)</div>
              <Icon icon="mdi:account-check" className="w-5 h-5 text-green-500" />
            </div>
            <div className="mt-1 text-2xl font-bold">{systemStats.activeUsers || 0}</div>
          </div>
          <div className="rounded-md border p-4 bg-gradient-to-br from-background to-muted/20">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Total Submissions</div>
              <Icon icon="mdi:code-braces" className="w-5 h-5 text-purple-500" />
            </div>
            <div className="mt-1 text-2xl font-bold">{systemStats.totalSubmissions || 0}</div>
          </div>
          <div className="rounded-md border p-4 bg-gradient-to-br from-background to-muted/20">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Success Rate</div>
              <Icon icon="mdi:check-circle" className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="mt-1 text-2xl font-bold">{systemStats.successRate || 0}%</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-md border p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Icon icon="mdi:trophy" className="w-5 h-5 text-yellow-500" />
            Top Performers
          </h3>
          <div className="space-y-3">
            {userStats && userStats.length > 0 ? userStats.slice(0, 10).map((user, index) => (
              <div key={user.username} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-medium">{user.username}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {user.challengesSolved} solved • {user.successRate}% success
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <Icon icon="mdi:account-off" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No user activity yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-md border p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Icon icon="mdi:chart-pie" className="w-5 h-5 text-indigo-500" />
            Challenge Categories
          </h3>
          <div className="space-y-2">
            {systemStats?.categoryStats?.map((cat: any) => (
              <div key={cat.category} className="flex items-center justify-between">
                <span className="text-sm">{cat.category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(cat.attempts / (systemStats.totalSubmissions || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12">{cat.attempts}</span>
                </div>
              </div>
            )) || []}
          </div>
        </div>
      </div>
    </div>
  );
}

function BlogManagement() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [blogForm, setBlogForm] = useState({ title: "", content: "", author: "JavaRanker Team", published: false });
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'markdown' | 'rich' | 'html'>('markdown');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFont, setSelectedFont] = useState('default');

  const fontOptions = {
    default: { name: 'Default', family: 'system-ui, -apple-system, sans-serif' },
    inter: { name: 'Inter', family: 'Inter, sans-serif' },
    roboto: { name: 'Roboto', family: 'Roboto, sans-serif' },
    opensans: { name: 'Open Sans', family: 'Open Sans, sans-serif' },
    lato: { name: 'Lato', family: 'Lato, sans-serif' },
    poppins: { name: 'Poppins', family: 'Poppins, sans-serif' },
    nunito: { name: 'Nunito', family: 'Nunito, sans-serif' },
    playfair: { name: 'Playfair Display', family: 'Playfair Display, serif' },
    merriweather: { name: 'Merriweather', family: 'Merriweather, serif' },
    crimson: { name: 'Crimson Text', family: 'Crimson Text, serif' },
    sourceserif: { name: 'Source Serif Pro', family: 'Source Serif Pro, serif' },
    fira: { name: 'Fira Code', family: 'Fira Code, monospace' },
    jetbrains: { name: 'JetBrains Mono', family: 'JetBrains Mono, monospace' },
    sourcecodepro: { name: 'Source Code Pro', family: 'Source Code Pro, monospace' }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const response = await fetch("/api/blogs/admin/all");
      const data = await response.json();
      setBlogs(data.blogs || []);
    } catch (error) {
      // Failed to load blogs
    }
  };

  const submitBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get CSRF token
      const csrfRes = await fetch("/api/csrf-token");
      const csrfData = await csrfRes.json();
      
      const url = editingBlogId ? `/api/blogs/admin/${editingBlogId}` : "/api/blogs/admin";
      const method = editingBlogId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfData.csrfToken
        },
        body: JSON.stringify(blogForm)
      });

      if (response.ok) {
        setNotice(editingBlogId ? "Blog updated" : "Blog created");
        setBlogForm({ title: "", content: "", author: "JavaRanker Team", published: false });
        setEditingBlogId(null);
        loadBlogs();
      }
    } catch (error) {
      setNotice("Failed to save blog");
      console.error("Blog save error:", error);
    }
  };

  const deleteBlog = async (id: number, title: string) => {
    if (confirm(`Delete blog: ${title}?`)) {
      try {
        // Get CSRF token
        const csrfRes = await fetch("/api/csrf-token");
        const csrfData = await csrfRes.json();
        
        const response = await fetch(`/api/blogs/admin/${id}`, { 
          method: "DELETE",
          headers: {
            "X-CSRF-Token": csrfData.csrfToken
          }
        });
        if (response.ok) {
          setNotice("Blog deleted");
          loadBlogs();
        }
      } catch (error) {
        setNotice("Failed to delete blog");
        console.error("Blog delete error:", error);
      }
    }
  };

  const insertTemplate = (template: string) => {
    const templates = {
      tutorial: `# Tutorial Title

## Introduction
Brief introduction to the topic.

## Prerequisites
- Basic Java knowledge
- Development environment setup

## Step 1: Getting Started
Explain the first step.

\`\`\`java
public class Example {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
\`\`\`

## Step 2: Implementation
Continue with implementation details.

## Conclusion
Summarize what was learned.`,
      
      comparison: `# Technology A vs Technology B: Complete Comparison

## Overview
Brief overview of both technologies.

## Performance Comparison
### Technology A
- **Pros**: List advantages
- **Cons**: List disadvantages

### Technology B
- **Pros**: List advantages  
- **Cons**: List disadvantages

## Use Cases
**Choose Technology A when:**
- Specific scenario 1
- Specific scenario 2

**Choose Technology B when:**
- Specific scenario 1
- Specific scenario 2

## Conclusion
Final recommendation based on analysis.`,

      interview: `# Top Interview Questions: [Topic]

## Question 1: [Question Title]
**Answer:**
Detailed explanation with examples.

\`\`\`java
// Code example
public class Example {
    // Implementation
}
\`\`\`

## Question 2: [Question Title]
**Answer:**
Detailed explanation.

### Key Points:
- Important point 1
- Important point 2
- Important point 3

## Preparation Tips
1. Practice coding problems
2. Review core concepts
3. Mock interviews`
    };
    setBlogForm({...blogForm, content: templates[template as keyof typeof templates] || ''});
  };

  const insertFormatting = (format: string) => {
    const textarea = document.getElementById('blog-content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = blogForm.content.substring(start, end);
    
    let replacement = '';
    switch (format) {
      case 'bold': replacement = `**${selectedText || 'bold text'}**`; break;
      case 'italic': replacement = `*${selectedText || 'italic text'}*`; break;
      case 'underline': replacement = `<u>${selectedText || 'underlined text'}</u>`; break;
      case 'strikethrough': replacement = `~~${selectedText || 'strikethrough text'}~~`; break;
      case 'highlight': replacement = `==${selectedText || 'highlighted text'}==`; break;
      case 'code': replacement = `\`${selectedText || 'code'}\``; break;
      case 'codeblock': replacement = `\`\`\`java\n${selectedText || '// Your Java code here'}\n\`\`\``; break;
      case 'h1': replacement = `# ${selectedText || 'Heading 1'}`; break;
      case 'h2': replacement = `## ${selectedText || 'Heading 2'}`; break;
      case 'h3': replacement = `### ${selectedText || 'Heading 3'}`; break;
      case 'h4': replacement = `#### ${selectedText || 'Heading 4'}`; break;
      case 'list': replacement = `- ${selectedText || 'List item'}`; break;
      case 'numberlist': replacement = `1. ${selectedText || 'Numbered item'}`; break;
      case 'checklist': replacement = `- [ ] ${selectedText || 'Task item'}`; break;
      case 'quote': replacement = `> ${selectedText || 'Quote text'}`; break;
      case 'divider': replacement = `\n---\n`; break;
      case 'link': replacement = `[${selectedText || 'link text'}](url)`; break;
      case 'image': replacement = `![${selectedText || 'alt text'}](image-url)`; break;
      case 'table': replacement = `\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n`; break;
      case 'callout-info': replacement = `\n> **ℹ️ Info**\n> ${selectedText || 'Information message'}\n`; break;
      case 'callout-warning': replacement = `\n> **⚠️ Warning**\n> ${selectedText || 'Warning message'}\n`; break;
      case 'callout-success': replacement = `\n> **✅ Success**\n> ${selectedText || 'Success message'}\n`; break;
      case 'callout-error': replacement = `\n> **❌ Error**\n> ${selectedText || 'Error message'}\n`; break;
      case 'font': {
        const fontFamily = fontOptions[selectedFont as keyof typeof fontOptions].family;
        replacement = `<span style="font-family: ${fontFamily}">${selectedText || 'styled text'}</span>`;
        break;
      }
    }
    
    const newContent = blogForm.content.substring(0, start) + replacement + blogForm.content.substring(end);
    setBlogForm({...blogForm, content: newContent});
  };

  return (
    <div>
      {notice && <p className="mb-4 text-sm text-green-600">{notice}</p>}
      <form onSubmit={submitBlog} className="mb-8 space-y-4 p-6 border rounded-lg bg-blue-50 dark:bg-blue-950">
        <div className="grid gap-4 sm:grid-cols-2">
          <input 
            className="w-full rounded-md border px-3 py-2 bg-background text-foreground" 
            placeholder="Blog Title" 
            value={blogForm.title} 
            onChange={(e) => setBlogForm({...blogForm, title: e.target.value})} 
            required 
          />
          <input 
            className="w-full rounded-md border px-3 py-2 bg-background text-foreground" 
            placeholder="Author" 
            value={blogForm.author} 
            onChange={(e) => setBlogForm({...blogForm, author: e.target.value})} 
            required 
          />
        </div>

        {/* Editor Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Mode:</span>
            <div className="flex gap-1">
              {(['markdown', 'rich', 'html'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  className={`px-2 py-1 text-xs rounded ${
                    editorMode === mode 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setEditorMode(mode)}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Font:</span>
            <select 
              value={selectedFont} 
              onChange={(e) => setSelectedFont(e.target.value)}
              className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 border-0 text-gray-800 dark:text-gray-200"
            >
              {Object.entries(fontOptions).map(([key, font]) => (
                <option key={key} value={key}>{font.name}</option>
              ))}
            </select>
          </div>
          
          <button
            type="button"
            className="ml-auto px-3 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        {/* Template Buttons */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-foreground">Templates:</span>
          <button type="button" className="px-2 py-1 text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-700 rounded" onClick={() => insertTemplate('tutorial')}>Tutorial</button>
          <button type="button" className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-700 rounded" onClick={() => insertTemplate('comparison')}>Comparison</button>
          <button type="button" className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 hover:bg-purple-200 dark:hover:bg-purple-700 rounded" onClick={() => insertTemplate('interview')}>Interview Q&A</button>
        </div>

        {/* Enhanced Formatting Toolbar */}
        <div className="space-y-2">
          {/* Text Formatting */}
          <div className="flex flex-wrap gap-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2 py-1">Text:</span>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('bold')} title="Bold">
              <Icon icon="mdi:format-bold" className="w-4 h-4" />
            </button>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('italic')} title="Italic">
              <Icon icon="mdi:format-italic" className="w-4 h-4" />
            </button>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('underline')} title="Underline">
              <Icon icon="mdi:format-underline" className="w-4 h-4" />
            </button>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('strikethrough')} title="Strikethrough">
              <Icon icon="mdi:format-strikethrough" className="w-4 h-4" />
            </button>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('highlight')} title="Highlight">
              <Icon icon="mdi:marker" className="w-4 h-4" />
            </button>
          </div>
          
          {/* Headings */}
          <div className="flex flex-wrap gap-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2 py-1">Headings:</span>
            <button type="button" className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs font-bold" onClick={() => insertFormatting('h1')} title="Heading 1">
              H1
            </button>
            <button type="button" className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs font-bold" onClick={() => insertFormatting('h2')} title="Heading 2">
              H2
            </button>
            <button type="button" className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs font-bold" onClick={() => insertFormatting('h3')} title="Heading 3">
              H3
            </button>
            <button type="button" className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs font-bold" onClick={() => insertFormatting('h4')} title="Heading 4">
              H4
            </button>
          </div>
          
          {/* Lists & Structure */}
          <div className="flex flex-wrap gap-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2 py-1">Lists:</span>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('list')} title="Bullet List">
              <Icon icon="mdi:format-list-bulleted" className="w-4 h-4" />
            </button>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('numberlist')} title="Numbered List">
              <Icon icon="mdi:format-list-numbered" className="w-4 h-4" />
            </button>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('checklist')} title="Checklist">
              <Icon icon="mdi:format-list-checks" className="w-4 h-4" />
            </button>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('quote')} title="Quote">
              <Icon icon="mdi:format-quote-close" className="w-4 h-4" />
            </button>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('divider')} title="Divider">
              <Icon icon="mdi:minus" className="w-4 h-4" />
            </button>
          </div>
          
          {/* Code & Media */}
          <div className="flex flex-wrap gap-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2 py-1">Code & Media:</span>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('code')} title="Inline Code">
              <Icon icon="mdi:code-tags" className="w-4 h-4" />
            </button>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('codeblock')} title="Code Block">
              <Icon icon="mdi:code-braces" className="w-4 h-4" />
            </button>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('link')} title="Link">
              <Icon icon="mdi:link" className="w-4 h-4" />
            </button>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('image')} title="Image">
              <Icon icon="mdi:image" className="w-4 h-4" />
            </button>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('table')} title="Table">
              <Icon icon="mdi:table" className="w-4 h-4" />
            </button>
          </div>
          
          {/* Special Elements */}
          <div className="flex flex-wrap gap-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2 py-1">Special:</span>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('callout-info')} title="Info Callout">
              <Icon icon="mdi:information" className="w-4 h-4 text-blue-500" />
            </button>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('callout-warning')} title="Warning Callout">
              <Icon icon="mdi:alert" className="w-4 h-4 text-yellow-500" />
            </button>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('callout-success')} title="Success Callout">
              <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-500" />
            </button>
            <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => insertFormatting('callout-error')} title="Error Callout">
              <Icon icon="mdi:alert-circle" className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {/* Content Editor */}
        <div className={`grid gap-4 ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div>
            <textarea 
              id="blog-content"
              className="w-full h-96 rounded-md border px-3 py-2 bg-background text-foreground text-sm" 
              placeholder={`Blog Content (${editorMode} format)\n\nTip: Use templates above or formatting toolbar for quick styling`}
              value={blogForm.content} 
              onChange={(e) => setBlogForm({...blogForm, content: e.target.value})} 
              style={{ fontFamily: fontOptions[selectedFont as keyof typeof fontOptions].family }}
              required 
            />
          </div>
          {showPreview && (
            <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-white dark:bg-gray-900 overflow-auto h-96">
              <h4 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">Preview:</h4>
              <div className="prose prose-sm prose-gray dark:prose-invert max-w-none text-gray-900 dark:text-gray-100">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: blogForm.content
                      .replace(/^#### (.*$)/gm, '<h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2">$1</h4>')
                      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2">$1</h3>')
                      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-6 mb-3">$1</h2>')
                      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-6 mb-4">$1</h1>')
                      .replace(/```java\n([\s\S]*?)\n```/g, '<pre class="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded border dark:border-gray-700 overflow-x-auto"><code class="language-java">$1</code></pre>')
                      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-gray-100">$1</strong>')
                      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')
                      .replace(/~~(.*?)~~/g, '<del class="line-through text-gray-600 dark:text-gray-400">$1</del>')
                      .replace(/==(.*?)==/g, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>')
                      .replace(/<u>(.*?)<\/u>/g, '<u class="underline">$1</u>')
                      .replace(/^\d+\. (.*$)/gm, '<li class="text-gray-700 dark:text-gray-300 ml-4">$1</li>')
                      .replace(/^- \[ \] (.*$)/gm, '<li class="text-gray-700 dark:text-gray-300 ml-4"><input type="checkbox" disabled class="mr-2">$1</li>')
                      .replace(/^- \[x\] (.*$)/gm, '<li class="text-gray-700 dark:text-gray-300 ml-4"><input type="checkbox" checked disabled class="mr-2">$1</li>')
                      .replace(/^- (.*$)/gm, '<li class="text-gray-700 dark:text-gray-300 ml-4 list-disc">$1</li>')
                      .replace(/^> \*\*(.*?)\*\*\n> (.*$)/gm, '<div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900 p-3 my-3 rounded-r"><div class="font-semibold text-blue-800 dark:text-blue-200">$1</div><div class="text-blue-700 dark:text-blue-300">$2</div></div>')
                      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-2">$1</blockquote>')
                      .replace(/^---$/gm, '<hr class="border-gray-300 dark:border-gray-600 my-4">')
                      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>')
                      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded border dark:border-gray-700 my-2">')
                      .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">$1</ul>')
                      .split('\n\n').map(p => p.trim() && !p.includes('<') ? `<p class="text-gray-700 dark:text-gray-300 mb-3">${p}</p>` : p).join('\n\n')
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={blogForm.published} 
              onChange={(e) => setBlogForm({...blogForm, published: e.target.checked})} 
            />
            <span className="text-sm text-foreground">Published</span>
          </label>
          <div className="flex gap-2">
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
              {editingBlogId ? "Update Blog" : "Create Blog"}
            </button>
            {editingBlogId && (
              <button 
                type="button" 
                className="rounded-md border px-4 py-2" 
                onClick={() => {
                  setEditingBlogId(null);
                  setBlogForm({ title: "", content: "", author: "JavaRanker Team", published: false });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="font-medium mb-3">All Blogs</h3>
        <ul className="divide-y rounded-md border bg-blue-50 dark:bg-blue-950">
          {blogs.map((blog) => (
            <li key={blog.id} className="p-3 flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium">{blog.title}</div>
                <div className="text-xs text-muted-foreground">
                  {blog.author} • {new Date(blog.created_at).toLocaleDateString()} • 
                  {blog.published ? "Published" : "Draft"}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="text-blue-600 hover:underline text-sm"
                  onClick={() => {
                    setBlogForm({
                      title: blog.title,
                      content: blog.content,
                      author: blog.author,
                      published: blog.published
                    });
                    setEditingBlogId(blog.id);
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:underline text-sm"
                  onClick={() => deleteBlog(blog.id, blog.title)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
