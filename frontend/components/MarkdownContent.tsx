import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

const components: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  h1: ({ children }) => <h1 className="mb-3 text-xl font-semibold text-foreground">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-3 text-lg font-semibold text-foreground">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 font-semibold text-foreground">{children}</h3>,
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-accent pl-4 text-muted-foreground">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-lg border border-border bg-[#090909] p-4 font-mono text-xs leading-6 text-slate-200">
      {children}
    </pre>
  ),
  code: ({ className, children, ...props }) => (
    <code
      className={`${className ?? ""} rounded bg-background px-1.5 py-0.5 font-mono text-[0.9em] text-indigo-200 ${
        className ? "" : "inline"
      }`}
      {...props}
    >
      {children}
    </code>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-indigo-300 underline underline-offset-2 hover:text-indigo-200"
    >
      {children}
    </a>
  ),
};

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose-codexa text-sm leading-6 text-foreground break-words [overflow-wrap:anywhere]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
