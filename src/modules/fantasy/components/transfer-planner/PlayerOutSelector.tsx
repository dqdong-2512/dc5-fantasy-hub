/**
 * Player Out Selector Component
 * Allows selecting a player from current squad to transfer out
 */

import React, { useMemo } from 'react';
import { Box, Typography, Card, CardContent, Stack, TextField, Chip } from '@mui/material';
import { PlayerRepository } from '@repositories/players';
import type { SquadPlayer } from '../../domain/TransferPlan';
import { ThemeTokens } from '@shared/theme/tokens';

export interface PlayerOutSelectorProps {
  currentSquad: SquadPlayer[];
  selectedPlayerId: number | null;
  onSelect: (playerId: number | null) => void;
}

export const PlayerOutSelector: React.FC<PlayerOutSelectorProps> = ({
  currentSquad,
  selectedPlayerId,
  onSelect,
}) => {
  const playerRepo = useMemo(() => new PlayerRepository(), []);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filter squad by search term
  const filteredSquad = useMemo(() => {
    if (!searchTerm.trim()) return currentSquad;

    const lower = searchTerm.toLowerCase();
    return currentSquad.filter((pick) => {
      const player = playerRepo.getById(pick.playerId);
      if (!player) return false;
      return (
        player.displayName.toLowerCase().includes(lower) ||
        player.club.toLowerCase().includes(lower)
      );
    });
  }, [currentSquad, searchTerm, playerRepo]);

  // Get selected player for display
  const selectedPlayer = useMemo(() => {
    if (!selectedPlayerId) return null;
    return playerRepo.getById(selectedPlayerId);
  }, [selectedPlayerId, playerRepo]);

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.md }}
      >
        Select Player to Transfer Out
      </Typography>

      {/* Selected Player Display */}
      {selectedPlayer && (
        <Card sx={{ marginBottom: ThemeTokens.spacing.md, backgroundColor: '#e3f2fd' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedPlayer.displayName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedPlayer.club} • £{(selectedPlayer.price / 10).toFixed(1)}m
                </Typography>
              </Box>
              <Chip label="Selected" color="primary" sx={{ backgroundColor: '#1976d2' }} />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <TextField
        size="small"
        placeholder="Search players..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ marginBottom: ThemeTokens.spacing.md, width: '100%' }}
      />

      {/* Squad List */}
      <Stack spacing={1} sx={{ maxHeight: '500px', overflowY: 'auto' }}>
        {filteredSquad.map((pick) => {
          const player = playerRepo.getById(pick.playerId);
          if (!player) return null;

          const isSelected = selectedPlayerId === pick.playerId;

          return (
            <Card
              key={pick.playerId}
              onClick={() => onSelect(isSelected ? null : pick.playerId)}
              sx={{
                cursor: 'pointer',
                backgroundColor: isSelected ? '#e3f2fd' : '#fff',
                border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                '&:hover': {
                  backgroundColor: isSelected ? '#e3f2fd' : '#f5f5f5',
                },
              }}
            >
              <CardContent sx={{ paddingY: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {player.displayName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {player.club} • {pick.isStarter ? 'Starter' : 'Bench'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      £{(player.price / 10).toFixed(1)}m
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {player.totalPoints} pts
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {filteredSquad.length === 0 && (
        <Box sx={{ padding: ThemeTokens.spacing.lg, textAlign: 'center' }}>
          <Typography color="textSecondary">No players match search</Typography>
        </Box>
      )}
    </Box>
  );
};
