import { useState } from 'react';
import ArtifactTab from './ArtifactTab';
import './ArtifactPanel.css';

function ArtifactPanel({ artifacts, onArtifactChange }) {
  const [activeTab, setActiveTab] = useState(0);

  const handleContentChange = (identifier, newContent) => {
    onArtifactChange(identifier, newContent);
  };

  return (
    <div className="artifact-panel">
      <div className="artifact-tabs">
        {artifacts.map((artifact, index) => (
          <button
            key={artifact.identifier}
            className={`tab-button ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
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