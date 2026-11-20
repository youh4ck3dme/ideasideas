import React, { useEffect, useState } from 'react';
import { Check, Download, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import type { SavedProject } from '../types/project';
import { formatSlovakDate, parseProjectsBackup, serializeProjectsBackup } from '../utils/projectLogic';
import { useI18n } from '../i18n';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projects: SavedProject[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onRenameProject: (id: string, newTitle: string) => void;
  onDeleteProject: (id: string) => void;
  onCreateNew: () => void;
  onImportProjects: (projects: SavedProject[]) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onRenameProject,
  onDeleteProject,
  onCreateNew,
  onImportProjects,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleExportAll = () => {
    const blob = new Blob([serializeProjectsBackup(projects)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ideaforge-zaloha-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const raw = await file.text();
    const result = parseProjectsBackup(raw);
    if ('error' in result) {
      setImportFeedback(result.error);
      return;
    }
    onImportProjects(result.projects);
    setImportFeedback(
      result.projects.length > 0
        ? `Importované projekty: ${result.projects.length}`
        : 'Záloha neobsahuje žiadne projekty.'
    );
  };

  if (!isOpen) return null;

  const startRename = (project: SavedProject) => {
    setEditingId(project.id);
    setDraftTitle(project.title);
  };

  const commitRename = (id: string) => {
    if (draftTitle.trim()) {
      onRenameProject(id, draftTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex justify-start bg-black/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="História uložených projektov"
      onClick={onClose}
    >
      <aside
        className="flex h-full w-full max-w-sm flex-col border-r border-[#E5E7EB] bg-white pt-[max(env(safe-area-inset-top),12px)] dark:border-[#27272A] dark:bg-[#111113]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#E5E7EB] px-4 dark:border-[#27272A]">
          <h2 className="text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
            {t('history.title', { count: projects.length })}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('history.closeAria')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#52525B] transition-transform hover:bg-[#F4F4F5] dark:text-[#A1A1AA] dark:hover:bg-[#27272A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Idea CTA */}
        <div className="border-b border-[#E5E7EB] p-4 dark:border-[#27272A]">
          <button
            type="button"
            onClick={() => {
              onCreateNew();
              onClose();
            }}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#2563EB] px-4 text-sm font-medium text-white transition-transform hover:bg-[#1D4ED8] active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            <span>Nový produktový nápad</span>
          </button>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportAll}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#52525B] transition-colors hover:bg-[#F4F4F5] hover:text-[#111827] dark:border-[#27272A] dark:bg-[#18181B] dark:text-[#A1A1AA] dark:hover:bg-[#27272A] dark:hover:text-[#F4F4F5]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t('history.backup')}</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#52525B] transition-colors hover:bg-[#F4F4F5] hover:text-[#111827] dark:border-[#27272A] dark:bg-[#18181B] dark:text-[#A1A1AA] dark:hover:bg-[#27272A] dark:hover:text-[#F4F4F5]"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{t('history.import')}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              aria-label={t('history.importAria')}
              onChange={handleImportFile}
            />
          </div>
          {importFeedback && (
            <p role="status" className="mt-2 text-xs text-[#52525B] dark:text-[#A1A1AA]">
              {importFeedback}
            </p>
          )}
        </div>

        {/* Saved Projects List */}
        <div className="custom-scrollbar flex-1 overflow-y-auto overscroll-contain p-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
          {projects.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-medium text-[#111827] dark:text-[#F4F4F5]">
                {t('history.emptyTitle')}
              </p>
              <p className="mt-1 text-xs text-[#52525B] dark:text-[#A1A1AA]">
                {t('history.emptyHint')}
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {projects.map((project) => {
                const isActive = project.id === activeProjectId;
                const isEditing = editingId === project.id;

                return (
                  <li
                    key={project.id}
                    className={`group rounded-xl border ${
                      isActive
                        ? 'border-[#2563EB]/40 bg-[#2563EB]/[0.06] dark:border-[#3B82F6]/40 dark:bg-[#3B82F6]/10'
                        : 'border-transparent hover:border-[#E5E7EB] hover:bg-[#FAFAFA] dark:hover:border-[#27272A] dark:hover:bg-[#18181B]'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 p-2.5">
                        <input
                          type="text"
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitRename(project.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          aria-label={`Nový názov pre projekt ${project.title}`}
                          autoFocus
                          className="h-9 min-w-0 flex-1 rounded-lg border border-[#2563EB] bg-white px-2.5 text-base text-[#111827] outline-hidden sm:text-sm dark:bg-[#09090B] dark:text-[#F4F4F5]"
                        />
                        <button
                          type="button"
                          onClick={() => commitRename(project.id)}
                          aria-label={`Uložiť názov pre ${project.title}`}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 p-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProject(project.id);
                            onClose();
                          }}
                          className="min-w-0 flex-1 text-left"
                        >
                          <p className="truncate text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
                            {project.title}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-[#52525B] dark:text-[#A1A1AA]">
                            <span>{project.input.projectType}</span>
                            <span aria-hidden="true">·</span>
                            <span>{project.input.budget}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{formatSlovakDate(project.updatedAt)}</span>
                          </p>
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startRename(project)}
                            aria-label={`Premenovať projekt ${project.title}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#52525B] transition-colors hover:bg-[#E5E7EB]/60 hover:text-[#111827] dark:text-[#A1A1AA] dark:hover:bg-[#27272A] dark:hover:text-[#F4F4F5]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProject(project.id)}
                            aria-label={`Odstrániť projekt ${project.title}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#52525B] transition-colors hover:bg-red-50 hover:text-red-600 dark:text-[#A1A1AA] dark:hover:bg-red-950/50 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
};
