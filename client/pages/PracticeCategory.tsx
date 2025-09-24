import Layout from "@/components/layout/Layout";
import { allChallenges, getCategories } from "@/data/challenges";
import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";

export default function PracticeCategoryPage() {
  const params = useParams();
  const rawCat = params.category ? decodeURIComponent(params.category) : "";
  const categories = getCategories();
  const catMeta = categories.find((c) => c.key === rawCat);
  const list = useMemo(() => allChallenges().filter((c) => c.category === rawCat), [rawCat]);

  if (!catMeta) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-lg">Category not found</p>
          <Link className="text-primary underline" to="/">Back to home</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-96 flex-shrink-0">
          <h1 className="text-2xl font-bold">{catMeta.label}</h1>
          <p className="text-sm text-muted-foreground">{catMeta.description}</p>
          <ul className="mt-4 divide-y rounded-md border">
            {list.map((c, i) => (
              <li key={c.id} className="p-3 flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-medium line-clamp-1">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.difficulty}</div>
                </div>
                <Link className="text-sm rounded-md border px-2 py-1 hover:bg-muted" to={`/practice/${encodeURIComponent(rawCat)}/play/${i}`}>
                  Start
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <section className="flex-1 min-w-0">
          <div className="text-center py-20">
            <p className="text-lg">Pick any challenge to begin. The editor opens in a full-page view.</p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
