import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface DisplayMarkdownProps {
  text: string;
  className?: string;
}

const DisplayMarkdown = ({ className, text }: DisplayMarkdownProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      className={`prose prose-lg max-w-none ${className}`}
    >
      {text}
    </ReactMarkdown>
  );
};

export default DisplayMarkdown;
