import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import { CountryFlag, PageContent, PageHeader, PageSection, StatusChip } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { ASEAN_CUP_2026_TOURNAMENT_CONFIG } from './config/tournament.config';
import type { TournamentFixture, TournamentFixtureStatus } from './models';
import { useTournamentCenter } from './hooks';

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

function formatMatchDate(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return 'Ngày thi đấu sẽ được công bố';
  }
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatKickoffTime(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return 'Giờ thi đấu sẽ được công bố';
  }
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function formatScore(homeScore: number | null, awayScore: number | null): string {
  if (homeScore === null || awayScore === null) {
    return 'vs';
  }
  return `${homeScore} - ${awayScore}`;
}

function getFixtureStatusColor(
  status: TournamentFixtureStatus
): 'default' | 'success' | 'warning' | 'error' | 'info' {
  if (status === 'live') {
    return 'error';
  }
  if (status === 'half-time') {
    return 'warning';
  }
  if (status === 'finished') {
    return 'success';
  }
  if (status === 'upcoming') {
    return 'info';
  }
  return 'default';
}

function getFixtureStatusLabel(fixture: TournamentFixture): string {
  if (fixture.status === 'half-time') {
    return 'Hết hiệp một';
  }
  if (fixture.status === 'live') {
    if (fixture.minute !== null) {
      if (fixture.addedTime !== null && fixture.addedTime > 0) {
        return `${fixture.minute}+${fixture.addedTime}'`;
      }
      return `${fixture.minute}'`;
    }
    return 'Đang diễn ra';
  }
  if (fixture.status === 'finished') {
    return 'Đã kết thúc';
  }
  if (fixture.status === 'postponed') {
    return 'Tạm hoãn';
  }
  if (fixture.status === 'cancelled') {
    return 'Đã hủy';
  }
  return 'Sắp diễn ra';
}

function translateStage(stage: string): string {
  return stage
    .replace(/Group Stage Round/gi, 'Vòng bảng - Lượt')
    .replace(/Group ([AB])/gi, 'Bảng $1')
    .replace(/Semi-final/gi, 'Bán kết')
    .replace(/Final/gi, 'Chung kết')
    .replace(/Leg 1/gi, 'Lượt đi')
    .replace(/Leg 2/gi, 'Lượt về');
}

function translateTeamName(name: string): string {
  const teams: Record<string, string> = {
    Vietnam: 'Việt Nam',
    Thailand: 'Thái Lan',
    Cambodia: 'Campuchia',
    Laos: 'Lào',
    'Timor-Leste': 'Đông Timor',
    'Brunei Darussalam': 'Brunei',
  };
  return (
    teams[name] ??
    name
      .replace(/Winner Semi-final 1/gi, 'Đội thắng bán kết 1')
      .replace(/Winner Semi-final 2/gi, 'Đội thắng bán kết 2')
      .replace(/Winner SF1/gi, 'Đội thắng bán kết 1')
      .replace(/Winner SF2/gi, 'Đội thắng bán kết 2')
      .replace(/^TBD$/gi, 'Chưa xác định')
  );
}

function translateVenue(venue: string): string {
  return venue
    .replace(/Winner Group A Home Venue/gi, 'Sân nhà đội nhất bảng A')
    .replace(/Winner Group B Home Venue/gi, 'Sân nhà đội nhất bảng B')
    .replace(/Runner-up Group A Home Venue/gi, 'Sân nhà đội nhì bảng A')
    .replace(/Runner-up Group B Home Venue/gi, 'Sân nhà đội nhì bảng B')
    .replace(/Finalist 1 Home Venue/gi, 'Sân nhà đội vào chung kết 1')
    .replace(/Finalist 2 Home Venue/gi, 'Sân nhà đội vào chung kết 2');
}

function translateNote(note: string): string {
  const notes: Record<string, string> = {
    'Weather delay expected in second half': 'Dự kiến trận đấu bị gián đoạn vì thời tiết trong hiệp hai',
    'Pitch condition review ongoing': 'Đang kiểm tra điều kiện mặt sân',
    'Cancelled by organizing committee': 'Đã bị ban tổ chức hủy',
  };
  return notes[note] ?? note;
}

interface FixtureCardProps {
  fixture: TournamentFixture;
  isExpanded: boolean;
  isLoadingDetails: boolean;
  onToggleExpand: () => void;
}

function FixtureCard({
  fixture,
  isExpanded,
  isLoadingDetails,
  onToggleExpand,
}: FixtureCardProps): React.ReactElement {
  const homeTeam = fixture.homeTeam ?? { name: 'Đội chủ nhà sẽ được công bố', countryCode: 'TBD' };
  const awayTeam = fixture.awayTeam ?? { name: 'Đội khách sẽ được công bố', countryCode: 'TBD' };

  return (
    <Box>
      <Box
        onClick={onToggleExpand}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-busy={isLoadingDetails}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onToggleExpand();
          }
        }}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          p: ThemeTokens.spacing.md,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          backgroundColor: 'background.paper',
          '&:hover': {
            backgroundColor: 'action.hover',
            borderColor: 'primary.main',
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr auto',
            alignItems: 'center',
            gap: ThemeTokens.spacing.md,
          }}
        >
          {/* Home Team */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <CountryFlag code={homeTeam.countryCode} size={28} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {translateTeamName(homeTeam.name)}
              </Typography>
            </Box>
          </Box>

          {/* Score */}
          <Box sx={{ textAlign: 'center', minWidth: '70px' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {formatScore(fixture.homeScore, fixture.awayScore)}
            </Typography>
          </Box>

          {/* Away Team */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 1,
              minWidth: 0,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {translateTeamName(awayTeam.name)}
              </Typography>
            </Box>
            <CountryFlag code={awayTeam.countryCode} size={28} />
          </Box>

          {/* Status */}
          <StatusChip
            status={getFixtureStatusColor(fixture.status)}
            label={getFixtureStatusLabel(fixture)}
          />
        </Box>

        {/* Time and Venue */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: ThemeTokens.spacing.md,
            mt: ThemeTokens.spacing.md,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 0.25 }}
            >
              Ngày và giờ
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatMatchDate(fixture.kickoff)} {formatKickoffTime(fixture.kickoff)}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 0.25 }}
            >
              Sân vận động
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {fixture.venue ? translateVenue(fixture.venue) : 'Sẽ được công bố'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Expanded Details */}
      {isLoadingDetails && (
        <Box
          sx={{
            mt: 1,
            p: ThemeTokens.spacing.md,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'text.secondary',
          }}
        >
          <CircularProgress size={18} />
          <Typography variant="body2">Đang tải chi tiết trận đấu...</Typography>
        </Box>
      )}

      {isExpanded && !isLoadingDetails && (
        <Box
          sx={{
            mt: 1,
            p: ThemeTokens.spacing.md,
            backgroundColor: 'action.hover',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={ThemeTokens.spacing.md}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Chi tiết trận đấu
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {translateTeamName(homeTeam.name)} - {translateTeamName(awayTeam.name)}
              </Typography>
              {fixture.note && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {translateNote(fixture.note)}
                </Typography>
              )}
            </Box>
            {fixture.venue && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Sân vận động
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {translateVenue(fixture.venue)}
                </Typography>
              </Box>
            )}
            <Typography variant="caption" color="text.secondary">
              Diễn biến, thống kê, đội hình và sự kiện chỉ hiển thị khi dữ liệu giải đấu cung
              cấp.
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
}

export const FixturesAndResultsPage: React.FC = (): React.ReactElement => {
  const { data, isLoading, error } = useTournamentCenter({
    autoRefresh: true,
    refreshIntervalMs: 30000,
  });
  const [expandedFixtureIds, setExpandedFixtureIds] = useState<Set<string>>(new Set());
  const [loadingFixtureIds, setLoadingFixtureIds] = useState<Set<string>>(new Set());

  const toggleFixtureExpansion = (fixtureId: string): void => {
    if (loadingFixtureIds.has(fixtureId)) {
      return;
    }
    if (expandedFixtureIds.has(fixtureId)) {
      setExpandedFixtureIds((current) => {
        const next = new Set(current);
        next.delete(fixtureId);
        return next;
      });
      return;
    }

    setLoadingFixtureIds((current) => new Set(current).add(fixtureId));
    window.setTimeout(() => {
      setExpandedFixtureIds((current) => new Set(current).add(fixtureId));
      setLoadingFixtureIds((current) => {
        const next = new Set(current);
        next.delete(fixtureId);
        return next;
      });
    }, 100);
  };

  // Group fixtures by stage
  const fixturesByStage = useMemo(() => {
    if (!data) {
      return new Map<string, TournamentFixture[]>();
    }

    const grouped = new Map<string, TournamentFixture[]>();

    for (const fixture of data.fixtures.all) {
      const stage = fixture.stage;
      if (!grouped.has(stage)) {
        grouped.set(stage, []);
      }
      grouped.get(stage)!.push(fixture);
    }

    // Sort within each stage
    for (const fixtures of grouped.values()) {
      fixtures.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
    }

    return grouped;
  }, [data]);

  if (isLoading && !data) {
    return (
      <PageContent>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6">Đang tải lịch thi đấu...</Typography>
        </Box>
      </PageContent>
    );
  }

  if (error && !data) {
    return (
      <PageContent>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="error">
            Không thể tải lịch thi đấu
          </Typography>
        </Box>
      </PageContent>
    );
  }

  if (!data) {
    return (
      <PageContent>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6">Chưa có dữ liệu giải đấu</Typography>
        </Box>
      </PageContent>
    );
  }

  const stageOrder = [
    'Group Stage Round 1',
    'Group Stage Round 2',
    'Group Stage Round 3',
    'Semi-final 1 Leg 1',
    'Semi-final 1 Leg 2',
    'Semi-final 2 Leg 1',
    'Semi-final 2 Leg 2',
    'Final (Leg 1)',
    'Final (Leg 2)',
  ];

  const sortedStages = Array.from(fixturesByStage.entries()).sort(([stageA], [stageB]) => {
    const indexA = stageOrder.findIndex((s) => stageA.includes(s));
    const indexB = stageOrder.findIndex((s) => stageB.includes(s));
    if (indexA === -1) return 1;
    if (indexB === -1) return 1;
    return indexA - indexB;
  });

  return (
    <PageContent>
      <PageHeader sx={{ mb: ThemeTokens.spacing.xxxl }}>
        <Card
          sx={{
            borderRadius: '24px',
            background: `linear-gradient(135deg, #0d47a1 0%, ${ASEAN_CUP_2026_TOURNAMENT_CONFIG.brandColor} 100%)`,
            color: '#ffffff',
          }}
        >
          <CardContent sx={{ py: ThemeTokens.spacing.xxxl }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Lịch thi đấu và kết quả
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.86)', mt: 1 }}>
              Trung tâm trận đấu ASEAN Hyundai Cup 2026
            </Typography>
          </CardContent>
        </Card>
      </PageHeader>

      {sortedStages.map(([stage, fixtures]) => (
        <PageSection key={stage} title={translateStage(stage)} sx={{ mb: ThemeTokens.spacing.xxxl }}>
          <Stack spacing={ThemeTokens.spacing.md}>
            {fixtures.map((fixture) => (
              <FixtureCard
                key={fixture.id}
                fixture={fixture}
                isExpanded={expandedFixtureIds.has(fixture.id)}
                isLoadingDetails={loadingFixtureIds.has(fixture.id)}
                onToggleExpand={() => toggleFixtureExpansion(fixture.id)}
              />
            ))}
          </Stack>
        </PageSection>
      ))}
    </PageContent>
  );
};
