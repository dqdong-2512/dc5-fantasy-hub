import React, { memo, useEffect, useMemo, useState } from 'react';
import { Box, Skeleton } from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { getPlayerImageUrl, resolvePlayerPhotoIdentifier } from '@shared/assets';

export type PlayerAvatarSize = 'small' | 'medium' | 'large';
const SIZE: Record<PlayerAvatarSize, number> = { small: 32, medium: 52, large: 76 };

export interface PlayerAvatarProps {
  src?: string | null;
  playerCode?: number | string | null;
  photo?: string | null;
  name?: string | null;
  size?: PlayerAvatarSize;
  lazy?: boolean;
}

export const PlayerAvatar = memo(function PlayerAvatar({
  playerCode,
  src: providedSrc,
  photo,
  name,
  size = 'medium',
  lazy = true,
}: PlayerAvatarProps): React.ReactElement {
  const identifier = useMemo(
    () => resolvePlayerPhotoIdentifier(photo) ?? resolvePlayerPhotoIdentifier(playerCode),
    [photo, playerCode]
  );
  const src = providedSrc?.trim() || (identifier ? getPlayerImageUrl(identifier) : null);
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>(src ? 'loading' : 'failed');
  useEffect(() => setState(src ? 'loading' : 'failed'), [src]);
  useEffect(() => {
    if (state !== 'loading' || lazy) return undefined;
    const timer = window.setTimeout(() => setState('failed'), 4000);
    return () => window.clearTimeout(timer);
  }, [lazy, state, src]);
  const pixels = SIZE[size];

  return (
    <Box
      role="img"
      aria-label={name ? `${name} portrait` : 'Player portrait unavailable'}
      sx={{
        position: 'relative',
        flex: '0 0 auto',
        width: pixels,
        height: pixels,
        overflow: 'hidden',
        borderRadius: '12px',
        bgcolor: '#eef2f7',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {state === 'loading' && <Skeleton variant="rectangular" width="100%" height="100%" />}
      {src && state !== 'failed' && (
        <Box
          component="img"
          src={src}
          alt=""
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={() => setState('loaded')}
          onError={() => setState('failed')}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center top',
            opacity: state === 'loaded' ? 1 : 0,
            transition: 'opacity 180ms ease',
          }}
        />
      )}
      {state === 'failed' && (
        <PersonRoundedIcon aria-hidden sx={{ color: '#8a94a3', fontSize: pixels * 0.56 }} />
      )}
    </Box>
  );
});
