import React from 'react';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import type { FantasyGameManagerFixture } from '../types';

export interface MyTeamSummaryProps {
  manager: FantasyGameManagerFixture;
  onViewTeam?: () => void;
}

export const MyTeamSummary: React.FC<MyTeamSummaryProps> = ({ manager, onViewTeam }) => {
  const metrics = [
    { label: 'Overall points', value: manager.overallPoints == null ? '—' : manager.overallPoints.toLocaleString() },
    { label: 'Overall rank', value: manager.overallRank == null ? 'Not ranked' : `#${manager.overallRank.toLocaleString()}` },
    { label: 'Squad value', value: manager.teamValue == null ? '—' : `£${manager.teamValue.toFixed(1)}m` },
    { label: 'In the bank', value: manager.bank == null ? '—' : `£${manager.bank.toFixed(1)}m` },
  ];

  return (
    <Card sx={{ height: '100%', overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)' }}>
      <Box sx={{ p: { xs: 2, md: 2.5 }, color: '#fff', background: 'linear-gradient(125deg, #00a8e8, #6d28d9)' }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 42, height: 42, display: 'grid', placeItems: 'center', border: '1px solid rgba(255,255,255,.45)', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,.12)' }}><ShieldOutlinedIcon /></Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" sx={{ opacity: 0.75, letterSpacing: 1 }}>My FPL team</Typography>
            <Typography variant="h5" sx={{ fontWeight: 900 }} noWrap>{manager.teamName || 'Unnamed Team'}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>{manager.name || 'Unknown Manager'}</Typography>
          </Box>
        </Stack>
      </Box>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.25, mb: 2 }}>
          {metrics.map((metric) => (
            <Box key={metric.label} sx={{ p: 1.5, borderRadius: '9px', backgroundColor: '#f8fafc', border: '1px solid #eef2f7' }}>
              <Typography variant="caption" color="text.secondary">{metric.label}</Typography>
              <Typography sx={{ fontWeight: 900, color: '#0f172a' }}>{metric.value}</Typography>
            </Box>
          ))}
        </Box>
        <Button fullWidth variant="contained" onClick={onViewTeam} endIcon={<ArrowForwardRoundedIcon />} sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '9px', backgroundColor: '#37003c', '&:hover': { backgroundColor: '#5b0a62' } }}>Open My Team</Button>
      </CardContent>
    </Card>
  );
};
