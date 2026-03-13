import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import umasData from '../data/umas.json';

const STORAGE_KEY_OWNED = 'uma-tb-owned';
const STORAGE_KEY_TRACKS = 'uma-tb-tracks';
const STORAGE_KEY_STRATEGIES = 'uma-tb-strategies';
const MAX_PER_TRACK = 3;

const TRACK_IDS = ['sprint', 'mile', 'medium', 'long', 'dirt'];
const STRATEGY_OPTIONS = ['front', 'pace', 'late', 'end'];

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — silently ignore
  }
}

/** Extracts base character name, e.g. "Maruzensky (Formula R)" → "Maruzensky" */
export function getBaseName(name) {
  const idx = name.indexOf('(');
  return (idx > 0 ? name.slice(0, idx) : name).trim();
}

export default function useTeamBuilder() {
  // ── Owned IDs ──────────────────────────────────────────────
  const [ownedIds, setOwnedIds] = useState(() => {
    const saved = loadFromStorage(STORAGE_KEY_OWNED, []);
    return new Set(saved);
  });

  // ── Track assignments  (trackId → umaId[]) ────────────────
  const [tracks, setTracks] = useState(() =>
    loadFromStorage(STORAGE_KEY_TRACKS, {
      sprint: [],
      mile: [],
      medium: [],
      long: [],
      dirt: [],
    })
  );

  // ── Strategy assignments (umaId → strategyKey) ─────────────
  const [strategies, setStrategies] = useState(() =>
    loadFromStorage(STORAGE_KEY_STRATEGIES, {})
  );

  // ── Toast message ──────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  // ── Persist on every change ────────────────────────────────
  useEffect(() => {
    saveToStorage(STORAGE_KEY_OWNED, [...ownedIds]);
  }, [ownedIds]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_TRACKS, tracks);
  }, [tracks]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_STRATEGIES, strategies);
  }, [strategies]);

  // ── Lookup map for quick access ────────────────────────────
  const umaById = useMemo(() => {
    const map = {};
    for (const u of umasData) map[u.id] = u;
    return map;
  }, []);

  // ── Derived: IDs already placed on any track ───────────────
  const placedIds = useMemo(() => {
    const set = new Set();
    for (const ids of Object.values(tracks)) {
      for (const id of ids) set.add(id);
    }
    return set;
  }, [tracks]);

  // ── Derived: base names placed on any track (for duplicate detection) ──
  const placedBaseNames = useMemo(() => {
    const set = new Set();
    for (const ids of Object.values(tracks)) {
      for (const id of ids) {
        const uma = umaById[id];
        if (uma) set.add(getBaseName(uma.name));
      }
    }
    return set;
  }, [tracks, umaById]);

  // ── Derived: umas available in roster ──────────────────────
  const rosterUmas = useMemo(
    () => umasData.filter((u) => !placedIds.has(u.id)),
    [placedIds]
  );

  // ── Toggle owned status ────────────────────────────────────
  const toggleOwned = useCallback((id) => {
    setOwnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ── Set strategy for a placed uma ──────────────────────────
  const setStrategy = useCallback((umaId, strategyKey) => {
    setStrategies((prev) => ({ ...prev, [umaId]: strategyKey }));
  }, []);

  // ── Remove card from track (red X button) ──────────────────
  const removeFromTrack = useCallback((umaId) => {
    setTracks((prev) => {
      const next = {};
      for (const [trackId, ids] of Object.entries(prev)) {
        next[trackId] = ids.filter((id) => id !== umaId);
      }
      return next;
    });
    setStrategies((prev) => {
      const updated = { ...prev };
      delete updated[umaId];
      return updated;
    });
  }, []);

  // ── Drag & Drop handler ────────────────────────────────────
  const onDragEnd = useCallback(
    (result) => {
      const { source, destination, draggableId } = result;

      // Dropped outside any droppable
      if (!destination) return;

      // Same position — no-op
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return;

      const srcId = source.droppableId;
      const dstId = destination.droppableId;

      // ── Block drop if destination track is full ────────────
      if (dstId !== 'roster' && TRACK_IDS.includes(dstId)) {
        const currentCount = tracks[dstId]?.length ?? 0;
        const isMovingWithinSameTrack = srcId === dstId;
        if (!isMovingWithinSameTrack && currentCount >= MAX_PER_TRACK) {
          showToast(`Track is full! Maximum ${MAX_PER_TRACK} characters per track.`);
          return;
        }
      }

      // ── Block non-owned umas from being dragged to tracks ──
      if (srcId === 'roster' && dstId !== 'roster') {
        if (!ownedIds.has(draggableId)) return;
      }

      // ── Block duplicate base names across all tracks ───────
      if (dstId !== 'roster' && TRACK_IDS.includes(dstId)) {
        const draggedUma = umaById[draggableId];
        if (draggedUma) {
          const draggedBaseName = getBaseName(draggedUma.name);
          // Check all tracks for an uma with same base name (but different id)
          for (const [trackId, ids] of Object.entries(tracks)) {
            // Skip the source track (we're moving *from* it)
            if (trackId === srcId) continue;
            for (const existingId of ids) {
              if (existingId === draggableId) continue; // same card
              const existingUma = umaById[existingId];
              if (existingUma && getBaseName(existingUma.name) === draggedBaseName) {
                showToast(`${draggedBaseName} is already assigned to a track!`);
                return;
              }
            }
          }
        }
      }

      setTracks((prev) => {
        const next = { ...prev };

        // Clone affected arrays
        if (srcId !== 'roster') next[srcId] = [...prev[srcId]];
        if (dstId !== 'roster') next[dstId] = [...(prev[dstId] || [])];

        // Remove from source
        if (srcId === 'roster') {
          // nothing to remove from tracks state
        } else {
          next[srcId] = next[srcId].filter((id) => id !== draggableId);
        }

        // Add to destination
        if (dstId === 'roster') {
          // nothing to add to tracks state — removing from track is enough
          // Clean up strategy assignment
          setStrategies((prev) => {
            const updated = { ...prev };
            delete updated[draggableId];
            return updated;
          });
        } else {
          // Avoid duplicates
          if (!next[dstId].includes(draggableId)) {
            next[dstId].splice(destination.index, 0, draggableId);
          }
        }

        return next;
      });
    },
    [tracks, ownedIds, umaById, showToast]
  );

  return {
    umas: umasData,
    rosterUmas,
    tracks,
    ownedIds,
    umaById,
    strategies,
    placedBaseNames,
    toast,
    toggleOwned,
    setStrategy,
    removeFromTrack,
    onDragEnd,
    maxPerTrack: MAX_PER_TRACK,
    trackIds: TRACK_IDS,
    strategyOptions: STRATEGY_OPTIONS,
  };
}
