import type { Team, Player } from '@domain/models';
import type { PlayerFilters } from '../types';

const AVAILABLE_STATUSES = new Set(['a']);
const DOUBTFUL_STATUSES = new Set(['d']);

export function getPlayerStatusLabel(status?: string): string {
  const normalizedStatus = (status ?? 'u').toLowerCase();

  if (AVAILABLE_STATUSES.has(normalizedStatus)) {
    return 'Available';
  }

  if (DOUBTFUL_STATUSES.has(normalizedStatus)) {
    return 'Doubtful';
  }

  return 'Unavailable';
}

function matchesAvailability(player: Player, availability: PlayerFilters['availability']): boolean {
  if (availability === 'all') {
    return true;
  }

  const statusLabel = getPlayerStatusLabel(player.status);

  if (availability === 'available') {
    return statusLabel === 'Available';
  }

  if (availability === 'doubtful') {
    return statusLabel === 'Doubtful';
  }

  return statusLabel === 'Unavailable';
}

function matchesPriceBand(player: Player, priceBand: PlayerFilters['priceBand']): boolean {
  if (priceBand === 'all') {
    return true;
  }

  if (priceBand === 'budget') {
    return player.price <= 55;
  }

  if (priceBand === 'mid') {
    return player.price >= 56 && player.price <= 80;
  }

  return player.price >= 81;
}

export function applyPlayerFilters(
  players: Player[],
  filters: PlayerFilters,
  teamById: Map<number, Team>
): Player[] {
  const normalizedSearch = filters.search.trim().toLowerCase();

  return players.filter((player) => {
    if (normalizedSearch) {
      const teamName = teamById.get(player.teamId)?.name.toLowerCase() ?? player.club.toLowerCase();
      const isSearchMatch =
        player.displayName.toLowerCase().includes(normalizedSearch) ||
        player.firstName.toLowerCase().includes(normalizedSearch) ||
        player.lastName.toLowerCase().includes(normalizedSearch) ||
        teamName.includes(normalizedSearch);

      if (!isSearchMatch) {
        return false;
      }
    }

    if (filters.position !== 'all' && player.position !== filters.position) {
      return false;
    }

    if (filters.clubId !== 'all' && player.teamId !== filters.clubId) {
      return false;
    }

    if (!matchesPriceBand(player, filters.priceBand)) {
      return false;
    }

    if (!matchesAvailability(player, filters.availability)) {
      return false;
    }

    return true;
  });
}

export function sortPlayers(
  players: Player[],
  sortBy: PlayerFilters['sortBy'],
  sortOrder: PlayerFilters['sortOrder']
): Player[] {
  const direction = sortOrder === 'asc' ? 1 : -1;

  return [...players].sort((a, b) => {
    if (sortBy === 'displayName') {
      return a.displayName.localeCompare(b.displayName) * direction;
    }

    const aValue = a[sortBy] ?? 0;
    const bValue = b[sortBy] ?? 0;

    if (aValue < bValue) {
      return -1 * direction;
    }

    if (aValue > bValue) {
      return 1 * direction;
    }

    return a.displayName.localeCompare(b.displayName);
  });
}

export function hasActivePlayerFilters(filters: PlayerFilters): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.position !== 'all' ||
    filters.clubId !== 'all' ||
    filters.priceBand !== 'all' ||
    filters.availability !== 'all'
  );
}
