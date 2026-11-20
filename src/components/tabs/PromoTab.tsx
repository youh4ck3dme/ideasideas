import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { PromoSection } from '../../types/project';

interface PromoTabProps {
  data: PromoSection;
}

export const PromoTab: React.FC<PromoTabProps> = ({ data }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  return (
    <div className="space-y-8">
      {/* Brand Summary */}
      <section className="min-w-0 rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-[#27272A] dark:bg-[#111113] sm:p-6">
        <p className="text-xs font-medium text-[#2563EB] dark:text-[#3B82F6]">
          Koncept & Identita značky
        </p>
        <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[#111827] dark:text-[#F4F4F5] sm:text-3xl">
          {data.projectName}
        </h2>
        <p className="mt-2 text-base font-medium text-[#52525B] dark:text-[#A1A1AA]">
          {data.tagline}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 border-t border-[#E5E7EB] pt-6 dark:border-[#27272A] md:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold text-[#52525B] dark:text-[#A1A1AA]">
              Výťahový prejav (Elevator Pitch)
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#111827] dark:text-[#E4E4E7]">
              {data.elevatorPitch}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#52525B] dark:text-[#A1A1AA]">
              Hodnotová propozícia
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#111827] dark:text-[#E4E4E7]">
              {data.valueProposition}
            </p>
          </div>
        </div>
      </section>

      {/* Hero Copy Preview */}
      <section className="min-w-0 rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-[#27272A] dark:bg-[#111113] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
            Texty pre hlavnú sekciu webu (Hero)
          </h3>
          <button
            type="button"
            onClick={() =>
              handleCopy(
                `${data.heroCopy.headline}\n\n${data.heroCopy.subheadline}\n\n[${data.heroCopy.cta}]`,
                99
              )
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E5E7EB] px-3 text-xs font-medium text-[#111827] transition-colors hover:bg-[#F4F4F5] dark:border-[#27272A] dark:text-[#F4F4F5] dark:hover:bg-[#18181B]"
          >
            {copiedIndex === 99 ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedIndex === 99 ? 'Skopírované' : 'Kopírovať text'}</span>
          </button>
        </div>

        <div className="mt-5 border-t border-[#E5E7EB] pt-5 dark:border-[#27272A]">
          <p className="text-balance text-xl font-bold tracking-tight text-[#111827] dark:text-[#F4F4F5] sm:text-2xl">
            {data.heroCopy.headline}
          </p>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
            {data.heroCopy.subheadline}
          </p>
          <div className="mt-4">
            <span className="inline-flex h-10 items-center rounded-full bg-[#111827] px-5 text-xs font-medium text-white dark:bg-[#F4F4F5] dark:text-[#111827]">
              {data.heroCopy.cta}
            </span>
          </div>
        </div>
      </section>

      {/* 3 Tailored Promo Posts */}
      <section>
        <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
          Pripravené promo príspevky
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {data.promoPosts.map((post, idx) => (
            <article
              key={`${post.platform}-${idx}`}
              className="flex flex-col justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 dark:border-[#27272A] dark:bg-[#111113]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-xs font-medium text-[#2563EB] dark:text-[#3B82F6]">
                    {post.platform}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(post.content, idx)}
                    aria-label={`Kopírovať príspevok pre ${post.platform}`}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#E5E7EB] px-3 text-xs font-medium text-[#111827] transition-transform hover:bg-[#F4F4F5] active:scale-[0.97] dark:border-[#27272A] dark:text-[#F4F4F5] dark:hover:bg-[#18181B]"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Skopírované</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Kopírovať</span>
                      </>
                    )}
                  </button>
                </div>
                <h4 className="mt-3 text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
                  {post.title}
                </h4>
                <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
                  {post.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Brand Direction: Tone of Voice + 3-color Palette */}
      <section className="min-w-0 rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-[#27272A] dark:bg-[#111113] sm:p-6">
        <h3 className="text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
          Smerovanie značky a farebná paleta
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
          <span className="font-medium text-[#111827] dark:text-[#F4F4F5]">Tón komunikácie: </span>
          {data.brandDirection.toneOfVoice}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[#E5E7EB] pt-5 dark:border-[#27272A] sm:grid-cols-3">
          {data.brandDirection.colors.map((color) => (
            <div key={color.hex + color.name} className="flex items-start gap-3">
              <div
                className="h-11 w-11 shrink-0 rounded-xl border border-[#E5E7EB] dark:border-[#27272A]"
                style={{ backgroundColor: color.hex }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111827] dark:text-[#F4F4F5]">
                  {color.name}
                </p>
                <p className="font-mono text-xs text-[#52525B] dark:text-[#A1A1AA]">{color.hex}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
                  {color.usage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
