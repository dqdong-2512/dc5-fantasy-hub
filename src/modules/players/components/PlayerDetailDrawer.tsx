/**
 * Player Intelligence Center
 * Central workspace for evaluating players with comprehensive intelligence
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Divider,
  Card,
  CardContent,
  Badge as MUIBadge,
} from '@mui/material';
import type { Player } from '@domain/models';
import { Position } from '@domain/enums';
import { SideDrawer } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import {
  BuyScore,
  PerformanceOverview,
  FixtureIntelligence,
  TransferIntelligence,
  CaptainIntelligence,
  HistoricalTrends,
} from './intelligence';

export interface PlayerDetailDrawerProps {
  player: Player | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Player Intelligence Center
 * Central workspace for evaluating players with comprehensive intelligence
 */
export function PlayerDetailDrawer({
  player,
  open,
  onClose,
}: PlayerDetailDrawerProps): React.ReactElement {
  // Calculate placeholder buy score based on form and ownership
  // This must be called unconditionally before any early returns
  const buyScore = useMemo(() => {
    if (!player) return 50;
    const formScore = Math.min(100, player.form * 15);
    const ownershipScore = Math.max(0, 100 - player.ownership * 2);
    const priceScore = player.price < 80 ? 80 : player.price < 100 ? 60 : 40;
    return Math.round((formScore + ownershipScore + priceScore) / 3);
  }, [player]);

  if (!player) {
    return <></>;
  }

  const getBuyRecommendation = (
    score: number
  ): 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell' => {
    if (score >= 80) return 'strong_buy';
    if (score >= 65) return 'buy';
    if (score >= 50) return 'hold';
    if (score >= 35) return 'sell';
    return 'strong_sell';
  };

  const getPositionLabel = (position: string): string => {
    const positionMap: Record<string, string> = {
      [Position.Goalkeeper]: 'Goalkeeper',
      [Position.Defender]: 'Defender',
      [Position.Midfielder]: 'Midfielder',
      [Position.Forward]: 'Forward',
    };
    return positionMap[position] || position;
  };

  const getPositionColor = (position: string): string => {
    const colorMap: Record<string, string> = {
      [Position.Goalkeeper]: '#1e88e5',
      [Position.Defender]: '#fbc02d',
      [Position.Midfielder]: '#43a047',
      [Position.Forward]: '#e53935',
    };
    return colorMap[position] || '#9c27b0';
  };

  const recommendation = getBuyRecommendation(buyScore);

  return (
    <SideDrawer title="Intelligence Center" open={open} onClose={onClose}>
      <Stack spacing={ThemeTokens.spacing.xxl}>
        {/* Player Summary Section */}
        <Box>
          <Typography
            variant={ThemeTokens.typography.subsectionTitleVariant}
            sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
          >
            Player Summary
          </Typography>

          <Card>
            <CardContent>
              <Stack spacing={ThemeTokens.spacing.md}>
                {/* Player Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.md }}>
                  <MUIBadge
                    badgeContent={getPositionLabel(player.position).substring(0, 3)}
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: getPositionColor(player.position),
                        color: '#fff',
                        fontWeight: 600,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        backgroundColor: 'action.hover',
                        borderRadius: 1,
                      }}
                    />
                  </MUIBadge>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {player.displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {player.club} • {getPositionLabel(player.position)}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                {/* Key Stats Grid */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: ThemeTokens.spacing.md,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Price
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, marginTop: ThemeTokens.spacing.xs }}
                    >
                      £{(player.price / 10).toFixed(1)}m
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Selected By
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, marginTop: ThemeTokens.spacing.xs }}
                    >
                      {player.ownership.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Buy Score - Prominent Component */}
        <BuyScore
          score={buyScore}
          recommendation={recommendation}
          reasoning="Based on current form and market conditions"
        />

        {/* Performance Overview */}
        <PerformanceOverview player={player} />

        {/* Fixture Intelligence */}
        <FixtureIntelligence playerClub={player.club} />

        {/* Transfer Intelligence */}
        <TransferIntelligence playerPrice={player.price} playerOwnership={player.ownership} />

        {/* Captain Intelligence */}
        <CaptainIntelligence playerForm={player.form} playerOwnership={player.ownership} />

        {/* Historical Trends */}
        <HistoricalTrends playerName={player.displayName} />
      </Stack>
    </SideDrawer>
  );
}
