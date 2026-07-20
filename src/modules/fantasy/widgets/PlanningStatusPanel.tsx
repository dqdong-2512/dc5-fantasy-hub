/**
 * Planning Status Panel Widget
 * Compact integrated status for Transfer, Gameweek, and Season plans
 * Shows current state and direct navigation to each planner
 */

import React from 'react';
import { Box, Card, Stack, Typography, Button, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { ThemeTokens } from '@shared/theme/tokens';
import type {
  TransferPlanStatusData,
  GameweekPlanStatusData,
  SeasonPlanStatusData,
} from '../services/fantasy-dashboard.service';

interface PlanningStatusPanelProps {
  transferStatus: TransferPlanStatusData;
  gameweekStatus: GameweekPlanStatusData;
  seasonStatus: SeasonPlanStatusData;
  onTransferClick: () => void;
  onGameweekClick: () => void;
  onSeasonClick: () => void;
}

interface PlanStatusRowProps {
  label: string;
  status: 'ready' | 'incomplete' | 'missing' | 'error';
  details: string;
  actionLabel: string;
  onAction: () => void;
}

const PlanStatusRow: React.FC<PlanStatusRowProps> = ({
  label,
  status,
  details,
  actionLabel,
  onAction,
}) => {
  const statusConfig = {
    ready: { icon: <CheckCircleIcon sx={{ color: '#4caf50' }} />, color: '#4caf50' },
    incomplete: { icon: <EditIcon sx={{ color: '#ff9800' }} />, color: '#ff9800' },
    missing: { icon: <EditIcon sx={{ color: '#2196f3' }} />, color: '#2196f3' },
    error: { icon: <ErrorIcon sx={{ color: '#f44336' }} />, color: '#f44336' },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingY: ThemeTokens.spacing.sm,
        borderBottom: '1px solid #e0e0e0',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
        {statusConfig[status].icon}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {details}
          </Typography>
        </Box>
      </Box>
      <Button
        size="small"
        variant="outlined"
        onClick={onAction}
        sx={{
          textTransform: 'none',
          fontSize: '0.75rem',
          padding: '4px 8px',
        }}
      >
        {actionLabel}
      </Button>
    </Box>
  );
};

export const PlanningStatusPanel: React.FC<PlanningStatusPanelProps> = ({
  transferStatus,
  gameweekStatus,
  seasonStatus,
  onTransferClick,
  onGameweekClick,
  onSeasonClick,
}) => {
  // Determine transfer status display
  const transferStatusType = !transferStatus.hasActivePlan
    ? 'missing'
    : !transferStatus.isValid
      ? 'error'
      : 'ready';
  const transferDetails = !transferStatus.hasActivePlan
    ? 'No transfer plan'
    : `${transferStatus.moveCount} move${transferStatus.moveCount === 1 ? '' : 's'} planned`;

  // Determine gameweek status display
  const gameweekStatusType = !gameweekStatus.hasActivePlan
    ? 'missing'
    : !gameweekStatus.isReady
      ? 'incomplete'
      : 'ready';
  const gameweekDetails = !gameweekStatus.hasActivePlan
    ? `No plan for GW${gameweekStatus.gameweekId}`
    : `GW${gameweekStatus.gameweekId} • ${gameweekStatus.isReady ? 'Ready' : 'Incomplete'}`;

  // Determine season status display
  const seasonStatusType = !seasonStatus.hasActivePlan
    ? 'missing'
    : seasonStatus.hasConflicts
      ? 'error'
      : 'ready';
  const seasonDetails = !seasonStatus.hasActivePlan
    ? 'No season plan'
    : `${seasonStatus.startGameweekId}-${seasonStatus.endGameweekId} • ${seasonStatus.plannedTransfers} transfers`;

  return (
    <Card
      sx={{
        p: ThemeTokens.spacing.md,
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
      }}
    >
      {/* Header */}
      <Box sx={{ marginBottom: ThemeTokens.spacing.md }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            paddingBottom: ThemeTokens.spacing.sm,
            borderBottom: '2px solid #7c3aed',
          }}
        >
          Planning Status
        </Typography>
      </Box>

      {/* Status Rows */}
      <Stack spacing={0}>
        <PlanStatusRow
          label="Transfers"
          status={transferStatusType}
          details={transferDetails}
          actionLabel={!transferStatus.hasActivePlan ? 'Plan' : transferStatus.isValid ? 'Review' : 'Fix'}
          onAction={onTransferClick}
        />

        <PlanStatusRow
          label="Lineup"
          status={gameweekStatusType}
          details={gameweekDetails}
          actionLabel={!gameweekStatus.hasActivePlan ? 'Plan' : 'Review'}
          onAction={onGameweekClick}
        />

        <PlanStatusRow
          label="Season"
          status={seasonStatusType}
          details={seasonDetails}
          actionLabel={!seasonStatus.hasActivePlan ? 'Create' : 'Review'}
          onAction={onSeasonClick}
        />
      </Stack>

      {/* Error Alert if transfer invalid */}
      {transferStatus.hasActivePlan && !transferStatus.isValid && (
        <Alert severity="error" sx={{ marginTop: ThemeTokens.spacing.md }}>
          {transferStatus.errors} validation error{transferStatus.errors === 1 ? '' : 's'} in transfer plan
        </Alert>
      )}

      {/* Error Alert if season conflict */}
      {seasonStatus.hasConflicts && (
        <Alert severity="warning" sx={{ marginTop: ThemeTokens.spacing.md }}>
          Season plan has unresolved conflicts
        </Alert>
      )}
    </Card>
  );
};
