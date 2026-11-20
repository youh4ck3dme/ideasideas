import React, { useEffect, useState } from 'react';
import {
  CheckSquare,
  Cpu,
  Megaphone,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { SavedProject, WorkspaceTabKey } from '../types/project';
import { PromoTab } from './tabs/PromoTab';
import { RoadmapTab } from './tabs/RoadmapTab';
import { TechTab } from './tabs/TechTab';
import { MarketingTab } from './tabs/MarketingTab';
import { AntiFailTab } from './tabs/AntiFailTab';
import { RefineBar } from './RefineBar';

interface WorkspaceScreenProps {
  project: SavedProject;
  activeTab: WorkspaceTabKey;
  onSelectTab: (tab: WorkspaceTabKey) => void;
  onToggleRoadmapItem: (phaseNumber: number, itemId: string) => void;
  onToggleMarketingTask: (taskId: string) => void;
  onRefineSection: (tabKey: WorkspaceTabKey, instruction: string) => Promise<void>;
  onRetryRefine?: () => void;
  isRefining: boolean;
  refineError: string | null;
  isKeyboardOpen: boolean;
}

interface TabDef {
  key: WorkspaceTabKey;
  label: string;
  mobileLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabDef[] = [
  { key: 'promo', label: 'Promo & Koncept', mobileLabel: 'Koncept', icon: Sparkles },
  { key: 'roadmap', label: 'Realizácia', mobileLabel: 'Plán', icon: CheckSquare },
  { key: 'tech', label: 'Technický návrh', mobileLabel: 'Tech', icon: Cpu },
  { key: 'marketing', label: 'Marketingový plán', mobileLabel: 'Trh', icon: Megaphone },
  { key: 'antifail', label: 'Anti-Fail & Škálovanie', mobileLabel: 'Rast', icon: ShieldAlert },
];

export const WorkspaceScreen: React.FC<WorkspaceScreenProps> = ({
  project,
  activeTab,
  onSelectTab,
  onToggleRoadmapItem,
  onToggleMarketingTask,
  onRefineSection,
  onRetryRefine,
  isRefining,
  refineError,
  isKeyboardOpen,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const mainScrollRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [activeTab, project.id]);

  useEffect(() => {
    const onBeforePrint = () => setIsPrinting(true);
    const onAfterPrint = () => setIsPrinting(false);
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, []);

  const activeTabMeta = TABS.find((t) => t.key === activeTab) ?? TABS[0];

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      {/* Main Interactive Workspace (Screen + Print Hidden Wrapper) */}
      <div className="no-print mx-auto flex min-h-0 w-full min-w-0 max-w-[1120px] flex-1 overflow-hidden">
        {/* Desktop Left Navigation Rail (>= 768px) */}
        <aside
          aria-label="Sekcie projektu"
          className="hidden w-60 shrink-0 flex-col border-r border-[#E5E7EB] px-3 py-6 dark:border-[#27272A] md:flex"
        >
          <div className="mb-5 px-3">
            <p className="truncate text-sm font-bold text-[#111827] dark:text-[#F4F4F5]">
              {project.title}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[#52525B] dark:text-[#A1A1AA]">
              <span>{project.input.projectType}</span>
              <span aria-hidden="true">·</span>
              <span>{project.input.budget}</span>
            </p>
          </div>

          <nav className="space-y-1" role="tablist" aria-orientation="vertical">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onSelectTab(tab.key)}
                  className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-transform active:scale-[0.99] whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#111827] text-white dark:bg-[#F4F4F5] dark:text-[#111827]'
                      : 'text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#111827] dark:text-[#A1A1AA] dark:hover:bg-[#18181B] dark:hover:text-[#F4F4F5]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-[#E5E7EB] px-3 pt-4 dark:border-[#27272A]">
            <p className="text-[11px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Cieľová skupina</p>
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
              {project.input.targetAudience || 'Široká verejnosť'}
            </p>
          </div>
        </aside>

        {/* Scrollable Tab Content Area */}
        <main
          ref={mainScrollRef}
          role="tabpanel"
          aria-label={activeTabMeta.label}
          className={`app-scroll-viewport custom-scrollbar min-w-0 w-full max-w-full scroll-pb-28 px-4 pt-5 sm:px-8 sm:py-8 md:scroll-pb-8 md:pb-8 ${
            isKeyboardOpen ? 'pb-6' : 'pb-[calc(80px+env(safe-area-inset-bottom))]'
          }`}
        >
          {activeTab === 'promo' && <PromoTab data={project.blueprint.promo} />}
          {activeTab === 'roadmap' && (
            <RoadmapTab data={project.blueprint.roadmap} onToggleItem={onToggleRoadmapItem} />
          )}
          {activeTab === 'tech' && <TechTab data={project.blueprint.tech} />}
          {activeTab === 'marketing' && (
            <MarketingTab
              data={project.blueprint.marketing}
              onToggleTask={onToggleMarketingTask}
            />
          )}
          {activeTab === 'antifail' && <AntiFailTab data={project.blueprint.antifail} />}

          <RefineBar
            tabKey={activeTab}
            tabLabel={activeTabMeta.label}
            isRefining={isRefining}
            error={refineError}
            onRefine={(instruction) => onRefineSection(activeTab, instruction)}
            onRetry={onRetryRefine}
          />
        </main>
      </div>

      {/* Fixed Mobile Flutter-Style Bottom Navigation Bar (< 768px, 64px + safe-area) */}
      <nav
        aria-label="Hlavná navigácia sekcií"
        role="tablist"
        className={`no-print fixed bottom-0 left-0 right-0 z-30 grid h-[calc(64px+env(safe-area-inset-bottom))] w-full max-w-full grid-cols-5 items-stretch overflow-hidden border-t border-[#E5E7EB] bg-[#FAFAFA] px-1 pb-[env(safe-area-inset-bottom)] dark:border-[#27272A] dark:bg-[#09090B] md:hidden ${
          isKeyboardOpen ? 'hidden' : ''
        }`}
      >
        {TABS.map((tab) => {
          const Icon = tab.key === 'antifail' ? TrendingUp : tab.icon;
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-label={tab.label}
              onClick={() => onSelectTab(tab.key)}
              className={`flex min-h-[44px] min-w-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl px-0.5 py-1.5 transition-transform active:scale-[0.96] ${
                isSelected
                  ? 'text-[#2563EB] dark:text-[#3B82F6]'
                  : 'text-[#52525B] dark:text-[#A1A1AA]'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="max-w-full truncate px-0.5 text-[10px] font-medium leading-none tracking-tight">
                {tab.mobileLabel}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Print-Ready Complete PDF View (mounted during print) */}
      {isPrinting && (
        <div className="hidden print:block print:p-8 print:space-y-8">
          <header className="border-b border-gray-300 pb-4">
            <h1 className="text-3xl font-bold text-black">{project.title}</h1>
            <p className="mt-1 text-base text-gray-700">{project.blueprint.promo.tagline}</p>
            <p className="mt-2 text-xs text-gray-500">
              {project.input.projectType} · Rozpočet: {project.input.budget} · Cieľovka:{' '}
              {project.input.targetAudience || 'Všeobecná'}
            </p>
          </header>

          <div className="space-y-8">
            <PromoTab data={project.blueprint.promo} />
            <RoadmapTab data={project.blueprint.roadmap} onToggleItem={() => {}} />
            <TechTab data={project.blueprint.tech} />
            <MarketingTab data={project.blueprint.marketing} onToggleTask={() => {}} />
            <AntiFailTab data={project.blueprint.antifail} />
          </div>
        </div>
      )}
    </div>
  );
};
