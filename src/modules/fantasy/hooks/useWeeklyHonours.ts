import { useEffect, useMemo, useState } from 'react';
import { FplClient, type BootstrapStatic, type Player as ApiPlayer } from '@shared/services/fpl-client';

export interface WeeklyHonourPlayer {
  id: number;
  name: string;
  photo: string;
  playerCode: number;
  team: string;
  position: string;
  points: number;
  status: string;
  news: string;
  chanceOfPlaying: number | null;
}

export interface PlayerOfWeekEntry {
  gameweek: number;
  player: WeeklyHonourPlayer | null;
}

export interface UseWeeklyHonoursState {
  teamOfWeek: WeeklyHonourPlayer[];
  playerOfWeek: PlayerOfWeekEntry[];
  availability: WeeklyHonourPlayer[];
  isLoading: boolean;
  error: string | null;
}

const positionLabels: Record<number, string> = {
  1: 'GKP',
  2: 'DEF',
  3: 'MID',
  4: 'FWD',
};

function toHonourPlayer(
  player: ApiPlayer,
  bootstrap: BootstrapStatic,
  points = 0
): WeeklyHonourPlayer {
  const team = bootstrap.teams.find((item) => item.id === player.team);
  return {
    id: player.id,
    name: player.web_name,
    photo: player.photo,
    playerCode: player.team_code,
    team: team?.name ?? 'Unknown club',
    position: positionLabels[player.element_type] ?? 'Player',
    points,
    status: player.status,
    news: player.news ?? '',
    chanceOfPlaying:
      player.chance_of_playing_next_round ?? player.chance_of_playing_this_round ?? null,
  };
}

function selectTeamOfWeek(
  bootstrap: BootstrapStatic,
  pointsByPlayer: Map<number, number>
): WeeklyHonourPlayer[] {
  const scored = bootstrap.elements
    .map((player) => toHonourPlayer(player, bootstrap, pointsByPlayer.get(player.id) ?? 0))
    .sort((left, right) => right.points - left.points || left.name.localeCompare(right.name));
  if (!scored.some((player) => player.points > 0)) return [];
  const quotas: Record<string, number> = { GKP: 1, DEF: 4, MID: 4, FWD: 2 };
  const selected = Object.entries(quotas).flatMap(([position, count]) =>
    scored.filter((player) => player.position === position).slice(0, count)
  );
  if (selected.length < 11) {
    const selectedIds = new Set(selected.map((player) => player.id));
    selected.push(...scored.filter((player) => !selectedIds.has(player.id)).slice(0, 11 - selected.length));
  }
  return selected;
}

export function useWeeklyHonours(gameweekId: number): UseWeeklyHonoursState {
  const client = useMemo(() => new FplClient(), []);
  const [state, setState] = useState<UseWeeklyHonoursState>({
    teamOfWeek: [],
    playerOfWeek: [],
    availability: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    void Promise.all([client.getBootstrap(), client.getEventLive(gameweekId)])
      .then(([bootstrap, live]) => {
        if (!active) return;
        const pointsByPlayer = new Map(
          live.elements.map((item) => [item.id, item.stats.total_points] as const)
        );
        const playerById = new Map(bootstrap.elements.map((player) => [player.id, player]));
        const playerOfWeek = bootstrap.events.slice(0, 9).map((event) => {
          const topId = event.top_element_info?.id ?? event.top_element;
          const top = topId ? playerById.get(topId) : undefined;
          return {
            gameweek: event.id,
            player: top
              ? toHonourPlayer(top, bootstrap, event.top_element_info?.points ?? 0)
              : null,
          };
        });
        const availability = bootstrap.elements
          .filter((player) => player.status !== 'a')
          .sort(
            (left, right) =>
              Number(right.selected_by_percent) - Number(left.selected_by_percent)
          )
          .slice(0, 8)
          .map((player) => toHonourPlayer(player, bootstrap));
        setState({
          teamOfWeek: selectTeamOfWeek(bootstrap, pointsByPlayer),
          playerOfWeek,
          availability,
          isLoading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setState((current) => ({
          ...current,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Weekly honours are unavailable.',
        }));
      });
    return () => {
      active = false;
    };
  }, [client, gameweekId]);

  return state;
}
