import React from 'react';
import { Container } from '@mui/material';
import type { ContainerProps } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export const PageContainer: React.FC<React.PropsWithChildren<ContainerProps>> = ({
  children,
  maxWidth = false,
  ...props
}) => {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        maxWidth: { xs: '100%', sm: '100%', md: '100%', lg: ThemeTokens.layout.maxWidth },
        paddingX: {
          xs: ThemeTokens.spacing.md,
          sm: ThemeTokens.spacing.lg,
          md: ThemeTokens.layout.pageHorizontalPadding,
        },
        paddingY: { xs: ThemeTokens.spacing.md, sm: ThemeTokens.spacing.lg },
      }}
      {...props}
    >
      {children}
    </Container>
  );
};
