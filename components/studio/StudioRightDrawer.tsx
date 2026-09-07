'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Columns,
  Bot,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';
import {
  RightDrawerTab,
  TabConfig,
  MODULE_TABS,
  VIEW_DEFAULT_TABS,
  getActiveModuleCategory,
  StudioRightDrawerProps,
} from './drawer/types';
import { DRAWER_TAB_REGISTRY } from './drawer/registry';

// Re-export all types and configs so existing imports across the studio continue to work seamlessly
export type { RightDrawerTab, TabConfig, StudioRightDrawerProps };
export { MODULE_TABS, VIEW_DEFAULT_TABS, getActiveModuleCategory };

interface TabErrorBoundaryProps {
  tabName: string;
  children: React.ReactNode;
}

interface TabErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class TabErrorBoundary extends React.Component<TabErrorBoundaryProps, TabErrorBoundaryState> {
  constructor(props: TabErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): TabErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in drawer tab [${this.props.tabName}]:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-xl border border-red-900/40 bg-red-950/20 text-xs space-y-2 font-sans m-2">
          <div className="text-red-400 font-semibold font-mono flex items-center gap-1.5">
            <span>⚠️</span> Tab Rendering Error ({this.props.tabName})
          </div>
          <p className="text-zinc-400 text-[11px]">
            {this.state.error?.message || 'An unexpected error occurred while loading this tab.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono transition-colors"
          >
            Retry Tab
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function StudioRightDrawer({
  isOpen,
  onClose,
  width = 380,
  activeModule = 'streaming-live',
  isExpanded = false,
  onToggleExpand,
  requestedTab,
  onTabChange,
}: StudioRightDrawerProps) {
  // Determine current active module category
  const moduleCategory = useMemo(() => getActiveModuleCategory(activeModule), [activeModule]);
  const currentModuleTabs = useMemo(() => MODULE_TABS[moduleCategory], [moduleCategory]);

  const [activeTab, setActiveTab] = useState<RightDrawerTab>(() => {
    return VIEW_DEFAULT_TABS[activeModule]?.primary || 'stream-telemetry';
  });
  const [splitPane, setSplitPane] = useState(false);
  const [splitBottomTab, setSplitBottomTab] = useState<RightDrawerTab>(() => {
    return VIEW_DEFAULT_TABS[activeModule]?.companion || 'copilot';
  });

  const addToast = useStudioStore((s) => s.addToast);
  const prevActiveModuleRef = useRef<string>(activeModule);

  // Sync external tab request (e.g. clicking 💬 Copilot in top app bar or command palette)
  useEffect(() => {
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  // Dynamic Tab Router: updates available tabs and auto-selects appropriate tab when navigation changes
  useEffect(() => {
    const isModuleChange = prevActiveModuleRef.current !== activeModule;
    prevActiveModuleRef.current = activeModule;

    if (isModuleChange) {
      const defaultMapping = VIEW_DEFAULT_TABS[activeModule];
      if (defaultMapping) {
        setActiveTab(defaultMapping.primary);
        setSplitBottomTab(defaultMapping.companion);
        onTabChange?.(defaultMapping.primary);
      } else {
        const firstTab = currentModuleTabs[0]?.id || 'stream-telemetry';
        const secondTab = currentModuleTabs[1]?.id || 'copilot';
        setActiveTab(firstTab);
        setSplitBottomTab(secondTab);
        onTabChange?.(firstTab);
      }
    } else {
      // Ensure activeTab is valid in current module unless it is universal copilot
      const validTabs = currentModuleTabs.map((t) => t.id);
      if (!validTabs.includes(activeTab) && activeTab !== 'copilot') {
        const fallback = currentModuleTabs[0]?.id || 'stream-telemetry';
        setActiveTab(fallback);
        onTabChange?.(fallback);
      }
    }
  }, [activeModule, currentModuleTabs, onTabChange, activeTab]);

  if (!isOpen) return null;

  const renderTabContent = (tabKey: RightDrawerTab) => {
    const Component = DRAWER_TAB_REGISTRY[tabKey] || DRAWER_TAB_REGISTRY['copilot'];
    if (!Component) {
      return (
        <div className="p-4 text-xs text-zinc-400 font-mono">
          Tab [{tabKey}] currently unavailable.
        </div>
      );
    }
    return (
      <TabErrorBoundary tabName={tabKey}>
        <Component />
      </TabErrorBoundary>
    );
  };

  return (
    <div
      className="flex flex-col h-full bg-[#14151a] border-l border-white/[0.06] font-sans text-zinc-100 select-none z-20 relative overflow-hidden"
      style={{ width }}
    >
      {/* 1. TOP HEADER & MULTI-PANE ACTIONS */}
      <div className="h-13 border-b border-white/[0.06] px-3.5 flex items-center justify-between bg-[#14151a] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={15} className="text-[#E53558]" />
          <span className="font-semibold text-xs tracking-tight text-zinc-100 capitalize">
            {moduleCategory} Toolkit
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Copilot Jump Button */}
          <button
            onClick={() => {
              if (splitPane) {
                setSplitBottomTab('copilot');
              } else {
                setActiveTab('copilot');
              }
              addToast({ title: 'COPILOT ENGAGED', message: 'Ready to assist in current workspace.', type: 'info' });
            }}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
            title="Open AI Copilot"
          >
            <Bot size={13} />
          </button>

          {/* Split Pane Toggle Button */}
          <button
            onClick={() => setSplitPane(!splitPane)}
            className={`p-1.5 rounded-lg transition-colors ${
              splitPane ? 'text-[#3b82f6] bg-[#3b82f6]/10' : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            title={splitPane ? 'Close Split View' : 'Toggle Vertical Split Pane (Deck A / Deck B)'}
          >
            <Columns size={13} />
          </button>

          {/* 50-50 / Expand Toggle Button */}
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className={`p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors ${
                isExpanded ? 'text-[#3b82f6]' : 'text-zinc-400 hover:text-white'
              }`}
              title={isExpanded ? 'Collapse to 380px' : 'Expand 50-50 Half Screen'}
            >
              {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
            title="Close Right Drawer (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC MODULE-TAILORED TAB BAR (SINGLE PANE MODE) */}
      {!splitPane && (
        <div className="flex items-center border-b border-white/[0.06] bg-[#16181d] px-2.5 py-1.5 gap-1.5 overflow-x-auto custom-scrollbar flex-shrink-0 text-xs">
          {/* Universal Copilot Chip when copilot is active outside streaming */}
          {!currentModuleTabs.some((t) => t.id === activeTab) && activeTab === 'copilot' && (
            <button
              onClick={() => setActiveTab('copilot')}
              className="px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 bg-[#D8163F] text-white font-medium shadow-sm flex-shrink-0"
            >
              <Bot size={11} />
              <span>Copilot</span>
            </button>
          )}
          {currentModuleTabs.map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
                  isTabActive
                    ? 'bg-white/[0.08] text-white font-medium shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. MAIN WORKBENCH: FULL-HEIGHT vs VERTICAL SPLIT PANE */}
      {!splitPane ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 relative bg-[#14151a]">
          {renderTabContent(activeTab)}
        </div>
      ) : (
        /* VERTICAL SPLIT PANE (TOP DECK A + BOTTOM DECK B) */
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-[#14151a]">
          {/* TOP DECK A (PRIMARY CONTEXTUAL TOOL) */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-white/[0.06] bg-[#14151a] overflow-hidden">
            <div className="h-8 px-2.5 bg-[#16181d] border-b border-white/[0.06] flex items-center justify-between flex-shrink-0 text-xs gap-2">
              <div className="flex items-center gap-1.5 font-medium text-zinc-300 min-w-0 flex-shrink truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E53558] flex-shrink-0" />
                <span className="capitalize text-[11px] truncate">Deck A • {activeTab.replace('-', ' ')}</span>
              </div>

              {/* Module Tabs for Deck A */}
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar flex-shrink-0">
                {currentModuleTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                      activeTab === tab.id ? 'bg-[#E53558] text-white font-medium' : 'text-zinc-400 hover:text-white'
                    }`}
                    title={tab.label}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
              {renderTabContent(activeTab)}
            </div>
          </div>

          {/* SKEUOMORPHIC SPLIT DIVIDER & DECK B SELECTOR */}
          <div className="h-7 bg-[#16181d] border-y border-white/[0.06] px-2.5 flex items-center justify-between text-[10px] text-zinc-400 font-mono tracking-wider flex-shrink-0 gap-2">
            <span className="font-semibold text-zinc-300 truncate">DECK B</span>
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar flex-shrink-0">
              <button
                onClick={() => setSplitBottomTab('copilot')}
                className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                  splitBottomTab === 'copilot' ? 'text-white font-medium bg-[#3b82f6]' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Copilot
              </button>
              {currentModuleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSplitBottomTab(tab.id)}
                  className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                    splitBottomTab === tab.id ? 'text-white font-medium bg-[#3b82f6]' : 'text-zinc-400 hover:text-white'
                  }`}
                  title={tab.label}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* BOTTOM DECK B (SECONDARY TOOL) */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#14151a] overflow-y-auto custom-scrollbar p-3">
            {renderTabContent(splitBottomTab)}
          </div>
        </div>
      )}
    </div>
  );
}
