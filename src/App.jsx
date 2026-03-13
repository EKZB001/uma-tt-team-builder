import { DragDropContext } from '@hello-pangea/dnd';
import useTeamBuilder from './hooks/useTeamBuilder';
import Roster from './components/Roster';
import TeamStadium from './components/TeamStadium';

export default function App() {
  const {
    rosterUmas,
    tracks,
    trackIds,
    ownedIds,
    umaById,
    strategies,
    placedBaseNames,
    toast,
    toggleOwned,
    setStrategy,
    removeFromTrack,
    onDragEnd,
    maxPerTrack,
    strategyOptions,
  } = useTeamBuilder();

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden">
        {/* ── Header ─────────────────────────────────────────── */}
        <header className="shrink-0 border-b border-gray-800/80 bg-gray-900/80 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐴</span>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-linear-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                Uma Musume Team Builder
              </h1>
              <p className="text-[11px] text-gray-500 -mt-0.5">Team Trials Planner</p>
            </div>
          </div>
        </header>

        {/* ── Main content ─────────────────────────────────── */}
        {/*
          Mobile/tablet (< lg): stacked vertically, both visible, each independently scrollable.
          Desktop (lg+): side-by-side with divider.
          Both panels always rendered so DnD works across them.
        */}
        <main className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Left panel — Roster */}
          <div className="h-[45vh] lg:h-auto shrink-0 lg:shrink lg:w-auto lg:min-w-[380px] lg:max-w-[420px] border-b lg:border-b-0 lg:border-r border-gray-800/60 flex flex-col">
            <Roster
              umas={rosterUmas}
              ownedIds={ownedIds}
              onToggleOwned={toggleOwned}
              placedBaseNames={placedBaseNames}
            />
          </div>

          {/* Right panel — Team Stadium */}
          <div className="flex-1 min-h-0 flex flex-col min-w-0">
            <TeamStadium
              tracks={tracks}
              trackIds={trackIds}
              umaById={umaById}
              ownedIds={ownedIds}
              maxPerTrack={maxPerTrack}
              strategies={strategies}
              onSetStrategy={setStrategy}
              strategyOptions={strategyOptions}
              onRemoveFromTrack={removeFromTrack}
            />
          </div>
        </main>

        {/* ── Toast notification ──────────────────────────────── */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100 animate-bounce">
            <div className="bg-red-500/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-2xl shadow-red-500/30 border border-red-400/30">
              {toast}
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}