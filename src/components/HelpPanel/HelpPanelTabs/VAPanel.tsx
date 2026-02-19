import React, { Fragment } from 'react';
import { Spinner, Stack, StackItem } from '@patternfly/react-core';
import {
  ScalprumComponent,
  ScalprumComponentProps,
} from '@scalprum/react-core';

const VAPanel: React.FC<{
  setNewActionTitle: (title: string) => void;
}> = () => {
  const virtualAssistantProps: ScalprumComponentProps = {
    scope: 'virtualAssistant',
    module: './VAEmbed',
    fallback: (
      <Stack hasGutter className="pf-v6-u-h-100">
        <StackItem
          isFilled
          className="pf-v6-u-display-flex pf-v6-u-justify-content-center pf-v6-u-align-items-center"
        >
          <Spinner size="lg" />
        </StackItem>
      </Stack>
    ),
    ErrorComponent: <Fragment />,
  };

  return (
    <Stack hasGutter className="pf-v6-u-h-100">
      <StackItem isFilled className="pf-v6-u-overflow-hidden">
        <div className="pf-v6-u-h-100 pf-v6-u-overflow-y-auto">
          <ScalprumComponent {...virtualAssistantProps} />
        </div>
      </StackItem>
    </Stack>
  );
};

export default VAPanel;
