import React from 'react';
import { Box, Container, Typography } from '@mui/material';

export const AppFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        marginTop: 'auto',
        paddingY: 1,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
          DC5 Fantasy Hub © {currentYear}
        </Typography>
      </Container>
    </Box>
  );
};
