import { Icon } from "@iconify/react";
import React from "react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t mt-16">
      <div className="container py-8 text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <p className="font-medium">© {currentYear} JavaRanker</p>
          <p className="text-muted-foreground">Practice Java, the right way.</p>
        </div>
        <div className="flex items-center gap-6">
          <a className="text-muted-foreground hover:text-primary font-medium transition-colors" href="/">Home</a>
          <a className="text-muted-foreground hover:text-primary font-medium transition-colors" href="/challenges">Challenges</a>
          <a className="text-muted-foreground hover:text-primary font-medium transition-colors flex items-center gap-1" href="/blogs">
            <Icon icon="mdi:post" className="w-4 h-4" />
            Blogs
          </a>
          <a className="text-muted-foreground hover:text-primary font-medium transition-colors flex items-center gap-1" href="/about">
            <Icon icon="mdi:information" className="w-4 h-4" />
            About
          </a>
          <a className="text-muted-foreground hover:text-primary font-medium transition-colors flex items-center gap-1" href="/feedback">
            <Icon icon="mdi:message-text" className="w-4 h-4" />
            Feedback
          </a>
          <a className="text-muted-foreground hover:text-primary font-medium transition-colors flex items-center gap-1" href="/ide">
            <Icon icon="vscode-icons:file-type-java" className="w-4 h-4" />
            IDE
          </a>
        </div>
      </div>
    </footer>
  );
}
