import ReactMarkdown from "react-markdown";

export default function Md({ children }: { children: string | null | undefined }) {
  if (!children?.trim()) return null;
  return (
    <div className="prose-lite">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
