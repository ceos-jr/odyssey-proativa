import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface DisplayMarkdownProps {
  text: string;
}

const DisplayMarkdown = ({ text }: DisplayMarkdownProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      className="max-w-none prose prose-lg"
    >
      {text}
    </ReactMarkdown>
  );
};

export default DisplayMarkdown;
