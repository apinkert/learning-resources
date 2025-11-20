import React, { useState } from 'react';
import { Button, Flex, FlexItem, PageSection } from '@patternfly/react-core';
import { FileImportIcon } from '@patternfly/react-icons';
import Editor from '@monaco-editor/react';
import { DEFAULT_QUICKSTART_YAML } from '../../data/quickstart-templates';
import './CreatorYAMLView.scss';

const CreatorYAMLView: React.FC = () => {
  const [yamlContent, setYamlContent] = useState<string>(
    '# YAML Quickstart Definition\n# Start typing or paste your YAML here\n'
  );

  const configureMonacoEnvironment = () => {
    // Disable Monaco workers to prevent CDN fetching in CI environments
    self.MonacoEnvironment = {
      getWorker() {
        return new Worker(
          URL.createObjectURL(
            new Blob(['self.onmessage = () => {}'], { type: 'text/javascript' })
          )
        );
      },
    };
  };

  const handleLoadSample = () => {
    const currentContent = yamlContent.trim();

    // If content exists and is not empty, confirm before overwriting
    if (currentContent && currentContent !== '') {
      const confirmed = window.confirm(
        'This will overwrite your current work. Are you sure?'
      );
      if (!confirmed) {
        return;
      }
    }

    setYamlContent(DEFAULT_QUICKSTART_YAML);
  };

  return (
    <PageSection className="lr-c-creator-yaml-view">
      <Flex
        spaceItems={{ default: 'spaceItemsSm' }}
        className="lr-c-creator-yaml-view__toolbar"
      >
        <FlexItem>
          <Button
            variant="secondary"
            icon={<FileImportIcon />}
            onClick={handleLoadSample}
            size="sm"
          >
            Load Sample Template
          </Button>
        </FlexItem>
      </Flex>
      <div className="lr-c-creator-yaml-view__editor">
        <Editor
          height="100%"
          language="yaml"
          theme="vs"
          value={yamlContent}
          onChange={(value) => setYamlContent(value || '')}
          beforeMount={configureMonacoEnvironment}
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
