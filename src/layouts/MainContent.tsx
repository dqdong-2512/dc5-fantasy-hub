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
        maxWidth={false}
        sx={{
          maxWidth: { xs: '100%', sm: '100%', md: '100%', lg: 1600, xl: 1600 },
          marginX: 'auto',
          paddingX: { xs: 2, sm: 3, md: 4, lg: 3, xl: 4 },
          paddingY: { xs: 2, sm: 3, md: 3 },
        }}
      >
        {children}
      </Container>
    </Box>
  );
};
