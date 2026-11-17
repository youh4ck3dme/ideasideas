import React from 'react';
import type { AntiFailSection } from '../../types/project';

interface AntiFailTabProps {
  data: AntiFailSection;
}

export const AntiFailTab: React.FC<AntiFailTabProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      {/* 1. Ako to nepokaziť na začiatku */}
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-[#27272A] dark:bg-[#111113]">
        <h2 className="text-lg font-semibold text-[#111827] dark:text-[#F4F4F5]">
          Ako to nepokaziť na začiatku (TOP 5 kritických chýb)
        </h2>
        <p className="mt-1 text-sm text-[#52525B] dark:text-[#A1A1AA]">
          Najčastejšie pasce špecifické priamo pre tento typ produktu a spôsob, ako im predísť.
        </p>

        <ol className="mt-5 divide-y divide-[#E5E7EB] border-t border-[#E5E7EB] dark:divide-[#27272A] dark:border-[#27272A]">
          {data.fatalMistakes.map((item, idx) => (
            <li key={idx} className="py-4">
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-xs font-semibold tabular-nums text-red-600 dark:text-red-400">
                  0{idx + 1}.
                </span>
                <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
                  {item.title}
                </h3>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
                <span className="font-medium text-[#111827] dark:text-[#E4E4E7]">Riziko: </span>
                {item.mistake}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#111827] dark:text-[#E4E4E7]">
                <span className="font-medium text-[#2563EB] dark:text-[#3B82F6]">Prevencia: </span>
                {item.prevention}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* 2. Železné pravidlá */}
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-[#27272A] dark:bg-[#111113]">
        <h2 className="text-lg font-semibold text-[#111827] dark:text-[#F4F4F5]">
          Železné pravidlá (Čo pevne dodržiavať)
        </h2>
        <p className="mt-1 text-sm text-[#52525B] dark:text-[#A1A1AA]">
          Neprekročiteľné produktové, UX a finančné princípy pre udržanie kvality.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {data.ironRules.map((rule, idx) => (
            <article
              key={idx}
              className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-5 dark:border-[#27272A] dark:bg-[#09090B]"
            >
              <span className="font-mono text-[11px] font-medium text-[#2563EB] dark:text-[#3B82F6]">
                {rule.category}
              </span>
              <h3 className="mt-2 text-sm font-semibold leading-snug text-[#111827] dark:text-[#F4F4F5]">
                {rule.rule}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
                {rule.rationale}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* 3. Ako správne škálovať počiatočný záujem */}
      <section>
        <h2 className="text-lg font-semibold text-[#111827] dark:text-[#F4F4F5]">
          Ako správne škálovať počiatočný záujem (100 → 1 000 → 10 000 používateľov)
        </h2>
        <p className="mt-1 text-sm text-[#52525B] dark:text-[#A1A1AA]">
          Konkrétny plán pre zber spätnej väzby, retenciu, virálne slučky a odstraňovanie úzkych hrdiel.
        </p>

        <div className="mt-4 space-y-4">
          {data.scalingPlaybook.map((stage, idx) => (
            <article
              key={stage.stage}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-[#27272A] dark:bg-[#111113]"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#E5E7EB] pb-4 dark:border-[#27272A]">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6]">
                    ETAPA 0{idx + 1}
                  </span>
                  <h3 className="text-base font-bold tabular-nums text-[#111827] dark:text-[#F4F4F5]">
                    {stage.stage}
                  </h3>
                </div>
                <p className="text-xs font-medium text-[#52525B] dark:text-[#A1A1AA]">
                  {stage.focus}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-[#52525B] dark:text-[#A1A1AA]">
                    Slučka spätnej väzby
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#111827] dark:text-[#E4E4E7]">
                    {stage.feedbackLoop}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#52525B] dark:text-[#A1A1AA]">
                    Mechanizmus retencie
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#111827] dark:text-[#E4E4E7]">
                    {stage.retentionMechanic}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#52525B] dark:text-[#A1A1AA]">
                    Virálna / odporúčacia slučka
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#111827] dark:text-[#E4E4E7]">
                    {stage.viralLoop}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#52525B] dark:text-[#A1A1AA]">
                    Riešenie úzkych hrdiel
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#111827] dark:text-[#E4E4E7]">
                    {stage.bottleneckFix}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
