import React from 'react';
import { LucideIcon, Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  id?: string;
  icon: LucideIcon | string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  tips?: string[];
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id = 'empty-state-card',
  icon: IconOrEmoji,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  tips,
  className = '',
}) => {
  return (
    <div
      id={id}
      className={`bg-white rounded-3xl p-8 sm:p-12 border border-[#DFE8E3] shadow-xs text-center max-w-xl mx-auto space-y-5 my-6 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#E2F8EF] border border-[#0AB77F]/30 flex items-center justify-center mx-auto text-3xl text-[#0AB77F] shadow-xs">
        {typeof IconOrEmoji === 'string' ? (
          <span>{IconOrEmoji}</span>
        ) : (
          <IconOrEmoji className="w-8 h-8 text-[#0AB77F] stroke-[1.75]" />
        )}
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-lg sm:text-xl font-black text-[#17231E] tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-[#65766F] leading-relaxed font-medium">
          {description}
        </p>
      </div>

      {tips && tips.length > 0 && (
        <div className="bg-[#F5F8F6] p-3.5 rounded-2xl border border-[#DFE8E3] text-left space-y-1.5 max-w-sm mx-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0AB77F] block">
            Quick Uganda Field Guidance:
          </span>
          <ul className="text-xs text-[#65766F] space-y-1">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-[#0AB77F] font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="w-full sm:w-auto px-6 py-3 bg-[#0AB77F] hover:bg-[#07885E] active:scale-[0.98] text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{actionLabel}</span>
          </button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="w-full sm:w-auto px-5 py-3 bg-[#F5F8F6] hover:bg-[#E2F8EF] border border-[#DFE8E3] text-[#17231E] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{secondaryActionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
