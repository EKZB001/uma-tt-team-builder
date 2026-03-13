import { useState, useMemo, useCallback } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import UmaCard from './UmaCard';
import { getBaseName } from '../hooks/useTeamBuilder';

const GRADE_POINTS = { S: 8, A: 7, B: 6, C: 5, D: 4, E: 3, F: 2, G: 1 };

const APTITUDE_OPTIONS = [
  { value: 'turf', label: 'Turf', group: 'Surface' },
  { value: 'dirt', label: 'Dirt', group: 'Surface' },
  { value: 'sprint', label: 'Sprint', group: 'Distance' },
  { value: 'mile', label: 'Mile', group: 'Distance' },
  { value: 'medium', label: 'Medium', group: 'Distance' },
  { value: 'long', label: 'Long', group: 'Distance' },
  { value: 'front', label: 'Front', group: 'Strategy' },
  { value: 'pace', label: 'Pace', group: 'Strategy' },
  { value: 'late', label: 'Late', group: 'Strategy' },
  { value: 'end', label: 'End', group: 'Strategy' },
];

export default function Roster({ umas, ownedIds, onToggleOwned, placedBaseNames }) {
  const [search, setSearch] = useState('');
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [sortCriteria, setSortCriteria] = useState([]);
  // Global sort direction for weighted score
  const [sortDir, setSortDir] = useState('desc'); // desc = highest score first

  const addSortCriterion = useCallback(() => {
    const usedKeys = new Set(sortCriteria.map((c) => c.key));
    const available = APTITUDE_OPTIONS.find((o) => !usedKeys.has(o.value));
    if (available) {
      setSortCriteria((prev) => [...prev, { key: available.value }]);
    }
  }, [sortCriteria]);

  const removeSortCriterion = useCallback((index) => {
    setSortCriteria((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateSortKey = useCallback((index, newKey) => {
    setSortCriteria((prev) =>
      prev.map((c, i) => (i === index ? { ...c, key: newKey } : c))
    );
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = [...umas];

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q));
    }

    // Filter by owned
    if (showOwnedOnly) {
      result = result.filter((u) => ownedIds.has(u.id));
    }

    // Weighted score sort — sum points for all selected aptitudes
    if (sortCriteria.length > 0) {
      result.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        for (const { key } of sortCriteria) {
          scoreA += GRADE_POINTS[a.aptitude[key]] ?? 0;
          scoreB += GRADE_POINTS[b.aptitude[key]] ?? 0;
        }
        const diff = sortDir === 'desc' ? scoreB - scoreA : scoreA - scoreB;
        if (diff !== 0) return diff;
        // Tiebreaker: alphabetical by name
        return a.name.localeCompare(b.name);
      });
    }

    return result;
  }, [umas, search, showOwnedOnly, sortCriteria, sortDir, ownedIds]);

  const ownedCount = useMemo(
    () => umas.filter((u) => ownedIds.has(u.id)).length,
    [umas, ownedIds]
  );

  const usedKeys = new Set(sortCriteria.map((c) => c.key));
  const canAddMore = sortCriteria.length < APTITUDE_OPTIONS.length;

  // Calculate score for display
  const getScore = (uma) => {
    if (sortCriteria.length === 0) return null;
    let total = 0;
    for (const { key } of sortCriteria) {
      total += GRADE_POINTS[uma.aptitude[key]] ?? 0;
    }
    return total;
  };

  return (
    <section className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <span className="text-xl">📋</span>
            Collection
          </h2>
          <span className="text-xs font-medium text-gray-400 bg-gray-800 px-2.5 py-1 rounded-full">
            Owned{' '}
            <span className="text-emerald-400 font-bold">{ownedCount}</span>
            <span className="text-gray-500"> / {umas.length}</span>
          </span>
        </div>

        {/* Search bar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search characters..."
            className="w-full bg-gray-800/80 border border-gray-700/60 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Owned filter toggle */}
          <button
            type="button"
            onClick={() => setShowOwnedOnly((v) => !v)}
            className={`
              shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all duration-200
              ${showOwnedOnly
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-gray-800/60 text-gray-400 border-gray-700/50 hover:border-gray-600 hover:text-gray-300'
              }
            `}
          >
            {showOwnedOnly ? '✓ Owned' : 'Owned'}
          </button>

          {/* Add sort button */}
          {canAddMore && (
            <button
              type="button"
              onClick={addSortCriterion}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:border-emerald-500/40 hover:text-emerald-400 transition-all"
            >
              + Sort
            </button>
          )}

          {/* Global direction toggle */}
          {sortCriteria.length > 0 && (
            <button
              type="button"
              onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:border-gray-600 hover:text-gray-300 transition-all"
              title={sortDir === 'desc' ? 'Best first (highest score)' : 'Worst first (lowest score)'}
            >
              {sortDir === 'desc' ? '▼ Best' : '▲ Worst'}
            </button>
          )}

          {/* Clear all sorts */}
          {sortCriteria.length > 0 && (
            <button
              type="button"
              onClick={() => setSortCriteria([])}
              className="shrink-0 rounded-lg px-2 py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort criteria chips */}
        {sortCriteria.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sortCriteria.map((criterion, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-gray-800/80 border border-gray-700/50 rounded-lg px-2 py-1"
              >
                <select
                  value={criterion.key}
                  onChange={(e) => updateSortKey(index, e.target.value)}
                  className="bg-gray-800/80 text-xs text-gray-300 focus:outline-none cursor-pointer hover:text-gray-200 transition-colors"
                >
                  {APTITUDE_OPTIONS.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      disabled={usedKeys.has(opt.value) && opt.value !== criterion.key}
                    >
                      {opt.group}: {opt.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => removeSortCriterion(index)}
                  className="shrink-0 text-gray-600 hover:text-red-400 transition-colors text-xs leading-none ml-0.5"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable character list */}
      <Droppable droppableId="roster" type="UMA_CARD">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 overflow-y-auto px-4 pb-4
              transition-colors duration-200
              ${snapshot.isDraggingOver ? 'bg-emerald-500/5' : ''}
            `}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2">
              {filteredAndSorted.map((uma, index) => {
                const isDuplicate = placedBaseNames.has(getBaseName(uma.name));
                const score = getScore(uma);
                return (
                  <UmaCard
                    key={uma.id}
                    uma={uma}
                    index={index}
                    isOwned={ownedIds.has(uma.id)}
                    onToggleOwned={onToggleOwned}
                    showOwnedToggle
                    isDuplicate={isDuplicate}
                    score={score}
                  />
                );
              })}
            </div>
            {provided.placeholder}

            {filteredAndSorted.length === 0 && (
              <p className="text-center text-gray-500 text-sm mt-8">
                No characters found.
              </p>
            )}
          </div>
        )}
      </Droppable>
    </section>
  );
}
