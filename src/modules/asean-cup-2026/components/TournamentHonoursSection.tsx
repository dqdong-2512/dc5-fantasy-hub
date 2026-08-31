import React from 'react';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import SportsSoccerRoundedIcon from '@mui/icons-material/SportsSoccerRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { CountryFlag, PageSection } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import {
  ASEAN_CHAMPIONSHIP_HONOURS,
  ASEAN_CUP_2026_INDIVIDUAL_AWARDS,
  type IndividualAward,
} from '../data/tournament-honours';

const GOLD = '#B88719';
const GOLD_DARK = '#725019';
const CREAM = '#FBF5E8';

function AwardIcon({ id }: { id: IndividualAward['id'] }): React.ReactElement {
  const iconSx = { fontSize: 30, color: GOLD };

  if (id === 'best-goalkeeper') return <ShieldRoundedIcon sx={iconSx} />;
  if (id === 'top-scorer') return <SportsSoccerRoundedIcon sx={iconSx} />;
  if (id === 'best-young-player') return <WorkspacePremiumRoundedIcon sx={iconSx} />;
  return <MilitaryTechRoundedIcon sx={iconSx} />;
}

function HonourCard({
  honour,
}: {
  honour: (typeof ASEAN_CHAMPIONSHIP_HONOURS)[number];
}): React.ReactElement {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: { xs: '14px', md: '18px' },
        borderColor: honour.isCurrentChampion ? '#C89525' : 'rgba(114, 80, 25, 0.2)',
        borderWidth: honour.isCurrentChampion ? 2 : 1,
        background: honour.isCurrentChampion
          ? 'linear-gradient(110deg, #fffdf6 0%, #fff8e6 100%)'
          : 'rgba(255, 255, 255, 0.7)',
        boxShadow: honour.isCurrentChampion ? '0 14px 34px rgba(184, 135, 25, 0.16)' : 'none',
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '40px minmax(0, 1fr)',
              sm: '52px minmax(0, 1fr) auto',
              md: '66px minmax(240px, 1fr) auto',
            },
            alignItems: 'center',
            columnGap: { xs: 1.25, sm: 2, md: 3 },
            rowGap: 1.5,
          }}
        >
          <Typography
            aria-label={`Hạng ${honour.rank}`}
            sx={{
              gridRow: { xs: '1 / span 3', sm: '1 / span 2' },
              color: honour.isCurrentChampion ? GOLD : GOLD_DARK,
              fontFamily: 'Georgia, serif',
              fontSize: { xs: '2.3rem', sm: '3rem', md: '4rem' },
              fontWeight: 700,
              lineHeight: 1,
              textAlign: 'center',
            }}
          >
            {honour.rank}
          </Typography>

          <Stack
            direction="row"
            spacing={{ xs: 1.25, sm: 2 }}
            sx={{
              gridColumn: { xs: '2', sm: 'auto' },
              gridRow: { xs: '1', sm: 'auto' },
              alignItems: 'center',
              minWidth: 0,
            }}
          >
            <CountryFlag
              code={honour.countryCode}
              size={56}
              ariaLabel={`Quốc kỳ ${honour.teamName}`}
              sx={{
                width: { xs: 42, sm: 56 },
                height: { xs: 30, sm: 40 },
                border: '1px solid rgba(15, 23, 42, 0.14)',
                boxShadow: '0 5px 12px rgba(15, 23, 42, 0.1)',
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: honour.isCurrentChampion ? '#B42318' : '#2D2117',
                  fontFamily: 'Georgia, serif',
                  fontSize: { xs: '1.15rem', sm: '1.45rem', md: '1.9rem' },
                  fontWeight: 800,
                  letterSpacing: { xs: 0.2, md: 0.6 },
                  lineHeight: 1.1,
                  textTransform: 'uppercase',
                  overflowWrap: 'anywhere',
                }}
              >
                {honour.teamName}
              </Typography>
              {honour.isCurrentChampion && (
                <Chip
                  label="Đương kim vô địch 2026"
                  size="small"
                  sx={{ mt: 1, bgcolor: '#C62828', color: '#fff', fontWeight: 800 }}
                />
              )}
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={0.75}
            sx={{
              gridColumn: { xs: '2', sm: 'auto' },
              gridRow: { xs: '2', sm: 'auto' },
              alignItems: 'center',
              justifySelf: { xs: 'start', sm: 'end' },
            }}
          >
            <EmojiEventsRoundedIcon sx={{ color: GOLD, fontSize: { xs: 28, sm: 36 } }} />
            <Box sx={{ textAlign: 'right' }}>
              <Typography
                sx={{
                  color: honour.isCurrentChampion ? GOLD : '#2D2117',
                  fontFamily: 'Georgia, serif',
                  fontSize: { xs: '1.7rem', sm: '2.4rem' },
                  fontWeight: 800,
                  lineHeight: 0.95,
                }}
              >
                {honour.titles}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: GOLD_DARK, fontWeight: 800, letterSpacing: 0.8, whiteSpace: 'nowrap' }}
              >
                LẦN VÔ ĐỊCH
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            useFlexGap
            sx={{
              gridColumn: { xs: '2', sm: '2 / 4' },
              gridRow: { xs: '3', sm: 'auto' },
              flexWrap: 'wrap',
              gap: 0.75,
              alignItems: 'center',
            }}
          >
            {honour.winningYears.map((year) => (
              <Chip
                key={year}
                label={year}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: 'rgba(184, 135, 25, 0.42)',
                  bgcolor: 'rgba(255,255,255,0.62)',
                  color: GOLD_DARK,
                  fontWeight: 800,
                }}
              />
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

function IndividualAwards(): React.ReactElement {
  return (
    <PageSection
      title="Giải thưởng cá nhân ASEAN Cup 2026"
      subtitle="Những cá nhân xuất sắc được vinh danh sau giải đấu"
      sx={{ mb: ThemeTokens.spacing.xxxl }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(4, minmax(0, 1fr))',
          },
          gap: { xs: 1.5, md: 2 },
        }}
      >
        {ASEAN_CUP_2026_INDIVIDUAL_AWARDS.map((award) => (
          <Card
            key={award.id}
            variant="outlined"
            sx={{
              height: '100%',
              borderRadius: '16px',
              borderColor: 'rgba(184, 135, 25, 0.24)',
              background: 'linear-gradient(145deg, #FFFFFF 0%, #FFFBF2 100%)',
              boxShadow: '0 10px 28px rgba(74, 52, 18, 0.08)',
              transition: 'transform 180ms ease, box-shadow 180ms ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 16px 34px rgba(74, 52, 18, 0.13)',
              },
            }}
          >
            <CardContent
              sx={{
                height: '100%',
                p: { xs: 2, md: 2.5 },
                '&:last-child': { pb: { xs: 2, md: 2.5 } },
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '14px',
                  bgcolor: '#FFF4D6',
                  mb: 2,
                }}
              >
                <AwardIcon id={award.id} />
              </Box>
              <Typography
                variant="overline"
                sx={{ color: GOLD, fontWeight: 850, letterSpacing: 1.1, lineHeight: 1.3 }}
              >
                {award.eyebrow}
              </Typography>
              <Typography variant="h6" sx={{ mt: 0.5, mb: 2, fontWeight: 800, lineHeight: 1.25 }}>
                {award.title}
              </Typography>
              <Stack spacing={1.25} sx={{ mt: 'auto' }}>
                {award.winners.map((winner) => (
                  <Stack
                    key={winner.name}
                    direction="row"
                    spacing={1.25}
                    sx={{ alignItems: 'center', minWidth: 0 }}
                  >
                    <CountryFlag
                      code={winner.countryCode}
                      size={30}
                      showTooltip
                      ariaLabel={`Quốc kỳ ${winner.countryName}`}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, lineHeight: 1.25 }}>
                        {winner.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {winner.countryName}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </PageSection>
  );
}

export function TournamentHonoursSection(): React.ReactElement {
  return (
    <>
      <PageSection
        title="🏆 Bảng vàng Đông Nam Á"
        subtitle="Các đội tuyển giàu thành tích nhất lịch sử ASEAN Championship, 1996–2026"
        sx={{ mb: ThemeTokens.spacing.xxxl }}
      >
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: { xs: '16px', md: '22px' },
            border: '1px solid rgba(184, 135, 25, 0.28)',
            background: `
              radial-gradient(circle at 50% 8%, rgba(184, 135, 25, 0.12), transparent 34%),
              repeating-radial-gradient(ellipse at 50% 50%, transparent 0 78px, rgba(184, 135, 25, 0.055) 79px 80px),
              ${CREAM}
            `,
            p: { xs: 1.5, sm: 2.5, md: 4 },
          }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 2.5, md: 4 } }}>
            <Typography
              variant="overline"
              sx={{ color: GOLD_DARK, fontWeight: 850, letterSpacing: { xs: 2, sm: 4 } }}
            >
              AFF • ASEAN CHAMPIONSHIP • 1996–2026
            </Typography>
            <Typography
              sx={{
                mt: 0.75,
                color: '#2D2117',
                fontFamily: 'Georgia, serif',
                fontSize: { xs: '1.75rem', sm: '2.35rem', md: '3rem' },
                fontWeight: 800,
                letterSpacing: { xs: 0.4, md: 1.4 },
                lineHeight: 1.1,
                textTransform: 'uppercase',
              }}
            >
              Những nhà vô địch Đông Nam Á
            </Typography>
            <Box sx={{ width: 120, borderTop: `2px solid ${GOLD}`, mx: 'auto', mt: 2 }} />
          </Box>

          <Stack spacing={{ xs: 1.25, md: 2 }}>
            {ASEAN_CHAMPIONSHIP_HONOURS.map((honour) => (
              <HonourCard key={honour.countryCode} honour={honour} />
            ))}
          </Stack>
        </Box>
      </PageSection>

      <IndividualAwards />
    </>
  );
}
