import Layout from "@/components/layout/Layout";
import { fetchChallengesFromDB, categoriesWithCountsFromDB } from "@/data/challenges";
import { Link, useSearchParams } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { Icon } from "@iconify/react";

function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    "Data Types": "mdi:database",
    "Conditionals": "mdi:help-rhombus",
    "Loops": "mdi:repeat",
    "Arrays": "mdi:view-grid",
    "Strings": "mdi:format-text",
    "Functions": "mdi:function",
    "OOP": "mdi:cube-outline",
  };
  return iconMap[category] || "mdi:code-tags";
}

function getDifficultyIcon(difficulty: string): string {
  const iconMap: Record<string, string> = {
    "Easy": "mdi:circle",
    "Medium": "mdi:circle-double",
    "Hard": "mdi:hexagon",
  };
  return iconMap[difficulty] || "mdi:circle";
}

function getDifficultyColor(difficulty: string): string {
  const colorMap: Record<string, string> = {
    "Easy": "text-green-600",
    "Medium": "text-yellow-600",
    "Hard": "text-red-600",
  };
  return colorMap[difficulty] || "text-gray-600";
}

export default function ChallengesPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const cat = params.get("cat") ?? "All";
  const [challenges, setChallenges] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [dbChallenges, dbCategories] = await Promise.all([
        fetchChallengesFromDB(),
        categoriesWithCountsFromDB()
      ]);
      setChallenges(dbChallenges);
      setCategories(dbCategories);
    };
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return challenges.filter((c) => {
      const matchesQ = q
        ? (c.title + " " + c.problem + " " + c.concept)
            .toLowerCase()
            .includes(q.toLowerCase())
        : true;
      const matchesCat = cat === "All" ? true : c.category === cat;
      return matchesQ && matchesCat;
    });
  }, [q, cat, challenges]);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-stretch gap-3">
            <div className="flex-1 relative">
              <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search challenges..."
                className="w-full rounded-md border px-3 py-2 pl-10 bg-background text-foreground"
                value={q}
                onChange={(e) => setParams({ q: e.target.value, cat })}
              />
            </div>
            <div className="w-full md:w-56 relative">
              <Icon icon="mdi:filter" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                className="w-full rounded-md border px-3 py-2 pl-10 bg-background text-foreground appearance-none"
                value={cat}
                onChange={(e) => setParams({ q, cat: e.target.value })}
              >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
              </select>
              <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>


        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <li 
              key={c.id} 
              className="rounded-lg border p-4 transition hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs rounded bg-primary/10 text-primary px-2 py-1 font-medium flex items-center gap-1">
                  <Icon icon={getCategoryIcon(c.category)} className="w-3 h-3" />
                  {c.category}
                </span>
                <span className={`text-xs font-medium flex items-center gap-1 ${getDifficultyColor(c.difficulty)}`}>
                  <Icon icon={getDifficultyIcon(c.difficulty)} className="w-3 h-3" />
                  {c.difficulty}
                </span>
              </div>
              <h3 className="mt-2 text-lg font-semibold">{c.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.problem}</p>
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">Concept: {c.concept}</p>
              <div className="mt-4">
                <Link
                  to={`/challenge/${c.id}`}
                  className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 gap-2"
                >
                  <Icon icon="mdi:play" className="w-4 h-4" />
                  Solve
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
