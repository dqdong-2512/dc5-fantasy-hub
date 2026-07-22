/**
 * Comparison Pitch View Component
 * Displays side-by-side team lineups on football pitches
 * Uses prepared GameweekComparison data from service
 */

import React, { useState } from 'react';
import { Box, Card, CardContent, Stack, Typography, Popover, Paper, Chip } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { GameweekComparison, PlayerComparison } from '../services/GameweekHeadToHeadService';
import type { FantasyLeagueStanding } from '@domain/models';

export interface ComparisonPitchViewProps {
  comparison: GameweekComparison;
  myManager: FantasyLeagueStanding;
  opponentManager: FantasyLeagueStanding;
}

interface FormationConfig {
  gk: number;
  def: number;
  mid: number;
  fwd: number;
}

/**
 * Determine formation from players
 */
const detectFormation = (players: PlayerComparison[]): FormationConfig => {
  const active = players.filter((p) => p.myTeamMultiplier > 0);

  let gk = 0;
  let def = 0;
  let mid = 0;
  let fwd = 0;

  active.forEach((p) => {
    if (p.position === 'Goalkeeper') gk += 1;
    else if (p.position === 'Defender') def += 1;
    else if (p.position === 'Midfielder') mid += 1;
    else if (p.position === 'Forward') fwd += 1;
  });

  return { gk, def, mid, fwd };
};

/**
 * Player marker component for pitch
 */
const PitchPlayerMarker: React.FC<{
  player: PlayerComparison;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  isOwn: boolean;
}> = ({ player, onClick, isOwn }) => {
  const multiplier = isOwn ? player.myTeamMultiplier : player.opponentMultiplier;
  const effectivePoints = isOwn ? player.myTeamEffectivePoints : player.opponentEffectivePoints;

  // Determine visual styling based on status
  const getStatusColor = () => {
    if (player.status === 'common') return '#e8eaf6';
    if (isOwn && player.status === 'myDifferential') return '#c8e6c9';
    if (!isOwn && player.status === 'opponentDifferential') return '#ffccbc';
    return '#f5f5f5';
  };

  const getStatusBorder = () => {
    if (player.status === 'common') return '2px solid #5e35b1';
    if (isOwn && player.status === 'myDifferential') return '2px solid #2e7d32';
    if (!isOwn && player.status === 'opponentDifferential') return '2px solid #d84315';
    return '2px solid #999';
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        width: 56,
        height: 70,
        backgroundColor: getStatusColor(),
        border: getStatusBorder(),
        borderRadius: ThemeTokens.borderRadius.sm,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: ThemeTokens.spacing.xs,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Captain Badge */}
      {player.isCaptain && (
        <Box
          sx={{
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: '#d32f2f',
            color: '#fff',
            width: 24,
            height: 24,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '12px',
            border: '2px solid #fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        >
          C
        </Box>
      )}

      {/* Vice Captain Badge */}
      {player.isViceCaptain && !player.isCaptain && (
        <Box
          sx={{
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: '#f57c00',
            color: '#fff',
            width: 24,
            height: 24,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '12px',
            border: '2px solid #fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        >
          V
        </Box>
      )}

      {/* Differential indicator */}
      {player.status !== 'common' && (
        <Box
          sx={{
            position: 'absolute',
            top: -4,
            left: -4,
            backgroundColor: player.status === 'myDifferential' ? '#2e7d32' : '#d84315',
            color: '#fff',
            width: 20,
            height: 20,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '10px',
            border: '1px solid #fff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
        >
          D
        </Box>
      )}

      {/* Player name */}
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          fontSize: '10px',
          textAlign: 'center',
          lineHeight: 1.1,
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {player.playerName.split(' ').slice(-1)[0]}
      </Typography>

      {/* Points */}
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          fontSize: '9px',
          color: effectivePoints > 0 ? '#2e7d32' : '#666',
        }}
      >
        {effectivePoints}
      </Typography>

      {/* Multiplier indicator */}
      {multiplier > 1 && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '8px',
            color: '#666',
            fontStyle: 'italic',
          }}
        >
          ×{multiplier}
        </Typography>
      )}
    </Box>
  );
};

/**
 * Formation row on pitch
 */
const FormationRow: React.FC<{
  players: PlayerComparison[];
  onPlayerClick: (player: PlayerComparison, event: React.MouseEvent<HTMLDivElement>) => void;
  isOwn: boolean;
}> = ({ players, onPlayerClick, isOwn }) => {
  if (players.length === 0) return null;

  return (
    <Box sx={{ marginY: ThemeTokens.spacing.md }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: ThemeTokens.spacing.md,
          flexWrap: 'wrap',
        }}
      >
        {players.map((player) => (
          <PitchPlayerMarker
            key={player.playerId}
            player={player}
            onClick={(e) => onPlayerClick(player, e)}
            isOwn={isOwn}
          />
        ))}
      </Box>
    </Box>
  );
};

/**
 * Single team pitch
 */
const TeamPitch: React.FC<{
  players: PlayerComparison[];
  managerName: string;
  gwPoints: number;
  onPlayerClick: (player: PlayerComparison, event: React.MouseEvent<HTMLDivElement>) => void;
  isOwn: boolean;
}> = ({ players, managerName, gwPoints, onPlayerClick, isOwn }) => {
  // Separate starters and bench
  const multiplier = isOwn ? 'myTeamMultiplier' : 'opponentMultiplier';
  const starters = players.filter((p) => p[multiplier] > 0);
  const bench = players.filter((p) => p[multiplier] === 0);

  // Detect formation
  const formation = detectFormation(starters);

  // Group starters by position
  const gkPlayers = starters.filter((p) => p.position === 'Goalkeeper');
  const defPlayers = starters.filter((p) => p.position === 'Defender');
  const midPlayers = starters.filter((p) => p.position === 'Midfielder');
  const fwdPlayers = starters.filter((p) => p.position === 'Forward');

  return (
    <Card variant="outlined">
      <CardContent>
        {/* Header */}
        <Box sx={{ marginBottom: ThemeTokens.spacing.md }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {managerName}
          </Typography>
          <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
            {gwPoints} points
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Formation: {formation.def}-{formation.mid}-{formation.fwd}
          </Typography>
        </Box>

        {/* Pitch visualization */}
        <Box
          sx={{
            background: 'linear-gradient(to bottom, #2d5016 0%, #3a6b1f 50%, #2d5016 100%)',
            borderRadius: ThemeTokens.borderRadius.md,
            padding: ThemeTokens.spacing.lg,
            minHeight: 320,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
          }}
        >
          {/* Goalkeeper */}
          <FormationRow players={gkPlayers} onPlayerClick={onPlayerClick} isOwn={isOwn} />

          {/* Defenders */}
          <FormationRow players={defPlayers} onPlayerClick={onPlayerClick} isOwn={isOwn} />

          {/* Midfielders */}
          <FormationRow players={midPlayers} onPlayerClick={onPlayerClick} isOwn={isOwn} />

          {/* Forwards */}
          <FormationRow players={fwdPlayers} onPlayerClick={onPlayerClick} isOwn={isOwn} />
        </Box>

        {/* Bench */}
        {bench.length > 0 && (
          <Box sx={{ marginTop: ThemeTokens.spacing.md }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: '#666',
                display: 'block',
                marginBottom: ThemeTokens.spacing.xs,
              }}
            >
              Bench
            </Typography>
            <Box sx={{ display: 'flex', gap: ThemeTokens.spacing.xs, flexWrap: 'wrap' }}>
              {bench.map((player) => (
                <PitchPlayerMarker
                  key={player.playerId}
                  player={player}
                  onClick={(e) => onPlayerClick(player, e)}
                  isOwn={isOwn}
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Player detail popover
 */
const PlayerDetailPopover: React.FC<{
  player: PlayerComparison | null;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  isOwn: boolean;
}> = ({ player, anchorEl, onClose, isOwn }) => {
  if (!player) return null;

  const multiplier = isOwn ? player.myTeamMultiplier : player.opponentMultiplier;
  const effectivePoints = isOwn ? player.myTeamEffectivePoints : player.opponentEffectivePoints;

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Paper sx={{ padding: ThemeTokens.spacing.md, maxWidth: 280 }}>
        <Stack spacing={ThemeTokens.spacing.sm}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {player.playerName}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {player.position} • {player.team}
            </Typography>
          </Box>

          <Box sx={{ borderTop: '1px solid #e0e0e0', paddingTop: ThemeTokens.spacing.sm }}>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Raw Points: {player.gameweekPoints}
            </Typography>
            <br />
            <Typography variant="caption" sx={{ color: '#666' }}>
              Multiplier: ×{multiplier}
            </Typography>
            <br />
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: '#2e7d32', marginTop: ThemeTokens.spacing.xs }}
            >
              Effective: {effectivePoints}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: ThemeTokens.spacing.xs, flexWrap: 'wrap' }}>
            {player.isCaptain && (
              <Chip label="Captain" size="small" color="error" variant="outlined" />
            )}
            {player.isViceCaptain && (
              <Chip label="Vice Captain" size="small" color="warning" variant="outlined" />
            )}
            {player.status === 'myDifferential' && (
              <Chip label="My Differential" size="small" color="success" variant="outlined" />
            )}
            {player.status === 'opponentDifferential' && (
              <Chip label="Opponent Differential" size="small" color="error" variant="outlined" />
            )}
            {player.status === 'common' && <Chip label="Common" size="small" variant="outlined" />}
          </Box>
        </Stack>
      </Paper>
    </Popover>
  );
};

/**
 * Main comparison pitch view component
 */
export const ComparisonPitchView: React.FC<ComparisonPitchViewProps> = ({
  comparison,
  myManager,
  opponentManager,
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerComparison | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isOwnPlayer, setIsOwnPlayer] = useState(true);

  const handlePlayerClick = (
    player: PlayerComparison,
    event: React.MouseEvent<HTMLDivElement>,
    isOwn: boolean
  ) => {
    setSelectedPlayer(player);
    setAnchorEl(event.currentTarget);
    setIsOwnPlayer(isOwn);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  return (
    <Stack spacing={ThemeTokens.spacing.lg}>
      {/* Side-by-side pitches */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: ThemeTokens.spacing.lg,
        }}
      >
        <Box onClick={(e) => e.stopPropagation()}>
          <TeamPitch
            players={comparison.players}
            managerName={myManager.playerName}
            gwPoints={comparison.myGameweekPoints}
            onPlayerClick={(p, e) => handlePlayerClick(p, e, true)}
            isOwn={true}
          />
        </Box>

        <Box onClick={(e) => e.stopPropagation()}>
          <TeamPitch
            players={comparison.players}
            managerName={opponentManager.playerName}
            gwPoints={comparison.opponentGameweekPoints}
            onPlayerClick={(p, e) => handlePlayerClick(p, e, false)}
            isOwn={false}
          />
        </Box>
      </Box>

      {/* Player detail popover */}
      <PlayerDetailPopover
        player={selectedPlayer}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        isOwn={isOwnPlayer}
      />
    </Stack>
  );
};
