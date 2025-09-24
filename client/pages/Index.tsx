import Layout from "@/components/layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Code2, Zap, Trophy, Target, BookOpen, Rocket } from "lucide-react";
import { getUser } from "@/lib/auth";
import TypingEffect from "@/components/TypingEffect";
import { useState, useEffect } from "react";
import { fetchChallengesFromDB } from "@/data/challenges";

export default function Index() {
  const user = getUser();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  useEffect(() => {
    const loadChallenges = async () => {
      const challengesList = await fetchChallengesFromDB();
      setChallenges(challengesList);
    };
    loadChallenges();
  }, []);
  
  const categories = [...new Set(challenges.map(c => c.category))];
  
  const toggleChallenge = (challengeId: string) => {
    setSelectedChallenges(prev => 
      prev.includes(challengeId) 
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };
  
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };
  
  const startPracticeMode = () => {
    if (selectedChallenges.length === 0 && selectedCategories.length === 0) {
      alert('Please select at least one challenge or category');
      return;
    }
    
    localStorage.setItem('practiceSelection', JSON.stringify({
      challenges: selectedChallenges,
      categories: selectedCategories
    }));
    
    navigate('/practice-mode');
  };

  return (
    <Layout>
      <section className="grid gap-8 grid-cols-1 lg:grid-cols-2 items-center min-h-[60vh]">
        <div>
          <div className="inline-flex items-center rounded-full bg-muted px-4 py-2 text-sm font-medium gap-2">
            <Icon icon="vscode-icons:file-type-java" className="w-5 h-5" />
            Java-only coding challenges
          </div>
          <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight">
            Master Java fundamentals through hands-on coding challenges
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Build your programming skills with curated Java challenges designed for learning and growth.
          </p>

          <div className="mt-8 flex gap-4">
            <Link to="/challenges" className="btn-primary inline-flex items-center rounded-md px-6 py-3 font-medium gap-2">
              <Rocket className="w-4 h-4" />
              Browse Challenges
            </Link>
            <button 
              onClick={() => setShowPracticeModal(true)}
              className="inline-flex items-center rounded-md border px-6 py-3 font-medium hover:bg-accent gap-2 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Practice Mode
            </button>
          </div>
        </div>
        
        <div className="hidden lg:flex justify-center items-center min-h-[300px]">
          <TypingEffect />
        </div>
      </section>

      <section className="mt-12 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Coding?</h2>
          <p className="text-muted-foreground mb-8">
            Explore our collection of Java challenges and improve your programming skills.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/challenges" className="btn-primary inline-flex items-center rounded-md px-6 py-3 font-medium gap-2">
              <Rocket className="w-4 h-4" />
              Browse All Challenges
            </Link>
            {!user && (
              <Link to="/login" className="inline-flex items-center rounded-md border px-6 py-3 font-medium hover:bg-accent gap-2 transition-colors">
                <Icon icon="mdi:login" className="w-4 h-4" />
                Login to Get Started
              </Link>
            )}
          </div>
        </div>
      </section>
      
      {/* Practice Mode Selection Modal */}
      {showPracticeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Select Practice Challenges</h2>
              <button 
                onClick={() => setShowPracticeModal(false)}
                className="p-2 hover:bg-accent rounded"
              >
                <Icon icon="mdi:close" className="w-5 h-5" />
              </button>
            </div>
            
            {/* Category Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Select by Category</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-2 rounded border transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-accent'
                    }`}
                  >
                    {category} ({challenges.filter(c => c.category === category).length})
                  </button>
                ))}
              </div>
            </div>
            
            {/* Individual Challenge Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Select Individual Challenges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-auto">
                {challenges.map(challenge => (
                  <div
                    key={challenge.id}
                    onClick={() => toggleChallenge(challenge.id)}
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      selectedChallenges.includes(challenge.id)
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedChallenges.includes(challenge.id)}
                        onChange={() => toggleChallenge(challenge.id)}
                        className="rounded"
                      />
                      <span className="text-xs bg-muted px-2 py-1 rounded">{challenge.category}</span>
                    </div>
                    <h4 className="font-medium text-sm">{challenge.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{challenge.difficulty}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Selection Summary */}
            <div className="mb-6 p-4 bg-muted/50 rounded">
              <div className="text-sm">
                <strong>Selected:</strong> {selectedChallenges.length} individual challenges, {selectedCategories.length} categories
                {selectedCategories.length > 0 && (
                  <span className="ml-2">({selectedCategories.reduce((acc, cat) => acc + challenges.filter(c => c.category === cat).length, 0)} challenges from categories)</span>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowPracticeModal(false)}
                className="px-4 py-2 border rounded hover:bg-accent"
              >
                Cancel
              </button>
              <button 
                onClick={startPracticeMode}
                className="btn-primary"
                disabled={selectedChallenges.length === 0 && selectedCategories.length === 0}
              >
                Start Practice ({selectedChallenges.length + selectedCategories.reduce((acc, cat) => acc + challenges.filter(c => c.category === cat && !selectedChallenges.includes(c.id)).length, 0)} challenges)
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
