import React from 'react';
import { PageSection } from '@patternfly/react-core';
import Editor from '@monaco-editor/react';
import './CreatorYAMLView.scss';

const CreatorYAMLView: React.FC = () => {
  return (
    <PageSection className="lr-c-creator-yaml-view">
      <div className="lr-c-creator-yaml-view__editor">
        <Editor
          height="100%"
          language="yaml"
          theme="vs"
          defaultValue={
            '# YAML Quickstart Definition\n# Start typing or paste your YAML here\n'
          }
          options={{
            automaticLayout: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            fontSize: 14,
            lineNumbers: 'on',
            folding: true,
            renderWhitespace: 'selection',
          }}
        />
      </div>
    </PageSection>
  );
};

export default CreatorYAMLView;
