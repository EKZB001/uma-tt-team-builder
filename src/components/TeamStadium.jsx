import TrackRow from './TrackRow';

export default function TeamStadium({
  tracks,
  trackIds,
  umaById,
  ownedIds,
  maxPerTrack,
  strategies,
  onSetStrategy,
  strategyOptions,
  onRemoveFromTrack,
}) {
  return (
    <section className="flex-1 flex flex-col min-h-0 min-w-0">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3">
        <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
          <span className="text-xl">🏟️</span>
          Team Stadium
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Drag owned characters onto tracks · max 3 per track
        </p>
      </div>

      {/* Track columns — responsive grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {trackIds.map((trackId) => (
            <TrackRow
              key={trackId}
              trackId={trackId}
              umaIds={tracks[trackId] || []}
              umaById={umaById}
              ownedIds={ownedIds}
              maxPerTrack={maxPerTrack}
              strategies={strategies}
              onSetStrategy={onSetStrategy}
              strategyOptions={strategyOptions}
              onRemoveFromTrack={onRemoveFromTrack}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="shrink-0 border-t border-gray-800/50 px-5 py-2.5 text-center">
        <p className="text-[11px] text-gray-300">
          Author: <a href="https://github.com/EKZB001/uma-tt-team-builder" target="_blank" rel="noopener noreferrer" className="text-gray-550 hover:text-yellow-400 underline underline-offset-2 transition-colors pr-2">3RIC</a>
          <a href="mailto:ekzb001.dev@gmail.com?subject=Uma Team Builder - Bug Report" target="_blank" rel="noopener noreferrer" className="text-gray-550 hover:text-yellow-400 underline underline-offset-2 transition-colors">Contact / Report a Bug</a>
        </p>
        <p className="text-[11px] text-gray-300">
          Data provided by{' '}
          <a
            href="https://game8.co/games/Umamusume-Pretty-Derby"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-550 hover:text-yellow-400 underline underline-offset-2 transition-colors"
          >
            Game8
          </a>
          . Special thanks for maintaining the database!
        </p>
      </footer>
    </section>
  );
}
