import { Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

import HelpPanelTabContainer from './HelpPanelTabs/HelpPanelTabContainer';
import QuickStartsPanel from './HelpPanelTabs/QuickStartsPanel';
import { TabType } from './HelpPanelTabs/helpPanelTabsMapper';
import { getOpenQuickstartInHelpPanelStore } from '../../store/openQuickstartInHelpPanelStore';
import { useGetState } from '@scalprum/react-core';
import { useFlag, useFlags } from '@unleash/proxy-client-react';
import { SearchIcon } from '@patternfly/react-icons';
import { AiChatbotIcon } from '../common/AiChatbotIcon';
import {
  QuickStartCloseModal,
  QuickStartStatus,
} from '@patternfly/quickstarts';
import type { AllQuickStartStates } from '@patternfly/quickstarts';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import fetchQuickstarts from '../../utils/fetchQuickstarts';
import type { ExtendedQuickstart } from '../../utils/fetchQuickstarts';
import { HelpPanelTabContent } from './HelpPanelLink';
import type { OpenQuickstartInHelpPanelState } from '../../store/openQuickstartInHelpPanelStore';

type TabDefinition = {
  id: string;
  title: ReactNode;
  tabType: TabType;
  featureFlag?: string;
  icon?: ReactNode;
  customContent?: ReactNode; // For custom content in tabs (from HelpPanelLink)
  /** Set when tabType is TabType.quickstart */
  quickstartId?: string;
};

export type HelpPanelCustomTabsRef = {
  openTabWithContent: (content: HelpPanelTabContent) => void;
};

// Define all main tabs in display order: Search, Learn, APIs, Support, Feedback, Chatbot
const createMainTabs = (showVA: boolean): TabDefinition[] => {
  const tabs: TabDefinition[] = [
    {
      id: 'search',
      title: 'Search',
      tabType: TabType.search,
      icon: <SearchIcon />,
      featureFlag: 'platform.chrome.help-panel_search',
    },
    {
      id: 'learn',
      title: 'Learn',
      tabType: TabType.learn,
    },
    {
      id: 'api',
      title: 'APIs',
      tabType: TabType.api,
    },
    {
      id: 'support',
      title: 'Support',
      tabType: TabType.support,
    },
    {
      id: 'feedback',
      title: 'Feedback',
      tabType: TabType.feedback,
    },
  ];

  // Add chatbot as the last tab if enabled
  if (showVA) {
    tabs.push({
      id: 'virtual-assistant',
      title: <AiChatbotIcon />,
      tabType: TabType.va,
    });
  }

  return tabs;
};

// Helper function to filter tabs based on feature flags
const filterTabsByFeatureFlags = (
  tabs: TabDefinition[],
  flags: ReturnType<typeof useFlags>
): TabDefinition[] => {
  return tabs.filter((tab) => {
    if (typeof tab.featureFlag === 'string') {
      return !!flags.find(({ name }) => name === tab.featureFlag)?.enabled;
    }
    return true;
  });
};

const HelpPanelCustomTabs = React.forwardRef<HelpPanelCustomTabsRef>(
  (_, ref) => {
    const chrome = useChrome();
    const vaFlag = useFlag('platform.chrome.help-panel_chatbot');
    const vaEnvFlag = useFlag('platform.va.environment.enabled');
    const flags = useFlags();
    const showVA = vaFlag && vaEnvFlag;

    // Create tabs and filter by feature flags
    const allTabs = useMemo(() => createMainTabs(showVA), [showVA]);
    const tabs = useMemo(
      () => filterTabsByFeatureFlags(allTabs, flags),
      [allTabs, flags]
    );

    // Default to first available tab (Search if enabled, otherwise Learn)
    const defaultTab = useMemo(() => {
      return tabs.find((t) => t.tabType === TabType.search) ?? tabs[0];
    }, [tabs]);

    const [activeTabId, setActiveTabId] = useState<string>(
      defaultTab?.id || 'learn'
    );

    // Quickstart state (for when quickstarts are opened as overlays)
    const [helpPanelQuickStarts, setHelpPanelQuickStarts] = useState<
      ExtendedQuickstart[]
    >([]);
    const [helpPanelQuickStartsLoading, setHelpPanelQuickStartsLoading] =
      useState(true);
    const [allQuickStartStates, setAllQuickStartStates] =
      useState<AllQuickStartStates>({});
    const [activeQuickstartId, setActiveQuickstartId] = useState<string | null>(
      null
    );
    const [closeModalOpen, setCloseModalOpen] = useState(false);

    const closeQuickstart = useCallback(() => {
      setActiveQuickstartId(null);
    }, []);

    const handleQuickstartDrawerClose = useCallback(
      (activeQuickStartStatus: string | number) => {
        if (activeQuickStartStatus === QuickStartStatus.IN_PROGRESS) {
          setCloseModalOpen(true);
        } else {
          closeQuickstart();
        }
      },
      [closeQuickstart]
    );

    // Load quickstarts for the panel
    useEffect(() => {
      let cancelled = false;
      setHelpPanelQuickStartsLoading(true);
      if (!chrome?.auth?.getUser) {
        setHelpPanelQuickStartsLoading(false);
        return () => {
          cancelled = true;
        };
      }
      chrome.auth
        .getUser()
        .then((user) => {
          if (!user || cancelled) {
            if (!cancelled) setHelpPanelQuickStartsLoading(false);
            return;
          }
          return fetchQuickstarts(chrome.auth.getUser, {}).then((data) => {
            if (!cancelled) {
              setHelpPanelQuickStarts(data);
              setHelpPanelQuickStartsLoading(false);
            }
          });
        })
        .catch((err) => {
          if (!cancelled) {
            setHelpPanelQuickStartsLoading(false);
            console.error('Help Panel: failed to load quickstarts', err);
          }
        });
      return () => {
        cancelled = true;
      };
    }, [chrome?.auth]);

    // Placeholder for setNewActionTitle - no longer used but kept for TabContainer API compatibility
    const setNewActionTitle = useCallback((title: string) => {
      // No-op: tabs are now static, titles don't change
      // This function is called by panel components but does nothing in single-tier structure
      void title; // Explicitly mark as intentionally unused
    }, []);

    // openTabWithContent is no longer supported - tabs are static
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const openTabWithContent = useCallback((_content: HelpPanelTabContent) => {
      console.warn(
        'openTabWithContent is no longer supported with static tabs. Custom content links may not work.'
      );
    }, []);

    // Expose methods to parent via ref
    useImperativeHandle(
      ref,
      () => ({
        openTabWithContent,
      }),
      [openTabWithContent]
    );

    // Handle quickstart opening requests
    const openQuickstartStore = getOpenQuickstartInHelpPanelStore();
    const openQuickstartState =
      useGetState<OpenQuickstartInHelpPanelState>(openQuickstartStore);

    useEffect(() => {
      const { pendingOpen } = openQuickstartState;
      if (!pendingOpen) return;
      const { quickstartId } = pendingOpen;

      // Open quickstart as an overlay (not as a separate tab)
      setActiveQuickstartId(quickstartId);

      openQuickstartStore.updateState('CONSUMED_OPEN');
    }, [openQuickstartState.pendingOpen, openQuickstartStore]);

    // Update active tab when tabs change (due to feature flags)
    useEffect(() => {
      const currentTab = tabs.find((t) => t.id === activeTabId);
      if (!currentTab && tabs.length > 0) {
        // Current active tab is no longer available, fall back to first tab
        setActiveTabId(tabs[0].id);
      }
    }, [tabs, activeTabId]);

    return (
      <>
        <div className="lr-c-help-panel-tabs-wrapper">
          <Tabs
            className="lr-c-help-panel-custom-tabs"
            isBox
            activeKey={activeTabId}
            onSelect={(_e, eventKey) => {
              if (typeof eventKey === 'string') {
                setActiveTabId(eventKey);
              }
            }}
            data-ouia-component-id="help-panel-tabs"
            variant="default"
          >
            {tabs.map((tab) => {
              const tabTitle = tab.title;

              return (
                <Tab
                  eventKey={tab.id}
                  key={tab.id}
                  title={<TabTitleText>{tab.icon || tabTitle}</TabTitleText>}
                  data-ouia-component-id={`help-panel-tab-${tab.id}`}
                  aria-label={
                    tab.tabType === TabType.va
                      ? 'Virtual Assistant'
                      : (tabTitle as string)
                  }
                >
                  <div className="lr-c-help-panel-tab-content">
                    <HelpPanelTabContainer
                      activeTabType={tab.tabType}
                      setNewActionTitle={setNewActionTitle}
                      customContent={tab.customContent}
                    />
                  </div>
                </Tab>
              );
            })}
          </Tabs>
        </div>
        {/* Quickstart overlay - rendered on top of tabs when a quickstart is opened */}
        {activeQuickstartId && (
          <div className="lr-c-help-panel-quickstart-overlay">
            <QuickStartsPanel
              activeQuickStartID={activeQuickstartId}
              quickStarts={helpPanelQuickStarts}
              loading={helpPanelQuickStartsLoading}
              allQuickStartStates={allQuickStartStates}
              setAllQuickStartStates={setAllQuickStartStates}
              onClose={handleQuickstartDrawerClose}
              onCloseNotInProgress={closeQuickstart}
            />
          </div>
        )}
        <QuickStartCloseModal
          isOpen={closeModalOpen}
          onConfirm={() => {
            closeQuickstart();
            setCloseModalOpen(false);
          }}
          onCancel={() => {
            setCloseModalOpen(false);
          }}
        />
      </>
    );
  }
);

HelpPanelCustomTabs.displayName = 'HelpPanelCustomTabs';

export default HelpPanelCustomTabs;
