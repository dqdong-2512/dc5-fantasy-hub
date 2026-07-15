/**
 * Player Presenter
 * Transforms domain Player model into presentation models for UI consumption
 * Handles all formatting and derived data calculation
 */

import type { Player } from '@domain/models';
import { Position } from '@domain/enums';
import * as Formats from './formats';

/**
 * Player presentation model for table/list display
 */
export interface PlayerListPresentation {
  id: number;
  name: string;
  club: string;
  position: string;
  positionBadge: string;
  price: string;
  priceValue: number;
  ownership: string;
  form: string;
  totalPoints: string;
  pointsPerGame: string;
  minutes: string;
  status: string;
  image: string;
  formColor: string;
  ownershipColor: string;
}

/**
 * Player presentation model for detail/card display
 */
export interface PlayerDetailPresentation extends PlayerListPresentation {
  firstName: string;
  lastName: string;
  goalsScored: string;
  assists: string;
  cleanSheets: string;
  goalsConceded: string;
  yellowCards: string;
  redCards: string;
  influence: string;
  creativity: string;
  threat: string;
  ictIndex: string;
}

/**
 * Convert domain Player to list presentation model
 */
export function toPlayerListPresentation(player: Player): PlayerListPresentation {
  const positionLabel = getPositionLabel(player.position);
  return {
    id: player.id,
    name: player.displayName,
    club: player.club,
    position: positionLabel,
    positionBadge: Formats.formatPositionBadge(positionLabel),
    price: Formats.formatPrice(player.price),
    priceValue: player.price,
    ownership: Formats.formatOwnership(player.ownership),
    form: Formats.formatForm(player.form),
    totalPoints: Formats.formatTotalPoints(player.totalPoints),
    pointsPerGame: Formats.formatPointsPerGame(player.pointsPerGame),
    minutes: Formats.formatMinutes(player.minutesPlayed),
    status: player.status || 'available',
    image: Formats.getPlayerImageUrl(player.clubCode),
    formColor: Formats.getFormColor(player.form),
    ownershipColor: Formats.getOwnershipColor(player.ownership),
  };
}

/**
 * Convert domain Player to detail presentation model
 */
export function toPlayerDetailPresentation(player: Player): PlayerDetailPresentation {
  const listPresentation = toPlayerListPresentation(player);
  return {
    ...listPresentation,
    firstName: player.firstName,
    lastName: player.lastName,
    goalsScored: Formats.formatStatistic(player.goalsScored),
    assists: Formats.formatStatistic(player.assists),
    cleanSheets: Formats.formatStatistic(player.cleanSheets),
    goalsConceded: Formats.formatStatistic(player.goalsConceded),
    yellowCards: Formats.formatStatistic(player.yellowCards),
    redCards: Formats.formatStatistic(player.redCards),
    influence: Formats.formatICT(player.influence || 0),
    creativity: Formats.formatICT(player.creativity || 0),
    threat: Formats.formatICT(player.threat || 0),
    ictIndex: Formats.formatICT(player.ictIndex || 0),
  };
}

/**
 * Get human-readable position label
 */
function getPositionLabel(position: string): string {
  const labelMap: Record<string, string> = {
    [Position.Goalkeeper]: 'Goalkeeper',
    [Position.Defender]: 'Defender',
    [Position.Midfielder]: 'Midfielder',
    [Position.Forward]: 'Forward',
  };
  return labelMap[position] || position;
}

/**
 * Player presenter utility
 */
export class PlayerPresenter {
  static toListPresentation(player: Player): PlayerListPresentation {
    return toPlayerListPresentation(player);
  }

  static toDetailPresentation(player: Player): PlayerDetailPresentation {
    return toPlayerDetailPresentation(player);
  }

  static toListPresentations(players: Player[]): PlayerListPresentation[] {
    return players.map((player) => toPlayerListPresentation(player));
  }

  static toDetailPresentations(players: Player[]): PlayerDetailPresentation[] {
    return players.map((player) => toPlayerDetailPresentation(player));
  }
}
