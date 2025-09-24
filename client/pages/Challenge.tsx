import Layout from "@/components/layout/Layout";
import { allChallenges, fetchChallengesFromDB } from "@/data/challenges";
import { useParams, Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import { premiumDarkTheme, premiumLightTheme } from "@/components/EditorThemes";
import { EditorView } from "@codemirror/view";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { keymap } from "@codemirror/view";
import type { ExecuteRequest, ExecuteResponse } from "@shared/api";
import { getUser } from "@/lib/auth";
import { Icon } from "@iconify/react";
import { useTheme } from "@/lib/theme";
import { motion } from "framer-motion";

export default function ChallengeDetailPage() {
  const { id } = useParams();
  const user = getUser();
  const { theme } = useTheme();
  const [challenge, setChallenge] = useState<any>(null);
  
  // Load challenge from database
  useEffect(() => {
    const loadChallenge = async () => {
      const dbChallenges = await fetchChallengesFromDB();
      const dbChallenge = dbChallenges.find((c) => c.id === id);
      console.log('Loading challenge for ID:', id);
      console.log('Found DB challenge:', dbChallenge);
      console.log('DB challenge test cases:', dbChallenge?.testCases);
      if (dbChallenge) {
        setChallenge(dbChallenge);
      } else {
        // Fallback to localStorage
        const localChallenge = allChallenges().find((c) => c.id === id);
        console.log('Using local challenge:', localChallenge);
        setChallenge(localChallenge);
      }
    };
    loadChallenge();
  }, [id]);

  const defaultCode = `import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    // Write your solution here\n  }\n}`;
  
  const [code, setCode] = useState<string>(defaultCode);
  
  const [stdin, setStdin] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecuteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [inlineSuggestions, setInlineSuggestions] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('premium');
  const [fontFamily, setFontFamily] = useState('jetbrains');
  
  const themes = {
    premium: { dark: premiumDarkTheme, light: premiumLightTheme, name: 'Premium' },
    ocean: { 
      dark: [EditorView.theme({ "&": { backgroundColor: "#0f1419", color: "#bfbdb6" } }, { dark: true })],
      light: [EditorView.theme({ "&": { backgroundColor: "#fafafa", color: "#5c6166" } }, { dark: false })],
      name: 'Ocean'
    },
    forest: {
      dark: [EditorView.theme({ "&": { backgroundColor: "#1a2332", color: "#d4d4aa" } }, { dark: true })],
      light: [EditorView.theme({ "&": { backgroundColor: "#f8f8f2", color: "#272822" } }, { dark: false })],
      name: 'Forest'
    },
    monokai: {
      dark: [EditorView.theme({
        "&": { 
          background: "linear-gradient(135deg, #0c1821 0%, #1a2332 25%, #2d3748 50%, #1a2332 75%, #0c1821 100%)",
          color: "#fcfcfa",
          backdropFilter: "blur(10px) saturate(1.2)",
          "-webkit-backdrop-filter": "blur(10px) saturate(1.2)"
        },
        ".cm-content": { caretColor: "#fcfcfa" },
        ".cm-cursor": { borderLeftColor: "#fcfcfa" },
        ".cm-selectionBackground": { backgroundColor: "#403e41" },
        ".cm-gutters": { 
          background: "linear-gradient(135deg, #0c1821 0%, #1a2332 50%, #0c1821 100%)",
          color: "#939293", 
          border: "none" 
        },
        ".cm-activeLineGutter": { backgroundColor: "#403e41" },
        ".cm-activeLine": { backgroundColor: "#403e4140" }
      }, { dark: true })],
      light: [EditorView.theme({
        "&": { backgroundColor: "#fdfdf6", color: "#2d2a2e" },
        ".cm-content": { caretColor: "#2d2a2e" },
        ".cm-cursor": { borderLeftColor: "#2d2a2e" },
        ".cm-selectionBackground": { backgroundColor: "#e8e8e8" },
        ".cm-gutters": { backgroundColor: "#f7f7f7", color: "#939293", border: "none" },
        ".cm-activeLineGutter": { backgroundColor: "#e8e8e8" },
        ".cm-activeLine": { backgroundColor: "#e8e8e840" }
      }, { dark: false })],
      name: 'Monokai Pro'
    }
  };

  const fonts = {
    jetbrains: "'JetBrains Mono', monospace",
    fira: "'Fira Code', monospace",
    cascadia: "'Cascadia Code', monospace",
    monaco: "'Monaco', monospace"
  };

  const editorTheme = useMemo(() => {
    const baseTheme = theme === 'dark' ? themes[selectedTheme].dark : themes[selectedTheme].light;
    const customTheme = EditorView.theme({
      "&": {
        fontSize: `${fontSize}px !important`,
        fontFamily: `${fonts[fontFamily]} !important`
      },
      ".cm-content": {
        fontSize: `${fontSize}px !important`,
        fontFamily: `${fonts[fontFamily]} !important`
      },
      ".cm-editor": {
        fontSize: `${fontSize}px !important`,
        fontFamily: `${fonts[fontFamily]} !important`
      }
    });
    return [baseTheme, customTheme].flat();
  }, [theme, fontSize, selectedTheme, fontFamily]);
  
  // Reset code when challenge changes
  useEffect(() => {
    setCode(defaultCode);
  }, [id]);

  // Java autocomplete suggestions
  const javaCompletions = [
    { label: "public static void main(String[] args)", type: "keyword" },
    { label: "System.out.println", type: "function" },
    { label: "Scanner", type: "class" },
    { label: "String", type: "class" },
    { label: "int", type: "keyword" },
    { label: "double", type: "keyword" },
    { label: "for", type: "keyword" },
    { label: "while", type: "keyword" },
    { label: "if", type: "keyword" },
    { label: "else", type: "keyword" },
    { label: "class", type: "keyword" },
    { label: "public", type: "keyword" },
    { label: "private", type: "keyword" },
    { label: "static", type: "keyword" },
    { label: "return", type: "keyword" },
    { label: "Math.max", type: "function" },
    { label: "Math.min", type: "function" },
    { label: "Integer.parseInt", type: "function" },
    { label: ".length()", type: "method" },
    { label: ".charAt()", type: "method" },
    { label: ".equals()", type: "method" }
  ];

  const customAutocompletion = autocompletion({
    override: [
      (context) => {
        const word = context.matchBefore(/\w*/);
        if (!word || (word.from === word.to && !context.explicit)) return null;
        
        return {
          from: word.from,
          options: javaCompletions.map(completion => ({
            label: completion.label,
            type: completion.type
          }))
        };
      }
    ]
  });

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-lg">Please log in to solve challenges.</p>
          <Link className="text-primary underline" to="/login">Login</Link>
        </div>
      </Layout>
    );
  }

  if (!challenge) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-lg">Challenge not found.</p>
          <Link className="text-primary underline" to="/challenges">Back to list</Link>
        </div>
      </Layout>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    alert("Code copied to clipboard");
  };

  const decodeHtmlEntities = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const runCode = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    setTestResults(null);
    
    try {
      // Decode HTML entities in the code
      const decodedCode = decodeHtmlEntities(code);
      
      const payload = {
        language: "java",
        code: decodedCode,
        stdin: stdin
      };
      
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      setResult(result);
      
      let finalTestResults = [];
      
      // Check if we have test cases with expected output
      if (challenge?.testCases && challenge.testCases.length > 0) {
        const validTestCases = challenge.testCases.filter(tc => tc.expectedOutput && tc.expectedOutput.trim());
        
        if (validTestCases.length > 0) {
          const results = [];
          
          for (const testCase of validTestCases) {
            if (!response.ok || result.error) {
              results.push({
                input: testCase.input || "No input",
                expected: decodeHtmlEntities(testCase.expectedOutput),
                actual: result.error || "Execution failed",
                passed: false
              });
            } else if (result.compile_output && result.compile_output.trim()) {
              results.push({
                input: testCase.input || "No input",
                expected: decodeHtmlEntities(testCase.expectedOutput),
                actual: `Compilation Error: ${result.compile_output.trim()}`,
                passed: false
              });
            } else if (result.status?.id !== 3) {
              results.push({
                input: testCase.input || "No input",
                expected: decodeHtmlEntities(testCase.expectedOutput),
                actual: result.stderr?.trim() || result.status?.description || "Runtime error",
                passed: false
              });
            } else {
              const actualOutput = (result.stdout || "").trim();
              const expectedOutput = decodeHtmlEntities(testCase.expectedOutput).trim();
              const passed = actualOutput === expectedOutput;
              
              results.push({
                input: testCase.input || "No input",
                expected: expectedOutput,
                actual: actualOutput || "No output",
                passed: passed
              });
            }
          }
          
          const passedCount = results.filter(r => r.passed).length;
          const testResultsData = {
            results,
            allPassed: passedCount === results.length,
            passedCount,
            totalCount: results.length
          };
          setTestResults(testResultsData);
          finalTestResults = results;
        }
      }
      
      // Track analytics for challenge mode
      try {
        const status = result.status?.id === 3 ? 'PASSED' : 
                      result.compile_output ? 'COMPILE_ERROR' : 
                      result.stderr ? 'RUNTIME_ERROR' : 'FAILED';
        
        const testCasesPassed = finalTestResults.filter(r => r.passed).length;
        const testCasesTotal = finalTestResults.length;
        
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Session-Id': Date.now().toString()
          },
          body: JSON.stringify({
            username: 'guest',
            challengeId: challenge.id,
            mode: 'CHALLENGE',
            status,
            timeSpent: 180,
            code: decodedCode,
            testCasesPassed,
            testCasesTotal
          })
        });
      } catch (e) {
        console.log('Analytics failed:', e);
      }
      
    } catch (error) {
      setError(`Error: ${error}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <Link className="text-sm text-primary underline" to="/challenges">← All challenges</Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs rounded bg-primary/10 text-primary px-2 py-1 font-medium">{challenge.category}</span>
          <span className="text-xs text-muted-foreground">{challenge.difficulty}</span>
          {challenge.testCases && challenge.testCases.length > 0 && <span className="text-xs rounded bg-green-100 text-green-800 px-2 py-1 font-medium">{challenge.testCases.length} Test Cases</span>}
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{challenge.title}</h1>
        
        {/* Problem Statement */}
        <div className="mt-4 rounded-md border bg-card">
          <div className="border-b px-4 py-3 text-sm font-medium">Problem Statement</div>
          <div className="p-4 text-sm text-muted-foreground whitespace-pre-wrap">
            <div dangerouslySetInnerHTML={{
              __html: challenge.problem
                .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
                .replace(/\n/g, '<br>')
            }} />
          </div>
        </div>
        
        {/* Concept/Learning Objective */}
        {challenge.concept && (
          <div className="mt-4 rounded-md border bg-card">
            <div className="border-b px-4 py-3 text-sm font-medium">Concept / Learning Objective</div>
            <div className="p-4 text-sm text-muted-foreground whitespace-pre-wrap">
              <div dangerouslySetInnerHTML={{
                __html: challenge.concept
                  .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
                  .replace(/\n/g, '<br>')
              }} />
            </div>
          </div>
        )}
        
        {/* Test Cases */}
        {challenge?.testCases && challenge.testCases.length > 0 && challenge.testCases.some(tc => tc.expectedOutput) && (
          <div className="mt-4 rounded-md border bg-card">
            <div className="border-b px-4 py-3 text-sm font-medium">Test Cases ({challenge.testCases.length})</div>
            <div className="p-4 space-y-3">
              {challenge.testCases.filter(tc => tc.expectedOutput).map((tc: any, index: number) => (
                <div key={index} className="p-3 bg-green-50 dark:bg-green-900/20 rounded border">
                  <div className="text-xs font-medium text-green-800 dark:text-green-200 mb-2">Test Case {index + 1}</div>
                  {tc.input && <div className="text-xs text-muted-foreground mb-1">Input: {tc.input}</div>}
                  <div className="text-xs">
                    <span className="font-medium">Expected Output:</span>
                    <div className="font-mono bg-background p-2 rounded border mt-1">{decodeHtmlEntities(tc.expectedOutput)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <section className="mt-6">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Icon icon="logos:java" className="w-6 h-6" />
                  Your solution (Java)
                </h2>
                <div className="flex gap-2 relative">
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-muted flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <Icon icon="mdi:cog" className="w-4 h-4" />
                    Settings
                  </button>
                  <button onClick={handleCopy} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted flex items-center gap-2 transition-all hover:scale-105">
                    <Icon icon="mdi:content-copy" className="w-4 h-4" />
                    Copy
                  </button>
                  <button 
                    onClick={() => setIsFullscreen(true)} 
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-muted flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <Icon icon="mdi:fullscreen" className="w-4 h-4" />
                    Fullscreen
                  </button>
                  <button onClick={runCode} disabled={running} className="rounded-lg bg-gradient-to-r from-green-500 to-blue-500 px-4 py-2 text-sm text-white hover:from-green-600 hover:to-blue-600 disabled:opacity-50 flex items-center gap-2 transition-all hover:scale-105 shadow-lg">
                    <Icon icon={running ? "mdi:loading" : "mdi:play"} className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
                    {running ? "Running..." : "Run"}
                  </button>
                  
                  {/* Settings Panel */}
                  {showSettings && (
                    <div className="absolute top-12 left-0 w-80 bg-background border rounded-lg shadow-lg p-4 z-10">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Icon icon="mdi:cog" className="w-4 h-4" />
                        Editor Settings
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Theme Selection */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Theme</label>
                          <select 
                            value={selectedTheme} 
                            onChange={(e) => setSelectedTheme(e.target.value)}
                            className="w-full rounded-md border px-3 py-2 text-sm bg-background text-foreground"
                          >
                            {Object.entries(themes).map(([key, theme]) => (
                              <option key={key} value={key}>{theme.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Font Family */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Font Family</label>
                          <select 
                            value={fontFamily} 
                            onChange={(e) => setFontFamily(e.target.value)}
                            className="w-full rounded-md border px-3 py-2 text-sm bg-background text-foreground"
                          >
                            <option value="jetbrains">JetBrains Mono</option>
                            <option value="fira">Fira Code</option>
                            <option value="cascadia">Cascadia Code</option>
                            <option value="monaco">Monaco</option>
                          </select>
                        </div>
                        
                        {/* Font Size */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Font Size: {fontSize}px</label>
                          <input
                            type="range"
                            min="10"
                            max="24"
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>10px</span>
                            <span>24px</span>
                          </div>
                        </div>
                        
                        {/* Inline Suggestions */}
                        <div>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={inlineSuggestions}
                              onChange={(e) => setInlineSuggestions(e.target.checked)}
                              className="rounded"
                            />
                            Enable Inline Suggestions
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Show autocomplete suggestions while typing
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <motion.div 
                className={`mt-3 relative rounded-xl overflow-hidden shadow-2xl border border-border/30 backdrop-blur-xl ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-[#1f2f3c] via-[#0e0e14] to-[#99765f]' 
                    : 'bg-gradient-to-br from-background/5 to-background/20'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-background/30 to-background/20 backdrop-blur-md border-b border-border/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <motion.div 
                        className="w-3 h-3 rounded-full bg-red-500"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      />
                      <motion.div 
                        className="w-3 h-3 rounded-full bg-yellow-500"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      />
                      <motion.div 
                        className="w-3 h-3 rounded-full bg-green-500"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon icon="logos:java" className="w-4 h-4" />
                      <span className="font-mono">Main.java</span>
                    </div>
                  </div>
                </motion.div>

                <div className="h-96 relative">
                  <CodeMirror
                    key={`${fontSize}-${selectedTheme}-${fontFamily}`}
                    value={code}
                    height="100%"
                    theme={editorTheme}
                    extensions={[java(), ...(inlineSuggestions ? [customAutocompletion, keymap.of(completionKeymap)] : [])]}
                    onChange={(value) => setCode(value)}
                    basicSetup={{
                      lineNumbers: true,
                      foldGutter: true,
                      dropCursor: false,
                      allowMultipleSelections: false,
                      indentOnInput: true,
                      bracketMatching: true,
                      closeBrackets: true,
                      autocompletion: inlineSuggestions,
                      highlightSelectionMatches: true
                    }}
                    className="font-mono h-full"
                  />
                  
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.08 }}
                    transition={{ duration: 1 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-purple-500/3 to-emerald-500/3" />
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Fullscreen Modal */}
              {isFullscreen && (
                <div className="fixed inset-0 z-50 flex flex-col">
                  {/* Header */}
                  <div className="flex-shrink-0 h-12 flex items-center justify-between px-4 bg-gray-800 text-white">
                    <div className="flex items-center gap-2">
                      <Icon icon="logos:java" className="w-5 h-5" />
                      <span className="font-medium">Java Editor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleCopy} className="p-1 rounded bg-gray-700 hover:bg-gray-600">
                        <Icon icon="mdi:content-copy" className="w-4 h-4" />
                      </button>
                      <button onClick={() => setIsFullscreen(false)} className="p-1 rounded bg-gray-700 hover:bg-gray-600">
                        <Icon icon="mdi:close" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Editor */}
                  <div className="flex-1">
                    <CodeMirror
                      value={code}
                      height="100vh"
                      width="100vw"
                      theme={editorTheme}
                      extensions={[java(), ...(inlineSuggestions ? [customAutocompletion, keymap.of(completionKeymap)] : [])]}
                      onChange={(value) => setCode(value)}
                      basicSetup={{
                        lineNumbers: true,
                        foldGutter: true,
                        indentOnInput: true,
                        bracketMatching: true,
                        closeBrackets: true,
                        autocompletion: inlineSuggestions
                      }}
                      style={{ fontSize: `${fontSize}px` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="lg:w-80 flex-shrink-0 space-y-3">
              {challenge.testCases && challenge.testCases.length > 0 && (
                <div className="rounded-md border p-3 bg-blue-50 dark:bg-blue-950">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Icon icon="mdi:test-tube" className="w-4 h-4" />
                    Test Cases
                  </div>
                  {testResults ? (
                    <div className="mt-2 space-y-2">
                      <div className={`text-xs font-semibold ${testResults.allPassed ? 'text-green-600' : 'text-red-600'}`}>
                        {testResults.allPassed ? '✅ All Passed' : `❌ ${testResults.passedCount}/${testResults.totalCount} Passed`}
                      </div>
                      {testResults.results.map((r: any, i: number) => (
                        <div key={i} className="text-xs border-l-2 pl-2" style={{borderColor: r.passed ? '#22c55e' : '#ef4444'}}>
                          <div><strong>Test {r.testCase}:</strong> <span className={r.passed ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{r.passed ? 'PASS' : 'FAIL'}</span></div>
                          <div>Input: {r.input}</div>
                          <div>Expected: {r.expected}</div>
                          <div>Got: {r.actual}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Run your code to see test results
                    </div>
                  )}
                </div>
              )}
              
              <div className="rounded-md border p-3 bg-blue-50 dark:bg-blue-950">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Icon icon="mdi:keyboard" className="w-4 h-4" />
                  Manual Input (stdin)
                </label>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  className="mt-2 w-full h-32 rounded-md border p-2 font-mono text-sm bg-background"
                  placeholder="Enter your own input to test"
                />
              </div>
              
              <div className="rounded-md border p-3 bg-muted/30">
                <div className="text-sm font-medium flex items-center gap-2">
                  <Icon icon="mdi:console" className="w-4 h-4" />
                  Output
                </div>
                {error && <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap">{error}</pre>}
                {result && (
                  <div className="mt-2 space-y-2">
                    <div className="text-xs whitespace-pre-wrap">
                      <strong>Status:</strong> 
                      {result.status?.description === 'Accepted' ? (
                        <span className="text-green-600 font-semibold"> Accepted</span>
                      ) : result.status?.description === 'Runtime Success - Test Cases Failed' ? (
                        <span><span className="text-green-600 font-semibold"> Runtime Success</span> - <span className="text-red-600 font-semibold">Test Cases Failed</span></span>
                      ) : (
                        <span> {result.status?.description}</span>
                      )}
                    </div>
                    {stdin && (
                      <div>
                        <div className="text-xs font-semibold">input</div>
                        <pre className="text-xs whitespace-pre-wrap">{stdin}</pre>
                      </div>
                    )}
                    {result.stdout ? (
                      <div>
                        <div className="text-xs font-semibold">stdout</div>
                        <pre className="text-xs whitespace-pre-wrap">{result.stdout}</pre>
                      </div>
                    ) : null}
                    {result.stderr ? (
                      <div>
                        <div className="text-xs font-semibold">stderr</div>
                        <pre className="text-xs whitespace-pre-wrap">{result.stderr}</pre>
                      </div>
                    ) : null}
                    {result.compile_output ? (
                      <div>
                        <div className="text-xs font-semibold">compile</div>
                        <pre className="text-xs whitespace-pre-wrap">{result.compile_output}</pre>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
