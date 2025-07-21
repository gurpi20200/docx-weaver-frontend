import { ReactNode } from 'react';
import { Github, FileText } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-foreground">HTML to DOCX</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/GurnoorSH/HTML-to-DOCX-Converter"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with React + TypeScript. Convert HTML files to DOCX format with ease.
          </p>
          <div className="mt-2 flex justify-center space-x-4">
            <a
              href="https://github.com/GurnoorSH/HTML-to-DOCX-Converter"
              className="hover:text-foreground transition-colors"
            >
              Documentation
            </a>
            <span>•</span>
            <a
              href="https://github.com/GurnoorSH/HTML-to-DOCX-Converter/issues"
              className="hover:text-foreground transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}