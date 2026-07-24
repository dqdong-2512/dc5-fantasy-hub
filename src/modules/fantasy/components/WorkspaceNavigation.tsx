/**
 * Workspace Navigation Component
 * Tabs for workspace sections: Standings, Compare, Live Race
 * Active state derived from URL
 */

import React, { useMemo } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

export interface WorkspaceNavigationProps {
  leagueId: number;
}

type WorkspaceTab = 'standings' | 'compare' | 'live-race';

export const WorkspaceNavigation: React.FC<WorkspaceNavigationProps> = ({ leagueId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { managerId } = useParams<{ managerId: string }>();

  const activeTab = useMemo((): WorkspaceTab => {
    if (managerId) {
      return 'compare';
    }
    if (location.pathname.includes('/live')) {
      return 'live-race';
    }
    return 'standings';
  }, [managerId, location.pathname]);

  const handleTabClick = (tab: WorkspaceTab): void => {
    if (tab === 'standings') {
      navigate(`/premier-league/gameweek/league/${leagueId}`);
    } else if (tab === 'compare') {
      // Stay on compare (user will select opponent)
      // Do nothing if already on compare without manager selected
      if (!managerId) {
        navigate(`/premier-league/gameweek/league/${leagueId}`);
      }
    } else if (tab === 'live-race') {
      navigate(`/premier-league/gameweek/league/${leagueId}/live`);
    }
  };

  const tabs: Array<{ id: WorkspaceTab; label: string }> = [
    { id: 'standings', label: 'Standings' },
    { id: 'compare', label: 'Compare' },
    { id: 'live-race', label: 'Live Race' },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        borderTop: '1px solid #e0e0e0',
        paddingTop: 1,
      }}
    >
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          sx={{
            textTransform: 'none',
            fontSize: '0.9rem',
            fontWeight: activeTab === tab.id ? 700 : 500,
            color: activeTab === tab.id ? '#1976d2' : '#666',
            padding: '8px 16px',
            borderBottom: activeTab === tab.id ? '3px solid #1976d2' : 'none',
            borderRadius: 0,
            marginBottom: '-1px',
            transition: 'all 0.2s ease',
            '&:hover': {
              color: '#1976d2',
              backgroundColor: 'transparent',
            },
          }}
        >
          {tab.label}
        </Button>
      ))}
    </Box>
  );
};


