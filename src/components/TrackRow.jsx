import { Droppable } from '@hello-pangea/dnd';
import UmaCard from './UmaCard';

const TRACK_META = {
  sprint: { label: 'Sprint', icon: '⚡', accent: 'from-amber-500/20 to-transparent border-amber-500/30', accentText: 'text-amber-400' },
  mile:   { label: 'Mile',   icon: '🏇', accent: 'from-sky-500/20 to-transparent border-sky-500/30',    accentText: 'text-sky-400' },
  medium: { label: 'Medium', icon: '🏁', accent: 'from-violet-500/20 to-transparent border-violet-500/30', accentText: 'text-violet-400' },
  long:   { label: 'Long',   icon: '🗻', accent: 'from-emerald-500/20 to-transparent border-emerald-500/30', accentText: 'text-emerald-400' },
  dirt:   { label: 'Dirt',   icon: '🌪️', accent: 'from-orange-500/20 to-transparent border-orange-500/30', accentText: 'text-orange-400' },
};

export default function TrackRow({
  trackId,
  umaIds,
  umaById,
  ownedIds,
  maxPerTrack,
  strategies,
  onSetStrategy,
  strategyOptions,
  onRemoveFromTrack,
}) {
  const meta = TRACK_META[trackId] || { label: trackId, icon: '🏟️', accent: '', accentText: '' };
  const count = umaIds.length;
  const isFull = count >= maxPerTrack;

  return (
    <div
      className={`
        rounded-xl border bg-linear-to-r ${meta.accent}
        bg-gray-800/40
        p-3 transition-all duration-200
      `}
    >
      {/* Track header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-bold ${meta.accentText} flex items-center gap-1.5`}>
          <span className="text-base">{meta.icon}</span>
          {meta.label}
        </h3>
        <span
          className={`text-xs font-mono px-2 py-0.5 rounded-full ${
            isFull
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-gray-700/60 text-gray-400 border border-gray-600/30'
          }`}
        >
          {count} / {maxPerTrack}
        </span>
      </div>

      {/* Droppable area — VERTICAL layout */}
      <Droppable droppableId={trackId} direction="vertical" type="UMA_CARD">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex flex-col gap-2 min-h-[60px] rounded-lg px-1 py-1
              transition-all duration-200
              ${snapshot.isDraggingOver
                ? 'bg-white/5 border border-dashed border-gray-500/50'
                : 'border border-transparent'
              }
            `}
          >
            {umaIds.map((id, index) => {
              const uma = umaById[id];
              if (!uma) return null;
              return (
                <UmaCard
                  key={id}
                  uma={uma}
                  index={index}
                  isOwned={ownedIds.has(id)}
                  compact
                  selectedStrategy={strategies[id]}
                  onSetStrategy={onSetStrategy}
                  strategyOptions={strategyOptions}
                  onRemoveFromTrack={onRemoveFromTrack}
                />
              );
            })}
            {provided.placeholder}

            {/* Empty slot placeholders */}
            {Array.from({ length: maxPerTrack - count }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-[50px] rounded-lg border-2 border-dashed border-gray-700/40 flex items-center justify-center text-gray-600 text-xs"
              >
                <span className="opacity-40">Drop here</span>
              </div>
            ))}
          </div>
        )}
      </Droppable>
    </div>
  );
}
