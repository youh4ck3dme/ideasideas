import React, { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Download, Printer, X } from 'lucide-react';
import type { SavedProject } from '../types/project';
import { exportProjectToMarkdown } from '../utils/projectLogic';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: SavedProject;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, project }) => {
  const [copied, setCopied] = useState(false);

  const markdown = useMemo(() => exportProjectToMarkdown(project), [project]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  const handleDownloadMarkdown = () => {
    const slug = project.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const filename = `${slug || 'ideaforge-projekt'}.md`;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 120);
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 pt-[max(16px,env(safe-area-inset-top))] pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85dvh] w-full max-w-2xl flex-col rounded-2xl border border-[#E5E7EB] bg-white dark:border-[#27272A] dark:bg-[#111113]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4 dark:border-[#27272A]">
          <div>
            <h2 id="export-modal-title" className="text-base font-semibold text-[#111827] dark:text-[#F4F4F5]">
              Exportovať projekt
            </h2>
            <p className="mt-0.5 text-xs text-[#52525B] dark:text-[#A1A1AA]">
              Kompletný dokument všetkých 5 sekcií pre „{project.title}“
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavrieť export"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#52525B] transition-colors hover:bg-[#F4F4F5] dark:text-[#A1A1AA] dark:hover:bg-[#27272A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] px-6 py-3.5 dark:border-[#27272A]">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#2563EB] px-4 text-xs font-medium text-white transition-colors hover:bg-[#1D4ED8] active:scale-[0.98]"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Skopírované do schránky' : 'Kopírovať Markdown'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 text-xs font-medium text-[#111827] transition-colors hover:bg-[#F4F4F5] active:scale-[0.98] dark:border-[#27272A] dark:bg-[#18181B] dark:text-[#F4F4F5] dark:hover:bg-[#27272A]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Stiahnuť .md</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 text-xs font-medium text-[#111827] transition-colors hover:bg-[#F4F4F5] active:scale-[0.98] dark:border-[#27272A] dark:bg-[#18181B] dark:text-[#F4F4F5] dark:hover:bg-[#27272A]"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Tlačiť / PDF</span>
          </button>
        </div>

        {/* Preview */}
        <div className="custom-scrollbar flex-1 overflow-y-auto overscroll-contain p-6">
          <pre className="whitespace-pre-wrap rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 font-mono text-xs leading-relaxed text-[#111827] dark:border-[#27272A] dark:bg-[#09090B] dark:text-[#D4D4D8]">
            {markdown}
          </pre>
        </div>
      </div>
    </div>
  );
};
