import React from 'react';
import { Container } from '@mui/material';
import type { ContainerProps } from '@mui/material';

export const PageContainer: React.FC<React.PropsWithChildren<ContainerProps>> = ({
  children,
  maxWidth = 'lg',
  ...props
}) => {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        paddingX: { xs: 2, sm: 3, md: 4 },
        paddingY: 4,
      }}
      {...props}
    >
      {children}
    </Container>
  );
};
