import { QuickStartCatalogFilterCountWrapper } from '@patternfly/quickstarts';
import { Level, LevelItem, SearchInput } from '@patternfly/react-core';
import React from 'react';

import './CatalogFilter.scss';

const CatalogFilter = ({
  onSearchInputChange,
  quickStartsCount,
}: {
  onSearchInputChange: (value: string) => void;
  quickStartsCount: number;
}) => {
  return (
    <Level className="pf-v6-u-pt-sm pf-v6-u-pb-sm lr-c-catalog__filter">
      <LevelItem className="pfext-quick-start-catalog-filter__input pf-v6-u-flex-grow-1">
        <SearchInput
          placeholder="Filter by keywords..."
          onChange={(_ev, str) => onSearchInputChange(str)}
        />
      </LevelItem>
      <LevelItem className="lr-c-catalog__filter__count">
        <QuickStartCatalogFilterCountWrapper
          quickStartsCount={quickStartsCount}
        />
      </LevelItem>
    </Level>
  );
};

export default CatalogFilter;
