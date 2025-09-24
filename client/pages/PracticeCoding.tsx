import Layout from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { ArrowLeft, Play, RotateCcw, CheckCircle } from "lucide-react";
import { fetchChallengesFromDB } from "@/data/challenges";

export default function PracticeCoding() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<any>(null);
  const [code, setCode] = useState("");
  const [testResults, setTestResults] = useState<any[]>([]);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [stdin, setStdin] = useState("");

  const decodeHtmlEntities = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  useEffect(() => {
    const loadChallenge = async () => {
      const challenges = await fetchChallengesFromDB();
      const found = challenges.find(c => c.id === challengeId);
      if (found) {
        setChallenge(found);
        setCode(`public class Main {
    public static void main(String[] args) {
        // Write your solution here
        
    }
}`);
      }
    };
    loadChallenge();
  }, [challengeId]);

  const runCode = async () => {
    setIsRunning(true);
    setShowResults(false);
    
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
      setExecutionResult(result);
      
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
          
          setTestResults(results);
          finalTestResults = results;
        } else {
          setTestResults([]);
          finalTestResults = [];
        }
      } else {
        setTestResults([]);
        finalTestResults = [];
      }
      
      // Track advanced analytics after test results are calculated
      try {
        const status = result.status?.id === 3 ? 'PASSED' : 
                      result.compile_output ? 'COMPILE_ERROR' : 
                      result.stderr ? 'RUNTIME_ERROR' : 'FAILED';
        
        console.log('Tracking analytics:', { status, challengeId: challenge.id });
        
        // Calculate test case results from final results
        const testCasesPassed = finalTestResults.filter(r => r.passed).length;
        const testCasesTotal = finalTestResults.length;
        
        const trackResponse = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Session-Id': Date.now().toString()
          },
          body: JSON.stringify({
            username: 'guest',
            challengeId: challenge.id,
            mode: 'PRACTICE',
            status,
            timeSpent: 120,
            code: decodedCode,
            testCasesPassed,
            testCasesTotal
          })
        });
        
        const trackResult = await trackResponse.json();
        console.log('Analytics response:', trackResult);
      } catch (e) {
        console.error('Analytics failed:', e);
      }
    } catch (error) {
      setTestResults([{
        input: "Test Execution",
        expected: "Tests should run successfully",
        actual: `Error: ${error}`,
        passed: false
      }]);
    } finally {
      setShowResults(true);
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    setCode(`public class Main {
    public static void main(String[] args) {
        // Write your solution here
        
    }
}`);
    setTestResults([]);
    setExecutionResult(null);
    setShowResults(false);
    setIsCompleted(false);
  };

  const showSampleCode = () => {
    setCode(decodeHtmlEntities(challenge?.sampleCode || ""));
  };

  const markCompleted = () => {
    setIsCompleted(true);
  };

  const goBack = () => {
    navigate('/practice-mode');
  };

  if (!challenge) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p>Loading challenge...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto h-screen flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Practice
            </button>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-lg font-semibold">{challenge.title}</h1>
            {isCompleted && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Completed</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={resetCode} className="flex items-center gap-2 px-3 py-2 border rounded hover:bg-accent">
              <RotateCcw className="w-4 h-4" />
              Clear
            </button>
            <button onClick={showSampleCode} className="flex items-center gap-2 px-3 py-2 border rounded hover:bg-accent">
              <Icon icon="mdi:eye" className="w-4 h-4" />
              Show Solution
            </button>
            <button 
              onClick={runCode} 
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {isRunning ? "Testing..." : "Test Code"}
            </button>
            <button 
              onClick={markCompleted}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Mark Complete
            </button>
          </div>
        </div>

        {/* Unified Container */}
        <div className="flex flex-1 overflow-hidden bg-white dark:bg-gray-900 rounded-xl border border-border/50 shadow-lg">
          {/* Problem Section */}
          <div className="w-1/3 border-r border-border/30 flex flex-col">
            <div className="p-4 border-b border-border/30 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <div className="flex items-center gap-2 mb-3">
                <Icon icon="mdi:puzzle" className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-800 dark:text-gray-200">Problem</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">{challenge.category}</span>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">{challenge.difficulty}</span>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-auto space-y-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <div dangerouslySetInnerHTML={{
                  __html: challenge.problem
                    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
                    .replace(/\n/g, '<br>')
                }} />
              </div>
              {challenge.concept && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <h3 className="text-sm font-medium mb-2">Learning Objective</h3>
                  <div className="text-xs text-muted-foreground">
                    <div dangerouslySetInnerHTML={{
                      __html: challenge.concept
                        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
                        .replace(/\n/g, '<br>')
                    }} />
                  </div>
                </div>
              )}
              {challenge?.testCases && challenge.testCases.length > 0 && challenge.testCases.some(tc => tc.expectedOutput) && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <h3 className="text-sm font-medium mb-2">Test Cases</h3>
                  <div className="space-y-2">
                    {challenge.testCases.filter(tc => tc.expectedOutput).map((tc, index) => (
                      <div key={index} className="p-2 bg-background rounded border">
                        <div className="text-xs font-medium mb-1">Test {index + 1}</div>
                        {tc.input && <div className="text-xs text-muted-foreground">Input: {tc.input}</div>}
                        <div className="text-xs font-mono bg-gray-50 dark:bg-gray-800 p-1 rounded mt-1">{decodeHtmlEntities(tc.expectedOutput)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Code Editor Section */}
          <div className="flex-1 border-r border-border/30 flex flex-col">
            <div className="p-2 border-b border-border/30 bg-muted/10">
              <span className="text-sm font-medium">Solution.java</span>
            </div>
            <div className="flex-1">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full p-4 font-mono text-sm resize-none border-0 focus:outline-none bg-background"
                placeholder="Write your Java code here..."
                style={{ fontFamily: 'JetBrains Mono, Consolas, monospace' }}
              />
            </div>
          </div>

          {/* Output & Results Section */}
          <div className="w-1/3 flex flex-col">
            {/* Input Section */}
            <div className="border-b border-border/30">
              <div className="p-2 border-b border-border/30 bg-muted/10">
                <span className="text-sm font-medium">Input (stdin)</span>
              </div>
              <div className="p-2">
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  className="w-full h-20 text-xs font-mono border rounded p-2 bg-background"
                  placeholder="Enter input for your program (e.g., 5)"
                />
              </div>
            </div>
            
            {/* Execution Output */}
            <div className="flex-1 border-b border-border/30">
              <div className="p-2 border-b border-border/30 bg-muted/10">
                <span className="text-sm font-medium">Execution Output</span>
              </div>
              <div className="p-3 h-48 overflow-auto font-mono text-xs">
                {isRunning ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="animate-spin w-3 h-3 border-2 border-primary border-t-transparent rounded-full"></div>
                    Executing...
                  </div>
                ) : showResults && executionResult ? (
                  <div className="space-y-2">
                    {executionResult.compile_output && (
                      <div>
                        <div className="text-red-600 font-bold">Compilation Error:</div>
                        <pre className="text-red-500 whitespace-pre-wrap">{executionResult.compile_output}</pre>
                      </div>
                    )}
                    {executionResult.stdout && (
                      <div>
                        <div className="text-green-600 font-bold">Output:</div>
                        <pre className="text-green-500 whitespace-pre-wrap">{executionResult.stdout}</pre>
                      </div>
                    )}
                    {executionResult.stderr && (
                      <div>
                        <div className="text-orange-600 font-bold">Runtime Issue:</div>
                        <pre className="text-orange-500 whitespace-pre-wrap">{executionResult.stderr}</pre>
                      </div>
                    )}
                    {!executionResult.stdout && !executionResult.stderr && !executionResult.compile_output && (
                      <div className="text-muted-foreground">No output</div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground">Click "Test Code" to see execution output</div>
                )}
              </div>
            </div>
            
            {/* Test Results */}
            <div className="flex-1">
              <div className="p-2 border-b border-border/30 bg-muted/10">
                <span className="text-sm font-medium">Test Results</span>
              </div>
              <div className="p-3 h-48 overflow-auto">
                {isRunning ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    Running test cases...
                  </div>
                ) : showResults ? (
                  testResults.length > 0 ? (
                    <div className="space-y-3">
                      {testResults.map((result, index) => (
                        <div key={index} className={`p-3 rounded border ${
                          result.passed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Icon 
                              icon={result.passed ? "mdi:check-circle" : "mdi:close-circle"} 
                              className={`w-4 h-4 ${
                                result.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                              }`} 
                            />
                            <span className="text-sm font-medium">Test Case {index + 1}</span>
                          </div>
                          <div className="text-xs space-y-1">
                            <div><span className="font-medium">Expected:</span> {result.expected}</div>
                            <div><span className="font-medium">Your Output:</span> {result.actual}</div>
                          </div>
                        </div>
                      ))}
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          {testResults.filter(r => r.passed).length} / {testResults.length} test cases passed
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Icon icon="mdi:test-tube-empty" className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">No test cases configured</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-4">
                    <Icon icon="mdi:play-circle-outline" className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Click "Test Code" to run tests</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}