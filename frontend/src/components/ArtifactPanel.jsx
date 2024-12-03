import { useState, useEffect } from 'react';
import ArtifactTab from './ArtifactTab';
import './ArtifactPanel.css';

function ArtifactPanel({ artifacts, onArtifactChange, toolName, originalLink }) {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Function to handle hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (hash) {
        const index = artifacts.findIndex(artifact => artifact.identifier === hash);
        if (index !== -1) {
          setActiveTab(index);
        }
      }
    };

    // Set initial tab based on URL hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Cleanup listener
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [artifacts]);

  const handleTabClick = (index, identifier) => {
    setActiveTab(index);
    window.location.hash = identifier;
  };

  const handleContentChange = (identifier, newContent) => {
    onArtifactChange(identifier, newContent);
  };

  return (
    <div className="artifact-panel">
      <h2 className="panel-title">
        {toolName} llms.txt Sections <a href={originalLink} className="source-link">(source)</a>
      </h2>
      <div className="artifact-tabs">
        {artifacts.map((artifact, index) => (
          <button
            key={artifact.identifier}
            className={`tab-button ${activeTab === index ? 'active' : ''}`}
            onClick={() => handleTabClick(index, artifact.identifier)}
            title={artifact.identifier}
          >
            {artifact.title}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {artifacts.map((artifact, index) => (
          <ArtifactTab
            key={artifact.identifier}
            artifact={artifact}
            isActive={activeTab === index}
            onContentChange={handleContentChange}
          />
        ))}
      </div>
    </div>
  );
}

export default ArtifactPanel; 