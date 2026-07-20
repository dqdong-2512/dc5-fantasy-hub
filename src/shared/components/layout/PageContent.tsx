import React from 'react';
import { Container } from '@mui/material';
import type { ContainerProps } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface PageContentProps extends Omit<ContainerProps, 'maxWidth' | 'children'> {
  children: React.ReactNode;
}

/**
 * PageContent
 * Main content container with max width constraint
 * Provides consistent horizontal padding and centering
 */
export function PageContent({ children, sx, ...props }: PageContentProps): React.ReactElement {
  return (
    <Container
      maxWidth={false}
      sx={{
        maxWidth: ThemeTokens.layout.maxWidth,
        paddingX: ThemeTokens.layout.pageHorizontalPadding,
        paddingTop: ThemeTokens.spacing.xs,
        paddingBottom: ThemeTokens.spacing.xs,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Container>
  );
}
