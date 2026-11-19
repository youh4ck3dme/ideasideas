import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import type { BudgetLevel, IdeaContextInput, ProjectType } from '../types/project';
import { IDEA_EXAMPLES } from '../data/sampleProjects';
import { validateIdeaInput } from '../utils/projectLogic';
import { scrollBehavior } from '../utils/motion';

interface IdeaCaptureScreenProps {
  isGenerating: boolean;
  error?: string | null;
  onGenerate: (input: IdeaContextInput) => Promise<void>;
  onRetry?: () => void;
  onOpenSampleProject: () => void;
  hasSampleProject: boolean;
}

const BUDGET_OPTIONS: BudgetLevel[] = ['Nízky', 'Stredný', 'Startup'];
const PROJECT_TYPE_OPTIONS: ProjectType[] = ['SaaS', 'Mobilná appka', 'E-commerce', 'Služba'];

const ARCHITECTING_STEPS = [
  {
    title: '01. Promo & Koncept značky',
    detail: 'Názov projektu, slogan, hero texty, 3 promo príspevky a farebná paleta',
  },
  {
    title: '02. Realizačná roadmapa',
    detail: '3 fázy od validácie cez MVP po finálny produkt s kontrolným zoznamom',
  },
  {
    title: '03. Technický návrh architektúry',
    detail: 'Tech stack, dátové entity, API endpointy, bezpečnosť a odhad nákladov',
  },
  {
    title: '04. Marketingový plán a monetizácia',
    detail: 'Cenotvorba v EUR, prvých 30 dní, akvizícia 100 používateľov a metriky',
  },
  {
    title: '05. Anti-Fail analýza a škálovanie',
    detail: '5 kritických rizík, 5 železných pravidiel a plán rastu 100 → 10 000',
  },
];

export const IdeaCaptureScreen: React.FC<IdeaCaptureScreenProps> = ({
  isGenerating,
  error,
  onGenerate,
  onRetry,
  onOpenSampleProject,
  hasSampleProject,
}) => {
  const [idea, setIdea] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [budget, setBudget] = useState<BudgetLevel>('Nízky');
  const [projectType, setProjectType] = useState<ProjectType>('SaaS');
  const [showContext, setShowContext] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setActiveStepIndex(0);
      return;
    }
    const timer = window.setInterval(() => {
      setActiveStepIndex((prev) => (prev < ARCHITECTING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  const handleSelectExample = (index: number) => {
    const ex = IDEA_EXAMPLES[index];
    if (!ex) return;
    setIdea(ex.idea);
    setTargetAudience(ex.targetAudience);
    setBudget(ex.budget);
    setProjectType(ex.projectType);
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateIdeaInput(idea);
    if (!check.valid) {
      setValidationError(check.error ?? 'Zadaj platný opis nápadu.');
      return;
    }
    setValidationError(null);
    await onGenerate({
      idea: idea.trim(),
      targetAudience: targetAudience.trim(),
      budget,
      projectType,
    });
  };

  if (isGenerating) {
    const progressPercent = Math.min(95, (activeStepIndex + 1) * 19);
    const currentStep = ARCHITECTING_STEPS[activeStepIndex] ?? ARCHITECTING_STEPS[0];

    return (
      <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-4 py-8 sm:px-6">
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-[#27272A] dark:bg-[#111113] sm:p-8"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#2563EB]" />
              <div>
                <h1 className="text-lg font-semibold text-[#111827] dark:text-[#F4F4F5]">
                  Navrhujem architektúru produktu
                </h1>
                <p className="mt-0.5 text-xs text-[#52525B] dark:text-[#A1A1AA]">
                  Krok {activeStepIndex + 1} z {ARCHITECTING_STEPS.length} · {projectType} · Rozpočet{' '}
                  {budget.toLowerCase()}
                </p>
              </div>
            </div>
            <span className="shrink-0 whitespace-nowrap font-mono text-xs font-semibold tabular-nums text-[#2563EB] dark:text-[#3B82F6]">
              {progressPercent} %
            </span>
          </div>

          <div
            aria-label="Priebeh generovania návrhu"
            className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#F4F4F5] dark:bg-[#27272A]"
          >
            <div
              className="h-full rounded-full bg-[#2563EB] transition-[width] duration-500 dark:bg-[#3B82F6]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="mt-3 text-xs text-[#52525B] dark:text-[#A1A1AA]">
            Práve spracúvam: <span className="font-medium text-[#111827] dark:text-[#F4F4F5]">{currentStep.detail}</span>
          </p>

          <div className="mt-5 divide-y divide-[#E5E7EB] border-t border-[#E5E7EB] dark:divide-[#27272A] dark:border-[#27272A]">
            {ARCHITECTING_STEPS.map((step, idx) => {
              const isDone = idx < activeStepIndex;
              const isCurrent = idx === activeStepIndex;
              return (
                <div key={step.title} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        isDone || isCurrent
                          ? 'text-[#111827] dark:text-[#F4F4F5]'
                          : 'text-[#A1A1AA] dark:text-[#52525B]'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-[#71717A] dark:text-[#71717A]">
                      {step.detail}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 font-mono text-xs ${
                      isDone
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isCurrent
                        ? 'text-[#2563EB] dark:text-[#3B82F6]'
                        : 'text-[#A1A1AA] dark:text-[#52525B]'
                    }`}
                  >
                    {isDone && <Check className="h-3.5 w-3.5" />}
                    <span>{isDone ? 'Hotovo' : isCurrent ? 'Spracúvam...' : 'Čaká'}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const displayedError = validationError || error;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
      {/* Hero Heading */}
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-medium tracking-wide text-[#2563EB] dark:text-[#3B82F6]">
          AI Architekt nápadov na produkty
        </p>
        <h1 className="mt-2 text-balance text-2xl font-bold tracking-tight text-[#111827] dark:text-[#F4F4F5] sm:text-4xl sm:leading-[1.15]">
          Premeň surový nápad na jasný produktový plán
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#52525B] dark:text-[#A1A1AA] sm:text-base">
          Získaj kompletný koncept značky, realizačnú roadmapu, technickú architektúru, marketing a ochranu pred chybami za pár sekúnd.
        </p>
      </div>

      {/* Main Prompt Container */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#E5E7EB] bg-white focus-within:border-[#2563EB] dark:border-[#27272A] dark:bg-[#111113] dark:focus-within:border-[#3B82F6]"
      >
        <div className="p-4 sm:p-5">
          <label htmlFor="idea-prompt-input" className="sr-only">
            Opíš svoj nápad na produkt, službu alebo aplikáciu
          </label>
          <textarea
            id="idea-prompt-input"
            rows={4}
            value={idea}
            onChange={(e) => {
              setIdea(e.target.value);
              if (validationError) setValidationError(null);
            }}
            onFocus={(e) => {
              const el = e.currentTarget;
              window.setTimeout(() => {
                el.scrollIntoView({ block: 'center', behavior: scrollBehavior() });
              }, 150);
            }}
            placeholder="Opíš svoj nápad na produkt, službu alebo aplikáciu..."
            className="w-full resize-none bg-transparent text-base leading-relaxed text-[#111827] placeholder-[#71717A] focus:outline-hidden dark:text-[#F4F4F5] dark:placeholder-[#71717A]"
          />

          {/* Collapsible Context Toggle */}
          <div className="mt-3 border-t border-[#E5E7EB] pt-3 dark:border-[#27272A]">
            <button
              type="button"
              onClick={() => setShowContext((v) => !v)}
              aria-expanded={showContext}
              className="inline-flex min-h-[40px] items-center gap-2 text-xs font-medium text-[#52525B] hover:text-[#111827] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>
                Kontext: {projectType} · Rozpočet {budget.toLowerCase()}
                {targetAudience.trim() ? ` · ${targetAudience.trim()}` : ''}
              </span>
              {showContext ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {showContext && (
              <div className="mt-3 space-y-4 border-t border-[#E5E7EB] pt-4 dark:border-[#27272A]">
                <div>
                  <label
                    htmlFor="target-audience-input"
                    className="block text-xs font-medium text-[#52525B] dark:text-[#A1A1AA]"
                  >
                    Cieľová skupina (voliteľné)
                  </label>
                  <input
                    id="target-audience-input"
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    onFocus={(e) => {
                      const el = e.currentTarget;
                      window.setTimeout(() => {
                        el.scrollIntoView({ block: 'center', behavior: scrollBehavior() });
                      }, 150);
                    }}
                    placeholder="Napr. slovenskí živnostníci, lokálne kaviarne, rodičia..."
                    className="mt-1.5 h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-3 text-base text-[#111827] placeholder-[#71717A] focus:border-[#2563EB] focus:bg-white focus:outline-hidden dark:border-[#27272A] dark:bg-[#09090B] dark:text-[#F4F4F5] dark:focus:border-[#3B82F6] sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <span className="block text-xs font-medium text-[#52525B] dark:text-[#A1A1AA]">
                      Rozpočet
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5" role="group" aria-label="Rozpočet">
                      {BUDGET_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setBudget(option)}
                          aria-pressed={budget === option}
                          className={`h-9 rounded-full px-3.5 text-xs font-medium whitespace-nowrap shrink-0 ${
                            budget === option
                              ? 'bg-[#111827] text-white dark:bg-[#F4F4F5] dark:text-[#111827]'
                              : 'border border-[#E5E7EB] bg-[#FAFAFA] text-[#52525B] hover:text-[#111827] dark:border-[#27272A] dark:bg-[#18181B] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-[#52525B] dark:text-[#A1A1AA]">
                      Typ projektu
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5" role="group" aria-label="Typ projektu">
                      {PROJECT_TYPE_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setProjectType(option)}
                          aria-pressed={projectType === option}
                          className={`h-9 rounded-full px-3.5 text-xs font-medium whitespace-nowrap shrink-0 ${
                            projectType === option
                              ? 'bg-[#111827] text-white dark:bg-[#F4F4F5] dark:text-[#111827]'
                              : 'border border-[#E5E7EB] bg-[#FAFAFA] text-[#52525B] hover:text-[#111827] dark:border-[#27272A] dark:bg-[#18181B] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Submit Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 rounded-b-2xl dark:border-[#27272A] dark:bg-[#18181B]/60 sm:px-5">
          <span className="font-mono text-xs tabular-nums text-[#71717A]">
            {idea.trim().length} / 2500 znakov
          </span>

          <button
            type="submit"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#2563EB] px-5 text-sm font-medium text-white transition-transform hover:bg-[#1D4ED8] active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            <span>Navrhnúť architektúru</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Client-side Validation Error Message (Server errors are surfaced via ErrorToast) */}
      {validationError && (
        <div
          role="alert"
          className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          {validationError}
        </div>
      )}

      {/* 3 Clickable Example Idea Chips */}
      <div className="mt-6">
        <p className="text-xs font-medium text-[#52525B] dark:text-[#A1A1AA]">
          Vyskúšať na príklade jedným kliknutím:
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {IDEA_EXAMPLES.map((example, idx) => (
            <button
              key={example.label}
              type="button"
              onClick={() => handleSelectExample(idx)}
              className="inline-flex h-10 items-center rounded-full border border-[#E5E7EB] bg-white px-4 text-xs font-medium text-[#111827] transition-transform hover:border-[#2563EB]/50 hover:bg-[#F4F4F5] active:scale-[0.98] dark:border-[#27272A] dark:bg-[#111113] dark:text-[#F4F4F5] dark:hover:border-[#3B82F6]/50 dark:hover:bg-[#18181B] whitespace-nowrap shrink-0"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Link to Sample Blueprint */}
      {hasSampleProject && (
        <div className="mt-6 border-t border-[#E5E7EB] pt-5 dark:border-[#27272A]">
          <button
            type="button"
            onClick={onOpenSampleProject}
            className="text-xs font-medium text-[#52525B] underline-offset-4 transition-colors hover:text-[#2563EB] hover:underline dark:text-[#A1A1AA] dark:hover:text-[#3B82F6]"
          >
            Prezrieť ukážkový hotový projekt v pracovnom priestore →
          </button>
        </div>
      )}
    </div>
  );
};
