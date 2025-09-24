import Layout from "@/components/layout/Layout";
import { fetchChallengesFromDB } from "@/data/challenges";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Play, ArrowLeft, Shuffle } from "lucide-react";
import { useState, useEffect } from "react";

export default function PracticeMode() {
  const navigate = useNavigate();
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [practiceList, setPracticeList] = useState<any[]>([]);
  const [allChallenges, setAllChallenges] = useState<any[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPracticeData = async () => {
      try {
        const challenges = await fetchChallengesFromDB();
        const uniqueCategories = [...new Set(challenges.map(c => c.category))];
        setAllChallenges(challenges);
        setCategories(uniqueCategories);
        setPracticeList(challenges);
        setSelectedChallenges(challenges.map(c => c.id));
        setSelectedCategories(uniqueCategories);
      } catch (error) {
        console.error('Failed to load challenges:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPracticeData();
  }, []);

  const updatePracticeList = (challengeIds: string[], categoryNames: string[]) => {
    const fromChallenges = allChallenges.filter(c => challengeIds.includes(c.id));
    const fromCategories = allChallenges.filter(c => 
      categoryNames.includes(c.category) && !challengeIds.includes(c.id)
    );
    const newPracticeList = [...fromChallenges, ...fromCategories];
    setPracticeList(newPracticeList);
    setCurrentChallengeIndex(0);
  };

  const toggleChallenge = (challengeId: string) => {
    setSelectedChallenges(prev => {
      const newSelected = prev.includes(challengeId) 
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId];
      updatePracticeList(newSelected, selectedCategories);
      return newSelected;
    });
  };

  const toggleCategory = (categoryName: string) => {
    const categoryChallenge = allChallenges.filter(c => c.category === categoryName);
    const categoryIds = categoryChallenge.map(c => c.id);
    
    setSelectedCategories(prev => {
      const isSelected = prev.includes(categoryName);
      const newSelected = isSelected
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName];
      
      // Update individual challenges based on category selection
      setSelectedChallenges(prevChallenges => {
        if (isSelected) {
          // Remove all challenges from this category
          return prevChallenges.filter(id => !categoryIds.includes(id));
        } else {
          // Add all challenges from this category
          const newChallenges = [...new Set([...prevChallenges, ...categoryIds])];
          updatePracticeList(newChallenges, newSelected);
          return newChallenges;
        }
      });
      
      updatePracticeList(selectedChallenges, newSelected);
      return newSelected;
    });
  };

  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName]
    );
  };

  const isCategoryFullySelected = (categoryName: string) => {
    const categoryChallenge = allChallenges.filter(c => c.category === categoryName);
    return categoryChallenge.every(c => selectedChallenges.includes(c.id));
  };

  const isCategoryPartiallySelected = (categoryName: string) => {
    const categoryChallenge = allChallenges.filter(c => c.category === categoryName);
    return categoryChallenge.some(c => selectedChallenges.includes(c.id)) && !isCategoryFullySelected(categoryName);
  };

  const selectAllChallenges = () => {
    const allIds = allChallenges.map(c => c.id);
    setSelectedChallenges(allIds);
    setSelectedCategories([]);
    setPracticeList(allChallenges);
    setCurrentChallengeIndex(0);
  };

  const selectAllCategories = () => {
    setSelectedCategories([...categories]);
    setSelectedChallenges([]);
    setPracticeList(allChallenges);
    setCurrentChallengeIndex(0);
  };

  const clearAll = () => {
    setSelectedChallenges([]);
    setSelectedCategories([]);
    setPracticeList([]);
    setCurrentChallengeIndex(0);
  };

  const shuffleChallenges = () => {
    const shuffled = [...practiceList].sort(() => Math.random() - 0.5);
    setPracticeList(shuffled);
    setCurrentChallengeIndex(0);
    setIsShuffled(true);
  };

  const startPractice = () => {
    if (practiceList.length > 0) {
      navigate(`/practice-coding/${practiceList[currentChallengeIndex].id}`);
    }
  };

  const nextChallenge = () => {
    if (currentChallengeIndex < practiceList.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1);
    }
  };

  const prevChallenge = () => {
    if (currentChallengeIndex > 0) {
      setCurrentChallengeIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Loading Practice Mode...</h1>
        </div>
      </Layout>
    );
  }

  if (allChallenges.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">No Challenges Available</h1>
          <p className="text-muted-foreground mb-6">No challenges found in the database.</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </Layout>
    );
  }

  const currentChallenge = practiceList[currentChallengeIndex];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={shuffleChallenges}
              className="inline-flex items-center gap-2 px-3 py-2 border rounded hover:bg-accent"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Practice Mode</h1>
          <p className="text-muted-foreground">
            {practiceList.length > 0 ? `Challenge ${currentChallengeIndex + 1} of ${practiceList.length}` : 'Select challenges to practice'}
            {isShuffled && <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">Shuffled</span>}
          </p>
        </div>

        <div className="mb-6 p-4 bg-muted/20 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Select Practice Set ({practiceList.length} challenges)</h2>
            <div className="flex gap-2">
              <button 
                onClick={selectAllChallenges}
                className="text-xs px-3 py-1 border rounded hover:bg-accent"
              >
                All Challenges
              </button>
              <button 
                onClick={selectAllCategories}
                className="text-xs px-3 py-1 border rounded hover:bg-accent"
              >
                All Categories
              </button>
              <button 
                onClick={clearAll}
                className="text-xs px-3 py-1 border rounded hover:bg-accent"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Select by Category</h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const categoryChallenge = allChallenges.filter(c => c.category === category);
                const isExpanded = expandedCategories.includes(category);
                const isFullySelected = isCategoryFullySelected(category);
                const isPartiallySelected = isCategoryPartiallySelected(category);
                
                return (
                  <div key={category} className="border rounded">
                    <div className="flex items-center gap-2 p-3 bg-muted/10">
                      <input 
                        type="checkbox" 
                        checked={isFullySelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isPartiallySelected;
                        }}
                        onChange={() => toggleCategory(category)}
                        className="w-4 h-4"
                      />
                      <button
                        onClick={() => toggleCategoryExpansion(category)}
                        className="flex-1 flex items-center justify-between text-left hover:bg-accent/50 p-1 rounded"
                      >
                        <div>
                          <div className="text-sm font-medium">{category}</div>
                          <div className="text-xs text-muted-foreground">
                            {categoryChallenge.filter(c => selectedChallenges.includes(c.id)).length}/{categoryChallenge.length} selected
                          </div>
                        </div>
                        <Icon 
                          icon={isExpanded ? "mdi:chevron-up" : "mdi:chevron-down"} 
                          className="w-4 h-4"
                        />
                      </button>
                    </div>
                    
                    {isExpanded && (
                      <div className="p-2 border-t bg-background">
                        <div className="grid gap-1 grid-cols-1">
                          {categoryChallenge.map((challenge) => (
                            <label 
                              key={challenge.id}
                              className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent text-sm"
                            >
                              <input 
                                type="checkbox" 
                                checked={selectedChallenges.includes(challenge.id)}
                                onChange={() => toggleChallenge(challenge.id)}
                                className="w-3 h-3"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{challenge.title}</div>
                                <div className="text-xs text-muted-foreground truncate">{challenge.problem}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {practiceList.length > 0 && (
          <div className="bg-card border rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs rounded-full bg-muted px-3 py-1 font-medium">
                  {currentChallenge.category}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {currentChallenge.difficulty}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                ID: {currentChallenge.id}
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">{currentChallenge.title}</h2>
            <p className="text-muted-foreground mb-6">{currentChallenge.problem}</p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button 
                  onClick={prevChallenge}
                  disabled={currentChallengeIndex === 0}
                  className="px-4 py-2 border rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button 
                  onClick={nextChallenge}
                  disabled={currentChallengeIndex === practiceList.length - 1}
                  className="px-4 py-2 border rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <button 
                onClick={startPractice}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Challenge
              </button>
            </div>
          </div>
        )}

        {practiceList.length > 0 && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {practiceList.map((challenge, index) => (
              <div 
                key={challenge.id}
                className={`p-4 border rounded cursor-pointer transition-all ${
                  index === currentChallengeIndex 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:bg-accent'
                }`}
                onClick={() => setCurrentChallengeIndex(index)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {challenge.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    #{index + 1}
                  </span>
                </div>
                <h3 className="font-medium text-sm">{challenge.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {challenge.problem}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}