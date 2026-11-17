import React from 'react';
import { Check } from 'lucide-react';
import type { RoadmapSection } from '../../types/project';
import { calculatePhaseProgress, calculateRoadmapProgress } from '../../utils/projectLogic';

interface RoadmapTabProps {
  data: RoadmapSection;
  onToggleItem: (phaseNumber: number, itemId: string) => void;
}

export const RoadmapTab: React.FC<RoadmapTabProps> = ({ data, onToggleItem }) => {
  const overall = calculateRoadmapProgress(data.phases);

  return (
    <div className="space-y-6">
      {/* Live Completion Progress Header */}
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-[#27272A] dark:bg-[#111113]">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-[#111827] dark:text-[#F4F4F5]">
              Realizačná roadmapa produktu
            </h2>
            <p className="mt-1 text-sm text-[#52525B] dark:text-[#A1A1AA]">
              Od prvotnej validácie dopytu až po stabilný produkt pripravený na rast.
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono text-2xl font-bold tabular-nums text-[#111827] dark:text-[#F4F4F5]">
              {overall.percentage}%
            </span>
            <p className="font-mono text-xs tabular-nums text-[#52525B] dark:text-[#A1A1AA]">
              {overall.completed} z {overall.total} úloh splnených
            </p>
          </div>
        </div>

        <div
          className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#F4F4F5] dark:bg-[#27272A]"
          role="progressbar"
          aria-valuenow={overall.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Celkový postup realizácie"
        >
          <div
            className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
            style={{ width: `${overall.percentage}%` }}
          />
        </div>
      </section>

      {/* 3 Phases */}
      <div className="space-y-4">
        {data.phases.map((phase) => {
          const stats = calculatePhaseProgress(phase);
          return (
            <section
              key={phase.phaseNumber}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-[#27272A] dark:bg-[#111113]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#52525B] dark:text-[#A1A1AA]">
                    <span className="font-mono font-semibold text-[#2563EB] dark:text-[#3B82F6]">
                      0{phase.phaseNumber}.
                    </span>
                    <span className="font-mono tabular-nums">{phase.duration}</span>
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-[#111827] dark:text-[#F4F4F5]">
                    {phase.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#52525B] dark:text-[#A1A1AA]">{phase.goal}</p>
                </div>

                <span className="font-mono text-xs font-medium tabular-nums text-[#52525B] dark:text-[#A1A1AA]">
                  {stats.completed}/{stats.total}
                </span>
              </div>

              <ul className="mt-5 divide-y divide-[#E5E7EB] border-t border-[#E5E7EB] dark:divide-[#27272A] dark:border-[#27272A]">
                {phase.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onToggleItem(phase.phaseNumber, item.id)}
                      role="checkbox"
                      aria-checked={item.done}
                      className="flex min-h-[48px] w-full items-center gap-3.5 py-3 text-left transition-colors hover:bg-[#FAFAFA] active:scale-[0.995] dark:hover:bg-[#18181B]/60"
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          item.done
                            ? 'border-[#2563EB] bg-[#2563EB] text-white'
                            : 'border-[#D4D4D8] bg-white dark:border-[#3F3F46] dark:bg-[#09090B]'
                        }`}
                      >
                        {item.done && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                      </span>
                      <span
                        className={`text-sm leading-relaxed transition-colors ${
                          item.done
                            ? 'text-[#71717A] line-through dark:text-[#71717A]'
                            : 'text-[#111827] dark:text-[#E4E4E7]'
                        }`}
                      >
                        {item.text}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
};
