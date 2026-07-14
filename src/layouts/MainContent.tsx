import React from 'react';
import { Box, Container } from '@mui/material';

interface MainContentProps {
  children: React.ReactNode;
}

export const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: '#fafafa',
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          paddingX: { xs: 2, sm: 3, md: 4 },
          paddingY: 4,
        }}
      >
        {children}
      </Container>
    </Box>
  );
};
