import type {
  FplAutomaticSubstitution,
  FplBootstrap,
  FplEntry,
  FplEntryHistory,
  FplEntryPicks,
  FplFixture,
  FplLeaguePage,
  FplLivePlayer,
} from './models';
import {
  asArray,
  asBoolean,
  asNullableNumber,
  asNullableString,
  asNumber,
  asString,
  isRecord,
} from './utils';

export class FplNormalizer {
  normalizeBootstrap(raw: unknown): FplBootstrap {
    const record = isRecord(raw) ? raw : {};
    return {
      gameweeks: asArray(record.events).map((value) => {
        const event = isRecord(value) ? value : {};
        return {
          id: asNumber(event.id),
          name: asString(event.name, `Gameweek ${asNumber(event.id)}`),
          deadlineTime: asNullableString(event.deadline_time),
          averageEntryScore: asNullableNumber(event.average_entry_score),
          highestScore: asNullableNumber(event.highest_score),
          finished: asBoolean(event.finished),
          dataChecked: asBoolean(event.data_checked),
          isCurrent: asBoolean(event.is_current),
          isNext: asBoolean(event.is_next),
          isPrevious: asBoolean(event.is_previous),
        };
      }),
      players: asArray(record.elements).map((value) => {
        const player = isRecord(value) ? value : {};
        return {
          id: asNumber(player.id),
          firstName: asString(player.first_name),
          secondName: asString(player.second_name),
          webName: asString(player.web_name),
          teamId: asNullableNumber(player.team),
          positionId: asNullableNumber(player.element_type),
          totalPoints: asNumber(player.total_points),
          price: asNumber(player.now_cost),
          status: asNullableString(player.status),
          code: asNumber(player.code),
          teamCode: asNullableNumber(player.team_code),
          squadNumber: asNullableNumber(player.squad_number),
          photo: asNullableString(player.photo),
          selectedByPercent: asString(player.selected_by_percent, '0'),
          form: asString(player.form, '0'),
          pointsPerGame: asString(player.points_per_game, '0'),
          minutes: asNumber(player.minutes),
          goalsScored: asNumber(player.goals_scored),
          assists: asNumber(player.assists),
          cleanSheets: asNumber(player.clean_sheets),
          goalsConceded: asNumber(player.goals_conceded),
          ownGoals: asNumber(player.own_goals),
          penaltiesSaved: asNumber(player.penalties_saved),
          penaltiesMissed: asNumber(player.penalties_missed),
          yellowCards: asNumber(player.yellow_cards),
          redCards: asNumber(player.red_cards),
        };
      }),
      teams: asArray(record.teams).map((value) => {
        const team = isRecord(value) ? value : {};
        return {
          id: asNumber(team.id),
          name: asString(team.name),
          shortName: asString(team.short_name),
          code: asNumber(team.code),
          strength: asNumber(team.strength),
          strengthOverallHome: asNumber(team.strength_overall_home),
          strengthOverallAway: asNumber(team.strength_overall_away),
          strengthAttackHome: asNumber(team.strength_attack_home),
          strengthAttackAway: asNumber(team.strength_attack_away),
          strengthDefenceHome: asNumber(team.strength_defence_home),
          strengthDefenceAway: asNumber(team.strength_defence_away),
        };
      }),
      elementTypes: asArray(record.element_types).map((value) => {
        const type = isRecord(value) ? value : {};
        return {
          id: asNumber(type.id),
          singularName: asString(type.singular_name),
          pluralName: asString(type.plural_name),
        };
      }),
      totalPlayers: asNumber(record.total_players),
    };
  }

  normalizeFixtures(raw: unknown): FplFixture[] {
    return asArray(raw).map((value) => {
      const fixture = isRecord(value) ? value : {};
      return {
        id: asNumber(fixture.id),
        gameweek: asNullableNumber(fixture.event),
        homeTeamId: asNullableNumber(fixture.team_h),
        awayTeamId: asNullableNumber(fixture.team_a),
        homeScore: asNullableNumber(fixture.team_h_score),
        awayScore: asNullableNumber(fixture.team_a_score),
        kickoffTime: asNullableString(fixture.kickoff_time),
        started: asBoolean(fixture.started),
        finished: asBoolean(fixture.finished),
        finishedProvisional: asBoolean(fixture.finished_provisional),
        minutes: asNullableNumber(fixture.minutes),
      };
    });
  }

  normalizeLivePlayers(raw: unknown): FplLivePlayer[] {
    const root = isRecord(raw) ? raw : {};
    return asArray(root.elements).map((value) => {
      const element = isRecord(value) ? value : {};
      const stats = isRecord(element.stats) ? element.stats : {};
      return {
        playerId: asNumber(element.id),
        minutes: asNumber(stats.minutes),
        totalPoints: asNumber(stats.total_points),
        bonus: asNumber(stats.bonus),
        bps: asNumber(stats.bps),
        goalsScored: asNumber(stats.goals_scored),
        assists: asNumber(stats.assists),
        cleanSheets: asNumber(stats.clean_sheets),
        goalsConceded: asNumber(stats.goals_conceded),
        ownGoals: asNumber(stats.own_goals),
        penaltiesSaved: asNumber(stats.penalties_saved),
        penaltiesMissed: asNumber(stats.penalties_missed),
        yellowCards: asNumber(stats.yellow_cards),
        redCards: asNumber(stats.red_cards),
        saves: asNumber(stats.saves),
      };
    });
  }

  normalizeEntry(raw: unknown): FplEntry {
    const entry = isRecord(raw) ? raw : {};
    const leagues = isRecord(entry.leagues) ? entry.leagues : {};
    const managerName = [asString(entry.player_first_name), asString(entry.player_last_name)]
      .filter(Boolean)
      .join(' ');
    return {
      id: asNumber(entry.id),
      teamName: asString(entry.name, 'Team'),
      managerName: managerName || 'Manager',
      overallPoints: asNumber(entry.summary_overall_points),
      overallRank: asNullableNumber(entry.summary_overall_rank),
      currentGameweek: asNullableNumber(entry.current_event),
      classicLeagueIds: asArray(leagues.classic)
        .map((value) => (isRecord(value) ? asNumber(value.id) : 0))
        .filter((id) => id > 0),
    };
  }

  normalizeEntryHistory(raw: unknown): FplEntryHistory {
    const history = isRecord(raw) ? raw : {};
    return {
      current: asArray(history.current).map((value) => {
        const item = isRecord(value) ? value : {};
        return {
          gameweek: asNumber(item.event),
          points: asNumber(item.points),
          totalPoints: asNumber(item.total_points),
          overallRank: asNullableNumber(item.overall_rank),
          transferCost: asNumber(item.event_transfers_cost),
          bank: asNumber(item.bank),
          teamValue: asNumber(item.value),
        };
      }),
      past: asArray(history.past).map((value) => {
        const item = isRecord(value) ? value : {};
        return {
          season: asString(item.season_name),
          points: asNumber(item.total_points),
          rank: asNullableNumber(item.rank),
        };
      }),
    };
  }

  normalizeEntryPicks(raw: unknown, entryId: number, gameweek: number): FplEntryPicks {
    const root = isRecord(raw) ? raw : {};
    const history = isRecord(root.entry_history) ? root.entry_history : {};
    const automaticSubstitutions: FplAutomaticSubstitution[] = asArray(root.automatic_subs).map(
      (value) => {
        const sub = isRecord(value) ? value : {};
        return {
          playerIn: asNumber(sub.element_in),
          playerOut: asNumber(sub.element_out),
          order: asNumber(sub.sub_order),
        };
      }
    );
    return {
      entryId,
      gameweek,
      activeChip: asNullableString(root.active_chip),
      transferCost: asNumber(history.event_transfers_cost),
      bank: asNullableNumber(history.bank),
      teamValue: asNullableNumber(history.value),
      picks: asArray(root.picks).map((value) => {
        const pick = isRecord(value) ? value : {};
        return {
          playerId: asNumber(pick.element),
          position: asNumber(pick.position),
          multiplier: asNumber(pick.multiplier),
          isCaptain: asBoolean(pick.is_captain),
          isViceCaptain: asBoolean(pick.is_vice_captain),
        };
      }),
      automaticSubstitutions,
    };
  }

  normalizeLeaguePage(raw: unknown, leagueId: number): FplLeaguePage {
    const root = isRecord(raw) ? raw : {};
    const league = isRecord(root.league) ? root.league : {};
    const standings = isRecord(root.standings) ? root.standings : {};
    const ranked = asArray(standings.results);
    const newEntries = isRecord(root.new_entries) ? root.new_entries : {};
    const source = ranked.length > 0 ? ranked : asArray(newEntries.results);

    return {
      leagueId,
      leagueName: asString(league.name, `League ${leagueId}`),
      page: asNumber(ranked.length > 0 ? standings.page : newEntries.page, 1),
      hasNext: asBoolean(ranked.length > 0 ? standings.has_next : newEntries.has_next),
      members: source.map((value, index) => {
        const member = isRecord(value) ? value : {};
        return {
          entryId: asNumber(member.entry),
          managerName:
            asString(member.player_name) ||
            [asString(member.player_first_name), asString(member.player_last_name)]
              .filter(Boolean)
              .join(' ') ||
            'Manager',
          teamName: asString(member.entry_name, 'Team'),
          rank: asNullableNumber(member.rank) ?? index + 1,
          previousRank: asNullableNumber(member.last_rank ?? member.previous_rank),
          gameweekPoints: asNumber(member.event_total),
          totalPoints: asNumber(member.total),
        };
      }),
    };
  }
}
