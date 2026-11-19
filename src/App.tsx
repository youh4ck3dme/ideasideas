import { useEffect, useState } from 'react';
import type { IdeaContextInput, SavedProject, WorkspaceTabKey } from './types/project';
import { SAMPLE_PROJECT } from './data/sampleProjects';
import {
  createSavedProject,
  deleteProjectFromHistory,
  renameProjectInHistory,
  toggleMarketingTask,
  toggleRoadmapItem,
  updateBlueprintSection,
  upsertProjectInHistory,
} from './utils/projectLogic';
import { TopAppBar } from './components/TopAppBar';
import { OfflineBanner } from './components/OfflineBanner';
import { IdeaCaptureScreen } from './components/IdeaCaptureScreen';
import { WorkspaceScreen } from './components/WorkspaceScreen';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ExportModal } from './components/ExportModal';
import { ErrorToast } from './components/ErrorToast';
import { SWUpdateToast } from './components/SWUpdateToast';
import { useVisualViewport } from './hooks/useVisualViewport';

const STORAGE_PROJECTS_KEY = 'ideaforge_projects_v1';
const STORAGE_ACTIVE_ID_KEY = 'ideaforge_active_project_v1';
const STORAGE_THEME_KEY = 'ideaforge_theme';

function loadInitialProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to sample seed
  }
  return [SAMPLE_PROJECT];
}

function loadInitialTheme(): 'light' | 'dark' {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  return 'light';
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(loadInitialTheme);
  const [projects, setProjects] = useState<SavedProject[]>(loadInitialProjects);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      return loadInitialProjects()[0]?.id ?? null;
    }
    try {
      return localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState<WorkspaceTabKey>('promo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [lastFailedGenerateInput, setLastFailedGenerateInput] = useState<IdeaContextInput | null>(null);
  const [lastFailedRefine, setLastFailedRefine] = useState<{
    tabKey: WorkspaceTabKey;
    instruction: string;
  } | null>(null);
  const { isKeyboardOpen, keyboardViewportHeight } = useVisualViewport();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    } catch {
      // Storage quota ignored
    }
  }, [projects]);

  useEffect(() => {
    try {
      if (activeProjectId) {
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeProjectId);
      } else {
        localStorage.removeItem(STORAGE_ACTIVE_ID_KEY);
      }
    } catch {
      // Ignore storage error
    }
  }, [activeProjectId]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    } catch {
      // Ignore storage error
    }
  }, [theme]);

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  const handleGenerate = async (input: IdeaContextInput) => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Nepodarilo sa vygenerovať návrh projektu.');
      }
      const created = createSavedProject(input, payload.blueprint);
      setProjects((prev) => upsertProjectInHistory(prev, created));
      setActiveProjectId(created.id);
      setActiveTab('promo');
      setRefineError(null);
      setLastFailedGenerateInput(null);
    } catch (err) {
      setLastFailedGenerateInput(input);
      setGenerateError(
        err instanceof Error ? err.message : 'Pri komunikácii so serverom nastala chyba.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefineSection = async (tabKey: WorkspaceTabKey, instruction: string) => {
    if (!activeProject) return;
    setIsRefining(true);
    setRefineError(null);
    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: activeProject,
          tabKey,
          instruction,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Nepodarilo sa upraviť túto sekciu.');
      }
      const updatedProject = updateBlueprintSection(activeProject, tabKey, payload.sectionData);
      setProjects((prev) => upsertProjectInHistory(prev, updatedProject));
      setLastFailedRefine(null);
    } catch (err) {
      setLastFailedRefine({ tabKey, instruction });
      setRefineError(
        err instanceof Error ? err.message : 'Pri úprave sekcie nastala neočakávaná chyba.'
      );
    } finally {
      setIsRefining(false);
    }
  };

  const handleToggleRoadmapItem = (phaseNumber: number, itemId: string) => {
    if (!activeProject) return;
    const updated = toggleRoadmapItem(activeProject, phaseNumber, itemId);
    setProjects((prev) => upsertProjectInHistory(prev, updated));
  };

  const handleToggleMarketingTask = (taskId: string) => {
    if (!activeProject) return;
    const updated = toggleMarketingTask(activeProject, taskId);
    setProjects((prev) => upsertProjectInHistory(prev, updated));
  };

  const handleRenameProject = (id: string, newTitle: string) => {
    setProjects((prev) => renameProjectInHistory(prev, id, newTitle));
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => deleteProjectFromHistory(prev, id));
    if (activeProjectId === id) {
      setActiveProjectId(null);
    }
  };

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    setActiveTab('promo');
    setRefineError(null);
  };

  const handleGoHome = () => {
    setActiveProjectId(null);
    setGenerateError(null);
    setRefineError(null);
  };

  const handleOpenSampleProject = () => {
    const first = projects[0];
    if (first) {
      handleSelectProject(first.id);
    }
  };

  return (
    <div
      style={
        keyboardViewportHeight
          ? { height: `${keyboardViewportHeight}px`, maxHeight: `${keyboardViewportHeight}px` }
          : undefined
      }
      className="flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[#FAFAFA] text-[#111827] dark:bg-[#09090B] dark:text-[#F4F4F5]"
    >
      <TopAppBar
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onGoHome={handleGoHome}
        projectTitle={activeProject?.title}
        historyCount={projects.length}
        isWorkspace={Boolean(activeProject)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      <OfflineBanner />

      {activeProject ? (
        <WorkspaceScreen
          project={activeProject}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setRefineError(null);
            setLastFailedRefine(null);
          }}
          onToggleRoadmapItem={handleToggleRoadmapItem}
          onToggleMarketingTask={handleToggleMarketingTask}
          onRefineSection={handleRefineSection}
          onRetryRefine={
            lastFailedRefine
              ? () => handleRefineSection(lastFailedRefine.tabKey, lastFailedRefine.instruction)
              : undefined
          }
          isRefining={isRefining}
          refineError={refineError}
          isKeyboardOpen={isKeyboardOpen}
        />
      ) : (
        <main className="app-scroll-viewport custom-scrollbar pb-[calc(24px+env(safe-area-inset-bottom))]">
          <IdeaCaptureScreen
            isGenerating={isGenerating}
            error={generateError}
            onGenerate={handleGenerate}
            onRetry={
              lastFailedGenerateInput ? () => handleGenerate(lastFailedGenerateInput) : undefined
            }
            onOpenSampleProject={handleOpenSampleProject}
            hasSampleProject={projects.length > 0}
          />
        </main>
      )}

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
        onCreateNew={handleGoHome}
      />

      {activeProject && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          project={activeProject}
        />
      )}

      <SWUpdateToast />

      <ErrorToast
        message={activeProject ? refineError : generateError}
        hasBottomNav={Boolean(activeProject)}
        onRetry={
          activeProject
            ? lastFailedRefine
              ? () => handleRefineSection(lastFailedRefine.tabKey, lastFailedRefine.instruction)
              : undefined
            : lastFailedGenerateInput
            ? () => handleGenerate(lastFailedGenerateInput)
            : undefined
        }
        onDismiss={() => {
          if (activeProject) {
            setRefineError(null);
          } else {
            setGenerateError(null);
          }
        }}
      />
    </div>
  );
}
