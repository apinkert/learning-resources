import {
  Content,
  ContentVariants,
  Divider,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import './CatalogHeader.scss';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import messages from '../Messages';

const CatalogHeader = () => {
  // FIXME: Add missing type to the types lib
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { getBundleData } = useChrome();
  const { bundleTitle } = getBundleData();
  return (
    <div className="lr-c-catalog__header">
      <Flex>
        <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
          <div className="iconMinWidth-1-2-2">
            <img
              src="/apps/frontend-assets/technology-icons/learning-resources.svg"
              alt=""
            />
          </div>
        </FlexItem>
        <Divider orientation={{ default: 'vertical' }} />
        <FlexItem flex={{ default: 'flex_1' }}>
          <Title headingLevel="h1" size="2xl" className="pf-v6-u-mb-sm">
            <FormattedMessage {...messages.catalogHeaderTitle} />
          </Title>
          <Content component={ContentVariants.p}>
            <FormattedMessage
              {...messages.catalogHeaderDescription}
              values={{
                bundleTitle,
                a: (chunks) => (
                  <a
                    href="/learning-resources"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {chunks}
                  </a>
                ),
              }}
            />
          </Content>
        </FlexItem>
      </Flex>
    </div>
  );
};

export default CatalogHeader;
