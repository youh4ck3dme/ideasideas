import React from 'react';
import type { TechSection } from '../../types/project';

interface TechTabProps {
  data: TechSection;
}

export const TechTab: React.FC<TechTabProps> = ({ data }) => {
  const stackEntries = [
    { label: 'Frontend', ...data.stack.frontend },
    { label: 'Backend', ...data.stack.backend },
    { label: 'Databáza', ...data.stack.database },
    { label: 'Autentifikácia', ...data.stack.auth },
    { label: 'Hosting & Infra', ...data.stack.hosting },
  ];

  return (
    <div className="space-y-8">
      {/* Recommended Tech Stack */}
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-[#27272A] dark:bg-[#111113]">
        <h2 className="text-lg font-semibold text-[#111827] dark:text-[#F4F4F5]">
          Odporúčaný technologický stack
        </h2>
        <div className="mt-4 divide-y divide-[#E5E7EB] border-t border-[#E5E7EB] dark:divide-[#27272A] dark:border-[#27272A]">
          {stackEntries.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-1 gap-2 py-3.5 sm:grid-cols-[140px_1fr] sm:gap-4"
            >
              <span className="text-xs font-medium text-[#52525B] dark:text-[#A1A1AA]">
                {item.label}
              </span>
              <div>
                <p className="font-mono text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
                  {item.name}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
                  {item.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Data Model */}
      <section>
        <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
          Dátový model a databázové entity
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.dataModel.map((entity) => (
            <article
              key={entity.entity}
              className="rounded-xl border border-[#E5E7EB] bg-white p-5 dark:border-[#27272A] dark:bg-[#111113]"
            >
              <h4 className="font-mono text-sm font-semibold text-[#2563EB] dark:text-[#3B82F6]">
                {entity.entity}
              </h4>
              <p className="mt-1 text-xs text-[#52525B] dark:text-[#A1A1AA]">
                {entity.description}
              </p>

              <ul className="mt-4 divide-y divide-[#E5E7EB] border-t border-[#E5E7EB] font-mono text-xs dark:divide-[#27272A] dark:border-[#27272A]">
                {entity.fields.map((field) => (
                  <li key={field.name} className="flex items-baseline justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <span className="font-medium text-[#111827] dark:text-[#F4F4F5]">
                        {field.name}
                      </span>
                      {field.note && (
                        <span className="ml-1.5 font-sans text-[11px] text-[#52525B] dark:text-[#A1A1AA]">
                          ({field.note})
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-[#52525B] dark:text-[#A1A1AA]">{field.type}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* API Endpoints & Integrations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-[#27272A] dark:bg-[#111113]">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
            Kľúčové API endpointy
          </h3>
          <ul className="mt-4 divide-y divide-[#E5E7EB] border-t border-[#E5E7EB] dark:divide-[#27272A] dark:border-[#27272A]">
            {data.apiEndpoints.map((ep, idx) => (
              <li key={`${ep.method}-${ep.path}-${idx}`} className="py-3">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-semibold text-[#2563EB] dark:text-[#3B82F6]">
                    {ep.method}
                  </span>
                  <span className="truncate text-[#111827] dark:text-[#F4F4F5]">{ep.path}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
                  {ep.purpose}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-[#27272A] dark:bg-[#111113]">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
            Integrácie, bezpečnosť a náklady na MVP
          </h3>

          <div className="mt-4 border-t border-[#E5E7EB] pt-4 dark:border-[#27272A]">
            <p className="text-xs font-medium text-[#52525B] dark:text-[#A1A1AA]">
              Odhad mesačných nákladov MVP
            </p>
            <p className="mt-1 font-mono text-lg font-bold tabular-nums text-[#111827] dark:text-[#F4F4F5]">
              {data.mvpCostEstimate.monthlyEstimate}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
              {data.mvpCostEstimate.breakdown}
            </p>
          </div>

          <div className="mt-5 border-t border-[#E5E7EB] pt-4 dark:border-[#27272A]">
            <p className="text-xs font-medium text-[#52525B] dark:text-[#A1A1AA]">
              Integrácie tretích strán
            </p>
            <ul className="mt-2 space-y-2">
              {data.integrations.map((integ) => (
                <li key={integ.name} className="text-xs leading-relaxed">
                  <span className="font-semibold text-[#111827] dark:text-[#F4F4F5]">
                    {integ.name}:{' '}
                  </span>
                  <span className="text-[#52525B] dark:text-[#A1A1AA]">{integ.purpose}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 border-t border-[#E5E7EB] pt-4 dark:border-[#27272A]">
            <p className="text-xs font-medium text-[#52525B] dark:text-[#A1A1AA]">
              Bezpečnostné zásady
            </p>
            <ul className="mt-2 space-y-1.5">
              {data.securityNotes.map((note, idx) => (
                <li
                  key={idx}
                  className="text-xs leading-relaxed text-[#52525B] dark:text-[#A1A1AA]"
                >
                  • {note}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};
