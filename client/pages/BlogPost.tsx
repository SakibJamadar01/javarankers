import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import DOMPurify from "dompurify";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

function formatBlogContent(content: string): string {
  const formatted = content
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/```java\n([\s\S]*?)\n```/g, 
      '<pre class="bg-gray-50 dark:bg-gray-800 border rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm font-mono">$1</code></pre>')
    .replace(/```bash\n([\s\S]*?)\n```/g, 
      '<pre class="bg-gray-900 text-green-400 rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm font-mono">$1</code></pre>')
    .replace(/```([\s\S]*?)```/g, 
      '<pre class="bg-gray-50 dark:bg-gray-800 border rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm font-mono">$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul class="list-disc list-inside space-y-2 my-4">$1</ul>')
    .split('\n\n')
    .map(paragraph => {
      if (paragraph.trim() && 
          !paragraph.includes('<h1>') && 
          !paragraph.includes('<h2>') && 
          !paragraph.includes('<h3>') &&
          !paragraph.includes('<pre>') &&
          !paragraph.includes('<ul>')) {
        return `<p>${paragraph.trim()}</p>`;
      }
      return paragraph;
    })
    .join('\n\n');
    
  // Sanitize the HTML to prevent XSS
  return DOMPurify.sanitize(formatted, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'p', 'strong', 'code', 'pre', 'ul', 'li'],
    ALLOWED_ATTR: ['class']
  });
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const sanitizedContent = useMemo(() => {
    return blog ? formatBlogContent(blog.content) : '';
  }, [blog?.content]);

  useEffect(() => {
    if (slug) {
      fetchBlog(slug);
    }
  }, [slug]);

  const fetchBlog = async (slug: string) => {
    try {
      const response = await fetch(`/api/blogs/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Blog not found");
        }
        throw new Error("Failed to load blog");
      }
      const data = await response.json();
      setBlog(data.blog);
    } catch (error) {
      console.error('Blog fetch error:', error);
      setError(error instanceof Error ? error.message : "Failed to load blog post");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center">Loading blog post...</div>
      </Layout>
    );
  }

  if (error || !blog) {
    return (
      <Layout>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Blog post not found"}</p>
          <Link to="/blogs">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blogs
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Link to="/blogs" className="inline-block mb-6">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Button>
        </Link>

        <article className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border">
          <header className="px-8 py-6 border-b">
            <h1 className="text-4xl font-bold leading-tight mb-4 text-gray-900 dark:text-white">
              {blog.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <Badge variant="secondary" className="px-3 py-1">{blog.author}</Badge>
              <time className="font-medium">
                {new Date(blog.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric'
                })}
              </time>
            </div>
          </header>
          
          <div className="px-8 py-8">
            <div 
              className="prose prose-lg prose-gray dark:prose-invert max-w-none
                         prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                         prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
                         prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:border-b prose-h2:pb-2
                         prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
                         prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                         prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                         prose-ul:my-4 prose-li:my-2 prose-li:text-gray-700 dark:prose-li:text-gray-300
                         prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                         prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:rounded-lg prose-pre:p-4
                         prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic"
              dangerouslySetInnerHTML={{ 
                __html: sanitizedContent
              }}
            />
          </div>
        </article>
      </div>
    </Layout>
  );
}