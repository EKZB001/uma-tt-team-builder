import { Draggable } from '@hello-pangea/dnd';

const GRADE_COLORS = {
  S: 'bg-amber-400 text-gray-900',
  A: 'bg-emerald-500 text-white',
  B: 'bg-sky-500 text-white',
  C: 'bg-yellow-500 text-gray-900',
  D: 'bg-orange-500 text-white',
  E: 'bg-red-500 text-white',
  F: 'bg-red-800 text-white',
  G: 'bg-gray-600 text-gray-300',
};

const STRATEGY_META = {
  front: { label: 'Front', color: 'bg-rose-500' },
  pace:  { label: 'Pace',  color: 'bg-sky-500' },
  late:  { label: 'Late',  color: 'bg-violet-500' },
  end:   { label: 'End',   color: 'bg-amber-500' },
};

const APTITUDE_GROUPS = [
  {
    title: 'Surface',
    keys: [
      { key: 'turf', label: 'Turf' },
      { key: 'dirt', label: 'Dirt' },
    ],
  },
  {
    title: 'Distance',
    keys: [
      { key: 'sprint', label: 'Sprint' },
      { key: 'mile', label: 'Mile' },
      { key: 'medium', label: 'Medium' },
      { key: 'long', label: 'Long' },
    ],
  },
  {
    title: 'Strategy',
    keys: [
      { key: 'front', label: 'Front' },
      { key: 'pace', label: 'Pace' },
      { key: 'late', label: 'Late' },
      { key: 'end', label: 'End' },
    ],
  },
];

function AptitudeBadge({ label, grade }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded px-1 py-[2px] text-[10px] sm:text-[11px] sm:px-1.5 sm:py-[3px] font-bold leading-none whitespace-nowrap ${GRADE_COLORS[grade] ?? 'bg-gray-700 text-gray-400'}`}
      title={`${label}: ${grade}`}
    >
      <span className="opacity-80 font-semibold">{label}</span>
      <span>{grade}</span>
    </span>
  );
}

function AptitudeSection({ title, keys, aptitude }) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">
        {title}
      </p>
      <div className="flex flex-wrap gap-0.5 sm:gap-1">
        {keys.map(({ key, label }) => (
          <AptitudeBadge key={key} label={label} grade={aptitude[key]} />
        ))}
      </div>
    </div>
  );
}

function StrategyPicker({ selectedStrategy, onSetStrategy, strategyOptions, aptitude }) {
  return (
    <div className="mt-1.5 sm:mt-2 w-full">
      <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5 sm:mb-1">
        Strategy
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0.5 sm:gap-1">
        {strategyOptions.map((key) => {
          const meta = STRATEGY_META[key];
          const isSelected = selectedStrategy === key;
          const grade = aptitude[key];
          return (
            <button
              key={key}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSetStrategy(key);
              }}
              className={`
                rounded-md py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold text-center transition-all duration-150
                ${isSelected
                  ? `${meta.color} text-white shadow-md`
                  : 'bg-gray-700/60 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }
              `}
              title={`${meta.label}: ${grade}`}
            >
              {meta.label} {grade}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function UmaCard({
  uma,
  index,
  isOwned,
  onToggleOwned,
  showOwnedToggle = false,
  compact = false,
  selectedStrategy,
  onSetStrategy,
  strategyOptions,
  onRemoveFromTrack,
  isDuplicate = false,
  score,
}) {
  const isDragDisabled = (showOwnedToggle && !isOwned) || isDuplicate;
  const showStrategyPicker = compact && onSetStrategy && strategyOptions;
  const showRemoveButton = compact && onRemoveFromTrack;

  return (
    <Draggable draggableId={uma.id} index={index} isDragDisabled={isDragDisabled}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            group relative flex flex-col items-center min-w-0 overflow-hidden
            ${compact ? 'w-full p-1.5 sm:p-2' : 'w-full p-2 sm:p-3'}
            rounded-xl border border-gray-700/50
            bg-gray-800
            transition-shadow duration-200
            ${snapshot.isDragging ? 'z-50 shadow-2xl shadow-emerald-500/30 border-emerald-500/50' : 'hover:border-gray-600 hover:shadow-lg hover:shadow-black/30'}
            ${isDragDisabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
            ${isDuplicate ? 'opacity-50' : ''}
          `}
        >
          {/* Red X remove button (track cards only) */}
          {showRemoveButton && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromTrack(uma.id);
              }}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white text-[10px] font-bold flex items-center justify-center transition-all duration-150 opacity-0 group-hover:opacity-100 z-10"
              title="Remove from track"
            >
              ✕
            </button>
          )}

          {/* Duplicate label */}
          {isDuplicate && showOwnedToggle && (
            <div className="absolute top-1 right-1 bg-orange-500/80 text-white text-[8px] sm:text-[9px] font-bold px-1 py-0.5 rounded uppercase z-10">
              Duplicate
            </div>
          )}

          {/* Score badge */}
          {score !== null && score !== undefined && showOwnedToggle && (
            <div className="absolute top-1 left-1 bg-emerald-600/80 text-white text-[9px] sm:text-[10px] font-bold px-1 py-0.5 rounded z-10">
              {score}pt
            </div>
          )}

          {/*
            COMPACT MODE (track cards): fully VERTICAL layout.
            Image centered, name below, then aptitude tags get full card width.
          */}
          {compact ? (
            <div className="flex flex-col w-full min-w-0 items-center">
              {/* Small centered image */}
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0 mb-1">
                <img
                  src={uma.image}
                  alt={uma.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                {isOwned && !isDuplicate && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-gray-800" />
                )}
              </div>

              {/* Name — centered, truncated */}
              <p
                className="text-[10px] sm:text-xs font-semibold text-gray-200 text-center truncate w-full leading-tight"
                title={uma.name}
              >
                {uma.name}
              </p>

              {/* Aptitudes — full card width, horizontal wrapping tags */}
              <div className="mt-1 w-full space-y-0.5 min-w-0 overflow-hidden">
                {APTITUDE_GROUPS.slice(0, 2).map((group) => (
                  <AptitudeSection
                    key={group.title}
                    title={group.title}
                    keys={group.keys}
                    aptitude={uma.aptitude}
                  />
                ))}
              </div>

              {/* Strategy picker */}
              {showStrategyPicker && (
                <StrategyPicker
                  selectedStrategy={selectedStrategy}
                  onSetStrategy={(key) => onSetStrategy(uma.id, key)}
                  strategyOptions={strategyOptions}
                  aptitude={uma.aptitude}
                />
              )}
            </div>
          ) : (
            /* FULL MODE (roster cards): image centered, name below, all aptitudes */
            <>
              <div className="flex flex-col items-center w-full">
                <div className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0`}>
                  <img
                    src={uma.image}
                    alt={uma.name}
                    loading="lazy"
                    className={`
                      w-full h-full object-cover
                      transition-all duration-300
                      ${isDragDisabled ? 'grayscale opacity-50' : ''}
                    `}
                  />
                  {isOwned && !isDuplicate && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-gray-800 shadow-sm" />
                  )}
                </div>

                <p
                  className={`
                    text-xs sm:text-sm font-semibold text-center mt-1 sm:mt-1.5 line-clamp-2 leading-tight
                    ${isDragDisabled ? 'text-gray-500' : 'text-gray-200'}
                  `}
                  title={uma.name}
                >
                  {uma.name}
                </p>
              </div>

              <div className="mt-2 sm:mt-2.5 w-full space-y-1 sm:space-y-1.5 min-w-0 overflow-hidden">
                {APTITUDE_GROUPS.map((group) => (
                  <AptitudeSection
                    key={group.title}
                    title={group.title}
                    keys={group.keys}
                    aptitude={uma.aptitude}
                  />
                ))}
              </div>
            </>
          )}

          {/* Owned toggle button (roster only) */}
          {showOwnedToggle && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleOwned(uma.id);
              }}
              className={`
                mt-1.5 sm:mt-2 w-full rounded-md py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider
                transition-all duration-200
                ${isOwned
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600/40 hover:bg-gray-700 hover:text-gray-300'
                }
              `}
            >
              {isOwned ? '✓ Owned' : 'Not Owned'}
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
}
