import React from 'react';
import { Container } from '@mui/material';
import type { ContainerProps } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export const PageContainer: React.FC<React.PropsWithChildren<ContainerProps>> = ({
  children,
  maxWidth = false,
  sx,
  ...props
}) => {
  return (
    <Container
      maxWidth={maxWidth}
      sx={[
        {
          maxWidth: { xs: '100%', sm: '100%', md: '100%', lg: ThemeTokens.layout.maxWidth },
          paddingX: {
            xs: ThemeTokens.spacing.sm,
            sm: ThemeTokens.spacing.md,
            md: ThemeTokens.layout.pageHorizontalPadding,
          },
          paddingTop: ThemeTokens.spacing.xs,
          paddingBottom: ThemeTokens.spacing.xs,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {children}
    </Container>
  );
};
