import Layout from "@/components/layout/Layout";
import { allChallenges, getCategories } from "@/data/challenges";
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import type { ExecuteRequest, ExecuteResponse } from "@shared/api";
import { getUser } from "@/lib/auth";
import { trackSubmission } from "@/lib/analytics";

export default function PracticePlayPage() {
  const { category = "", idx: idxParam } = useParams();
  // Sanitize URL parameter to prevent XSS
  const cat = decodeURIComponent(category)
    .replace(/[<>"'&]/g, (match) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[match] || match;
    })
    .slice(0, 100); // Limit length
  const index = Number(idxParam ?? 0) || 0;
  const navigate = useNavigate();
  const user = getUser();

  const list = useMemo(() => allChallenges().filter((c) => c.category === cat), [cat]);
  const current = list[index];

  const defaultCode = `import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    // Write your solution here\n  }\n}`;
  
  const [code, setCode] = useState(defaultCode);
  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecuteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCode(defaultCode);
  }, [current?.id]);

  const runCode = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const payload: ExecuteRequest & { username?: string; challengeId?: string } = { 
        language: "java", 
        code, 
        stdin,
        ...(user && current ? { username: user.username, challengeId: current.id } : {})
      };
      const res = await fetch("/api/execute", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok || data.error) setError(data.error || "Execution failed");
      else {
        setResult(data as ExecuteResponse);
        
        // Track analytics on client side as backup
        if (user && current) {
          const status = data.status?.id === 3 ? 'PASSED' : 
                        data.status?.id === 4 ? 'ERROR' : 
                        data.status?.id === 5 ? 'TIMEOUT' : 'FAILED';
          
          trackSubmission({
            username: user.username,
            challengeId: current.id,
            code,
            status: status as 'PASSED' | 'FAILED' | 'ERROR' | 'TIMEOUT',
            executionTime: data.time ? Math.round(parseFloat(data.time) * 1000) : undefined
          });
        }
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  };

  const goto = (i: number) => navigate(`/practice/${encodeURIComponent(cat)}/play/${i}`);
  const next = () => goto(Math.min(index + 1, list.length - 1));
  const prev = () => goto(Math.max(index - 1, 0));

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-lg">Please log in to practice challenges.</p>
          <Link className="text-primary underline" to="/login">Login</Link>
        </div>
      </Layout>
    );
  }

  if (!current) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-lg">No challenge found.</p>
          <Link className="text-primary underline" to={`/practice/${encodeURIComponent(cat)}`}>Back to list</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="-mt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Link className="text-sm text-primary underline" to={`/practice/${encodeURIComponent(cat)}`}>← Back to {cat}</Link>
            <div className="text-xs rounded bg-primary/10 text-primary px-2 py-1 inline-flex font-medium ml-2">{current.category}</div>
            <h1 className="mt-1 text-2xl font-bold">{current.title}</h1>
            <p className="text-sm text-muted-foreground">{current.problem}</p>
          </div>
          <div className="text-sm text-muted-foreground">{index + 1} / {list.length}</div>
        </div>

        <div className="mt-4 h-[70vh] border rounded-md overflow-hidden">
          <Editor height="100%" defaultLanguage="java" theme="vs-dark" value={code} onChange={(v)=>setCode(v ?? "")} options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: "on" }} />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <textarea className="rounded-md border p-2 font-mono text-sm" placeholder="stdin" value={stdin} onChange={(e)=>setStdin(e.target.value)} />
          <div className="flex items-center gap-2">
            <button onClick={runCode} disabled={running} className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50">{running?"Running...":"Run"}</button>
            <button onClick={prev} className="rounded-md border px-3 py-2 text-sm">Prev</button>
            <button onClick={next} className="rounded-md border px-3 py-2 text-sm">Next</button>
            <button onClick={next} className="rounded-md border px-3 py-2 text-sm">Skip</button>
          </div>
        </div>

        <div className="mt-3 rounded-md border p-3 bg-muted/30">
          <div className="text-sm font-medium">Output</div>
          {error && <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap">{error}</pre>}
          {result && (
            <div className="mt-2 space-y-2">
              <pre className="text-xs whitespace-pre-wrap"><strong>Status:</strong> {result.status?.description}</pre>
              {result.stdout ? (<div><div className="text-xs font-semibold">stdout</div><pre className="text-xs whitespace-pre-wrap">{result.stdout}</pre></div>) : null}
              {result.stderr ? (<div><div className="text-xs font-semibold">stderr</div><pre className="text-xs whitespace-pre-wrap">{result.stderr.replace(/[<>&"']/g, (match) => ({'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;'}[match] || match))}</pre></div>) : null}
              {result.compile_output ? (<div><div className="text-xs font-semibold">compile</div><pre className="text-xs whitespace-pre-wrap">{result.compile_output}</pre></div>) : null}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
