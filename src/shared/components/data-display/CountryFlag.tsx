import React, { Suspense } from 'react';
import { Box, Skeleton, Tooltip } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { getCountryByCode, normalizeCountryCode, type CountryCode } from '@shared/constants';

type FlagSize = 'sm' | 'md' | 'lg' | number;

interface CountryFlagProps {
  code: string;
  size?: FlagSize;
  showTooltip?: boolean;
  ariaLabel?: string;
  lazy?: boolean;
  sx?: SxProps<Theme>;
}

const sizeMap: Record<'sm' | 'md' | 'lg', number> = {
  sm: 16,
  md: 18,
  lg: 24,
};

const flagLoaders: Record<CountryCode, () => Promise<{ default: React.ComponentType<any> }>> = {
  VN: () => import('country-flag-icons/react/3x2/VN'),
  TH: () => import('country-flag-icons/react/3x2/TH'),
  MY: () => import('country-flag-icons/react/3x2/MY'),
  ID: () => import('country-flag-icons/react/3x2/ID'),
  KH: () => import('country-flag-icons/react/3x2/KH'),
  SG: () => import('country-flag-icons/react/3x2/SG'),
  PH: () => import('country-flag-icons/react/3x2/PH'),
  MM: () => import('country-flag-icons/react/3x2/MM'),
  LA: () => import('country-flag-icons/react/3x2/LA'),
  TL: () => import('country-flag-icons/react/3x2/TL'),
};

const lazyFlags: Record<CountryCode, React.LazyExoticComponent<React.ComponentType<any>>> = {
  VN: React.lazy(flagLoaders.VN),
  TH: React.lazy(flagLoaders.TH),
  MY: React.lazy(flagLoaders.MY),
  ID: React.lazy(flagLoaders.ID),
  KH: React.lazy(flagLoaders.KH),
  SG: React.lazy(flagLoaders.SG),
  PH: React.lazy(flagLoaders.PH),
  MM: React.lazy(flagLoaders.MM),
  LA: React.lazy(flagLoaders.LA),
  TL: React.lazy(flagLoaders.TL),
};

function FlagFallback({ dimension }: { dimension: number }): React.ReactElement {
  return <Skeleton variant="rounded" width={dimension} height={Math.round((dimension * 3) / 4)} />;
}

export function CountryFlag({
  code,
  size = 'md',
  showTooltip = false,
  ariaLabel,
  lazy = true,
  sx,
}: CountryFlagProps): React.ReactElement {
  const normalizedCode = normalizeCountryCode(code);
  const country = getCountryByCode(code);
  const dimension = typeof size === 'number' ? size : sizeMap[size];
  const LazyFlag = normalizedCode ? lazyFlags[normalizedCode] : null;

  const label = ariaLabel ?? `${country?.name ?? 'Unknown Country'} flag`;

  if (!LazyFlag) {
    return (
      <Box
        component="span"
        aria-label={label}
        sx={{
          display: 'inline-flex',
          width: dimension,
          height: Math.round((dimension * 3) / 4),
          borderRadius: 0.5,
          bgcolor: 'action.disabledBackground',
          ...sx,
        }}
      />
    );
  }

  const flagNode = (
    <Box
      component="span"
      role="img"
      aria-label={label}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        width: dimension,
        height: Math.round((dimension * 3) / 4),
        flexShrink: 0,
        '& svg': {
          width: '100%',
          height: '100%',
          display: 'block',
        },
        ...sx,
      }}
    >
      <Suspense fallback={lazy ? <FlagFallback dimension={dimension} /> : null}>
        <LazyFlag title={label} />
      </Suspense>
    </Box>
  );

  if (showTooltip && country) {
    return <Tooltip title={country.name}>{flagNode}</Tooltip>;
  }

  return flagNode;
}
