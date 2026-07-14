import React from 'react';
import { Box, Container, Typography } from '@mui/material';

export const AppFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #e0e0e0',
        marginTop: 'auto',
        paddingY: 3,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" align="center" sx={{ color: '#666' }}>
          DC5 Fantasy Hub © {currentYear}
        </Typography>
      </Container>
    </Box>
  );
};
