/**
 * useFantasyGame Hook
 * Manages Fantasy Game connection state and data
 */

import { useState, useCallback, useEffect } from 'react';
import { EntryStorage } from '@shared/services/entry-storage';
import { FantasyGameRepository } from '@repositories/fantasy';
import type { FantasyEntry } from '@domain/models';

export interface UseFantasyGameState {
  // Connection state
  connectedEntryId: number | null;
  isConnected: boolean;

  // Data
  entry: FantasyEntry | null;

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
}

export function useFantasyGame(): UseFantasyGameState {
  const [connectedEntryId, setConnectedEntryId] = useState<number | null>(null);
  const [entry, setEntry] = useState<FantasyEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = new FantasyGameRepository();

  // Load entry on startup or when ID changes
  useEffect(() => {
    const loadStoredEntry = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const storedId = EntryStorage.getConnectedEntryId();
        setConnectedEntryId(storedId);

        if (storedId) {
          try {
            const entryData = await repository.getEntry(storedId);
            setEntry(entryData);
          } catch (err) {
            // Entry ID invalid or API error
            console.error('Failed to load entry:', err);
            setError(
              'Unable to load entry. The Entry ID may be invalid or the API is unavailable.'
            );
            setConnectedEntryId(null);
            setEntry(null);
            EntryStorage.clearConnectedEntryId();
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredEntry();
  }, []);

  const connectEntry = useCallback(
    async (entryId: number) => {
      try {
        setIsConnecting(true);
        setError(null);

        // Validate entry exists and is accessible
        const entryData = await repository.getEntry(entryId);

        // Persist
        EntryStorage.setConnectedEntryId(entryId);
        setConnectedEntryId(entryId);
        setEntry(entryData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to connect entry';
        setError(message);
        throw err;
      } finally {
        setIsConnecting(false);
      }
    },
    [repository]
  );

  const disconnectEntry = useCallback(() => {
    EntryStorage.clearConnectedEntryId();
    setConnectedEntryId(null);
    setEntry(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshEntry = useCallback(async () => {
    if (!connectedEntryId) return;

    try {
      setIsLoading(true);
      const entryData = await repository.getEntry(connectedEntryId);
      setEntry(entryData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh entry';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [connectedEntryId, repository]);

  return {
    connectedEntryId,
    isConnected: connectedEntryId !== null,
    entry,
    isLoading,
    isConnecting,
    error,
    connectEntry,
    disconnectEntry,
    clearError,
    refreshEntry,
  };
}
