/**
 * Differential Analysis Component
 * Shows differential players and their impact
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { DifferentialAnalysis } from '@domain/models';

export interface DifferentialAnalysisProps {
  analysis: DifferentialAnalysis;
}

export const DifferentialAnalysisSection: React.FC<DifferentialAnalysisProps> = ({ analysis }) => {
  return (
    <Box sx={{ mb: ThemeTokens.spacing.lg }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: '0.95rem',
          mb: ThemeTokens.spacing.md,
        }}
      >
        Differential Analysis
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: ThemeTokens.spacing.md,
          mb: ThemeTokens.spacing.md,
        }}
      >
        {/* Your Differentials */}
        <Paper sx={{ p: ThemeTokens.spacing.md, backgroundColor: '#fafafa' }}>
          <Typography
            sx={{
              fontSize: '0.85rem',
              fontWeight: 600,
              mb: ThemeTokens.spacing.sm,
              color: '#666',
            }}
          >
            Your Differentials ({analysis.currentManagerDifferentials.length})
          </Typography>

          {analysis.currentManagerDifferentials.length === 0 ? (
            <Typography sx={{ fontSize: '0.85rem', color: '#999' }}>None</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {analysis.currentManagerDifferentials.slice(0, 5).map((player) => (
                <Box
                  key={player.playerId}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '0.8rem' }}>
                    {player.playerName || `Player ${player.playerId}`}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: player.gameweekContribution > 0 ? '#4caf50' : '#666',
                    }}
                  >
                    {player.gameweekContribution}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          <Box
            sx={{
              mt: ThemeTokens.spacing.sm,
              pt: ThemeTokens.spacing.sm,
              borderTop: '1px solid #e0e0e0',
              textAlign: 'right',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#333',
              }}
            >
              Total: {analysis.currentManagerDifferentialTotal}
            </Typography>
          </Box>
        </Paper>

        {/* Rival Differentials */}
        <Paper sx={{ p: ThemeTokens.spacing.md, backgroundColor: '#fafafa' }}>
          <Typography
            sx={{
              fontSize: '0.85rem',
              fontWeight: 600,
              mb: ThemeTokens.spacing.sm,
              color: '#666',
            }}
          >
            Rival Differentials ({analysis.opponentManagerDifferentials.length})
          </Typography>

          {analysis.opponentManagerDifferentials.length === 0 ? (
            <Typography sx={{ fontSize: '0.85rem', color: '#999' }}>None</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {analysis.opponentManagerDifferentials.slice(0, 5).map((player) => (
                <Box
                  key={player.playerId}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '0.8rem' }}>
                    {player.playerName || `Player ${player.playerId}`}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: player.gameweekContribution > 0 ? '#4caf50' : '#666',
                    }}
                  >
                    {player.gameweekContribution}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          <Box
            sx={{
              mt: ThemeTokens.spacing.sm,
              pt: ThemeTokens.spacing.sm,
              borderTop: '1px solid #e0e0e0',
              textAlign: 'right',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#333',
              }}
            >
              Total: {analysis.opponentManagerDifferentialTotal}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Differential Advantage */}
      <Box
        sx={{
          textAlign: 'center',
          pt: ThemeTokens.spacing.md,
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: '#999',
            fontWeight: 600,
            mb: 0.5,
            textTransform: 'uppercase',
          }}
        >
          Differential Advantage
        </Typography>
        <Typography
          sx={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color:
              analysis.differentialSwing > 0
                ? '#4caf50'
                : analysis.differentialSwing < 0
                  ? '#f44336'
                  : '#666',
          }}
        >
          {analysis.differentialSwing > 0
            ? 'YOU +'
            : analysis.differentialSwing < 0
              ? 'RIVAL +'
              : ''}
          {Math.abs(analysis.differentialSwing)}
        </Typography>
      </Box>

      {/* Biggest Swing */}
      {analysis.biggestSwingPlayer && (
        <Box
          sx={{
            mt: ThemeTokens.spacing.md,
            pt: ThemeTokens.spacing.md,
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.85rem',
              fontWeight: 600,
              mb: ThemeTokens.spacing.sm,
              color: '#666',
            }}
          >
            Biggest Differential Swing
          </Typography>
          <Paper
            sx={{ p: ThemeTokens.spacing.md, backgroundColor: '#fff', border: '1px solid #e0e0e0' }}
          >
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, mb: 0.5 }}>
              {analysis.biggestSwingPlayer.playerName ||
                `Player ${analysis.biggestSwingPlayer.playerId}`}
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#666', mb: 0.5 }}>
              {analysis.biggestSwingPlayer.manager === 'current' ? 'YOU OWNED' : 'RIVAL OWNED'}
            </Typography>
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 700,
                color: analysis.biggestSwingPlayer.swing > 0 ? '#4caf50' : '#f44336',
              }}
            >
              {analysis.biggestSwingPlayer.swing > 0 ? '+' : ''}
              {analysis.biggestSwingPlayer.swing} pts
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};
