import React, { useEffect, useRef } from 'react';
import { PageSection } from '@patternfly/react-core';
import * as monaco from 'monaco-editor';
import './CreatorYAMLView.scss';

// Disable Monaco workers globally
self.MonacoEnvironment = {
  getWorker() {
    // Return a minimal worker that does nothing
    return new Worker(
      URL.createObjectURL(
        new Blob(['self.onmessage = () => {}'], { type: 'text/javascript' })
      )
    );
  },
};

const CreatorYAMLView: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const editor = monaco.editor.create(editorRef.current, {
      value:
        '# YAML Quickstart Definition\n# Start typing or paste your YAML here\n',
      language: 'yaml',
      theme: 'vs',
      automaticLayout: true,
      minimap: {
        enabled: true,
      },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      fontSize: 14,
      lineNumbers: 'on',
      folding: true,
      renderWhitespace: 'selection',
    });

    editorInstanceRef.current = editor;

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.dispose();
        editorInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <PageSection className="lr-c-creator-yaml-view">
      <div ref={editorRef} className="lr-c-creator-yaml-view__editor" />
    </PageSection>
  );
};

export default CreatorYAMLView;
