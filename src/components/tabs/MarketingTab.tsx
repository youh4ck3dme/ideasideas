import React from 'react';
import { Check } from 'lucide-react';
import type { MarketingSection } from '../../types/project';
import { calculateMarketingProgress } from '../../utils/projectLogic';

interface MarketingTabProps {
  data: MarketingSection;
  onToggleTask: (taskId: string) => void;
}

export const MarketingTab: React.FC<MarketingTabProps> = ({ data, onToggleTask }) => {
  const launchStats = calculateMarketingProgress(data.first30DaysChecklist);

  return (
    <div className="space-y-8">
      {/* Monetization & Pricing Tiers */}
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-[#27272A] dark:bg-[#111113]">
        <h2 className="text-lg font-semibold text-[#111827] dark:text-[#F4F4F5]">
          Monetizácia a cenová stratégia
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
          {data.monetizationStrategy}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#E5E7EB] pt-6 dark:border-[#27272A] md:grid-cols-2 lg:grid-cols-3">
          {data.pricingTiers.map((tier) => (
            <article
              key={tier.name}
              className="flex flex-col justify-between rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-5 dark:border-[#27272A] dark:bg-[#09090B]"
            >
              <div>
                <p className="text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
                  {tier.name}
                </p>
                <p className="mt-1 font-mono text-xl font-bold tabular-nums text-[#2563EB] dark:text-[#3B82F6]">
                  {tier.price}
                </p>
                <p className="mt-1 text-xs text-[#52525B] dark:text-[#A1A1AA]">{tier.target}</p>
                <ul className="mt-4 space-y-1.5 border-t border-[#E5E7EB] pt-3 dark:border-[#27272A]">
                  {tier.features.map((feat, idx) => (
                    <li
                      key={idx}
                      className="text-xs leading-relaxed text-[#111827] dark:text-[#E4E4E7]"
                    >
                      • {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* First 30 Days Checklist */}
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-[#27272A] dark:bg-[#111113]">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
              Prvých 30 dní do spustenia (Launch checklist)
            </h3>
            <p className="mt-1 text-xs text-[#52525B] dark:text-[#A1A1AA]">
              Akčný postup na získanie platiacich zákazníkov v prvom mesiaci.
            </p>
          </div>
          <span className="font-mono text-xs font-medium tabular-nums text-[#52525B] dark:text-[#A1A1AA]">
            {launchStats.completed}/{launchStats.total} ({launchStats.percentage}%)
          </span>
        </div>

        <ul className="mt-4 divide-y divide-[#E5E7EB] border-t border-[#E5E7EB] dark:divide-[#27272A] dark:border-[#27272A]">
          {data.first30DaysChecklist.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onToggleTask(item.id)}
                role="checkbox"
                aria-checked={item.done}
                className="flex min-h-[48px] w-full items-center gap-3.5 py-3 text-left transition-colors hover:bg-[#FAFAFA] dark:hover:bg-[#18181B]/60"
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
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-[11px] font-medium text-[#2563EB] dark:text-[#3B82F6]">
                    {item.week}
                  </span>
                  <p
                    className={`mt-0.5 text-sm leading-relaxed ${
                      item.done
                        ? 'text-[#52525B] line-through dark:text-[#A1A1AA]'
                        : 'text-[#111827] dark:text-[#E4E4E7]'
                    }`}
                  >
                    {item.task}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Acquisition Channels & North Star Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-[#27272A] dark:bg-[#111113]">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
            Kanály pre prvých 100 používateľov
          </h3>
          <ul className="mt-4 divide-y divide-[#E5E7EB] border-t border-[#E5E7EB] dark:divide-[#27272A] dark:border-[#27272A]">
            {data.acquisitionChannels.map((ch, idx) => (
              <li key={idx} className="py-3.5">
                <p className="text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
                  {ch.channel}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
                  {ch.tactic}
                </p>
                <p className="mt-1.5 font-mono text-[11px] text-[#2563EB] dark:text-[#3B82F6]">
                  Očakávaný dopad: {ch.expectedImpact}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-[#27272A] dark:bg-[#111113]">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
            Kľúčové North Star metriky od prvého dňa
          </h3>
          <ul className="mt-4 divide-y divide-[#E5E7EB] border-t border-[#E5E7EB] dark:divide-[#27272A] dark:border-[#27272A]">
            {data.northStarMetrics.map((metric, idx) => (
              <li key={idx} className="py-3.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
                    {metric.name}
                  </p>
                  <span className="font-mono text-xs font-semibold tabular-nums text-[#2563EB] dark:text-[#3B82F6]">
                    {metric.target}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
                  {metric.why}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
