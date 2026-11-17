import React, { useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { SavedProject } from '../types/project';
import { formatSlovakDate } from '../utils/projectLogic';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projects: SavedProject[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onRenameProject: (id: string, newTitle: string) => void;
  onDeleteProject: (id: string) => void;
  onCreateNew: () => void;
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
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

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
        className="flex h-full w-full max-w-sm flex-col border-r border-[#E5E7EB] bg-white pt-[env(safe-area-inset-top)] dark:border-[#27272A] dark:bg-[#111113]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#E5E7EB] px-4 dark:border-[#27272A]">
          <h2 className="text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
            Uložené projekty ({projects.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavrieť históriu projektov"
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
        </div>

        {/* Saved Projects List */}
        <div className="custom-scrollbar flex-1 overflow-y-auto overscroll-contain p-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
          {projects.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-medium text-[#111827] dark:text-[#F4F4F5]">
                Zatiaľ nemáte žiadne uložené projekty
              </p>
              <p className="mt-1 text-xs text-[#52525B] dark:text-[#A1A1AA]">
                Všetky vygenerované nápady sa sem automaticky uložia.
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
