/**
 * useFantasyGame Hook
 * Manages Fantasy Game connection state and data
 * Handles manager profile, history, and gameweek context
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { EntryStorage } from '@shared/services/entry-storage';
import { FantasyGameRepository } from '@repositories/fantasy';
import { BootstrapRepository } from '@repositories/bootstrap';
import type { FantasyEntry, FantasyGameweekHistory } from '@domain/models';

export interface UseFantasyGameState {
  // Connection state
  connectedEntryId: number | null;
  isConnected: boolean;

  // Data
  entry: FantasyEntry | null;
  history: FantasyGameweekHistory[] | null;

  // Gameweek context
  displayGameweek: number | null;
  currentGameweekIndex: number;
  isCurrentGameweekActive: boolean;

  // Loading states
  isLoading: boolean;
  isConnecting: boolean;

  // Error handling
  error: string | null;

  // Actions
  connectEntry: (entryId: number) => Promise<void>;
  disconnectEntry: () => void;
  clearError: () => void;
  refreshEntry: () => Promise<void>;
  setDisplayGameweek: (gameweek: number) => void;
}

export function useFantasyGame(): UseFantasyGameState {
  const [connectedEntryId, setConnectedEntryId] = useState<number | null>(null);
  const [entry, setEntry] = useState<FantasyEntry | null>(null);
  const [history, setHistory] = useState<FantasyGameweekHistory[] | null>(null);
  const [displayGameweek, setDisplayGameweekState] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repositoryRef = useRef(new FantasyGameRepository());
  const bootstrapRepositoryRef = useRef(new BootstrapRepository());

  // Get bootstrap data for gameweek context
  const bootstrap = bootstrapRepositoryRef.current.getBootstrap();

  // Determine display gameweek index and active status
  const currentGameweekIndex = displayGameweek ? displayGameweek - 1 : 0;
  const isCurrentGameweekActive = displayGameweek
    ? !bootstrap.gameweeks.some((gw) => gw.id === displayGameweek && gw.finished)
    : false;

  // Load entry and history on startup or when ID changes
  useEffect(() => {
    const loadStoredEntry = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const storedId = EntryStorage.getConnectedEntryId();
        setConnectedEntryId(storedId);

        if (storedId) {
          try {
            const [entryData, historyData] = await Promise.all([
              repositoryRef.current.getEntry(storedId),
              repositoryRef.current.getEntryHistory(storedId),
            ]);
            setEntry(entryData);
            setHistory(historyData);

            // Set default display gameweek to current/latest
            const currentGw = bootstrap.gameweeks.find((gw) => !gw.finished);
            const displayGw = currentGw
              ? currentGw.id
              : bootstrap.gameweeks[bootstrap.gameweeks.length - 1]?.id;
            setDisplayGameweekState(displayGw ?? null);
          } catch (err) {
            // Entry ID invalid or API error
            console.error('Failed to load entry:', err);
            setError(
              'Unable to load entry. The Entry ID may be invalid or the API is unavailable.'
            );
            setConnectedEntryId(null);
            setEntry(null);
            setHistory(null);
            EntryStorage.clearConnectedEntryId();
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredEntry();
  }, [bootstrap]);

  const connectEntry = useCallback(
    async (entryId: number) => {
      try {
        setIsConnecting(true);
        setError(null);

        // Validate entry exists and is accessible
        const [entryData, historyData] = await Promise.all([
          repositoryRef.current.getEntry(entryId),
          repositoryRef.current.getEntryHistory(entryId),
        ]);

        // Persist
        EntryStorage.setConnectedEntryId(entryId);
        setConnectedEntryId(entryId);
        setEntry(entryData);
        setHistory(historyData);

        // Set default display gameweek
        const currentGw = bootstrap.gameweeks.find((gw) => !gw.finished);
        const displayGw = currentGw
          ? currentGw.id
          : bootstrap.gameweeks[bootstrap.gameweeks.length - 1]?.id;
        setDisplayGameweekState(displayGw ?? null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to connect entry';
        setError(message);
        throw err;
      } finally {
        setIsConnecting(false);
      }
    },
    [bootstrap]
  );

  const disconnectEntry = useCallback(() => {
    EntryStorage.clearConnectedEntryId();
    setConnectedEntryId(null);
    setEntry(null);
    setHistory(null);
    setDisplayGameweekState(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshEntry = useCallback(async () => {
    if (!connectedEntryId) return;

    try {
      setIsLoading(true);
      const [entryData, historyData] = await Promise.all([
        repositoryRef.current.getEntry(connectedEntryId),
        repositoryRef.current.getEntryHistory(connectedEntryId),
      ]);
      setEntry(entryData);
      setHistory(historyData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh entry';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [connectedEntryId]);

  const setDisplayGameweek = useCallback((gameweek: number) => {
    setDisplayGameweekState(gameweek);
  }, []);

  return {
    connectedEntryId,
    isConnected: connectedEntryId !== null,
    entry,
    history,
    displayGameweek: displayGameweek ?? null,
    currentGameweekIndex,
    isCurrentGameweekActive,
    isLoading,
    isConnecting,
    error,
    connectEntry,
    disconnectEntry,
    clearError,
    refreshEntry,
    setDisplayGameweek,
  };
}
