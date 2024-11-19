import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

function ArtifactTab({ artifact, isActive, onContentChange }) {
  if (!isActive) return null;

  return (
    <div className="artifact-tab">
      {artifact.type === "markdown" ? (
        <div className="markdown-content">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {artifact.content}
          </ReactMarkdown>
        </div>
      ) : (
        <textarea
          value={artifact.content}
          onChange={(e) => onContentChange(artifact.identifier, e.target.value)}
          className="artifact-content"
        />
      )}
    </div>
  );
}

export default ArtifactTab; 