import React, { memo, useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import SportsSoccerRoundedIcon from '@mui/icons-material/SportsSoccerRounded';
import { getTeamBadgeUrl } from '@shared/assets';

export type ClubLogoSize = 'small' | 'medium' | 'large';
const SIZE: Record<ClubLogoSize, number> = { small: 24, medium: 36, large: 52 };

export interface ClubLogoProps {
  teamCode?: number | string | null;
  clubName?: string | null;
  size?: ClubLogoSize;
  lazy?: boolean;
}

export const ClubLogo = memo(function ClubLogo({
  teamCode,
  clubName,
  size = 'medium',
  lazy = true,
}: ClubLogoProps): React.ReactElement {
  const src = useMemo(() => getTeamBadgeUrl(teamCode), [teamCode]);
  const [failed, setFailed] = useState(!src);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setFailed(!src);
    setLoaded(false);
  }, [src]);
  useEffect(() => {
    if (!src || loaded || failed || lazy) return undefined;
    const timer = window.setTimeout(() => setFailed(true), 4000);
    return () => window.clearTimeout(timer);
  }, [failed, lazy, loaded, src]);
  const pixels = SIZE[size];

  return (
    <Box
      role="img"
      aria-label={clubName ? `${clubName} logo` : 'Club logo unavailable'}
      sx={{
        width: pixels,
        height: pixels,
        flex: '0 0 auto',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {!failed ? (
        <Box
          component="img"
          src={src}
          alt=""
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          sx={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }}
        />
      ) : (
        <SportsSoccerRoundedIcon aria-hidden sx={{ color: '#94a3b8', fontSize: pixels * 0.72 }} />
      )}
    </Box>
  );
});
