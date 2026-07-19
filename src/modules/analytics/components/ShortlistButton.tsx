/**
 * Shortlist Button Component
 * Reusable button for adding/removing players from shortlist
 */

import React, { useMemo, useState } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { ShortlistService } from '../services/shortlist.service';

export interface ShortlistButtonProps {
  playerId: number;
  size?: 'small' | 'medium' | 'large';
  onToggle?: (playerId: number, isAdded: boolean) => void;
}

export const ShortlistButton: React.FC<ShortlistButtonProps> = ({
  playerId,
  size = 'medium',
  onToggle,
}) => {
  const shortlistService = useMemo(() => new ShortlistService(), []);
  const [isShortlisted, setIsShortlisted] = useState<boolean>(
    shortlistService.isShortlisted(playerId)
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (): Promise<void> => {
    setIsLoading(true);

    try {
      if (isShortlisted) {
        shortlistService.removeFromShortlist(playerId);
        setIsShortlisted(false);
        onToggle?.(playerId, false);
      } else {
        shortlistService.addToShortlist(playerId);
        setIsShortlisted(true);
        onToggle?.(playerId, true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}>
      <IconButton
        size={size}
        onClick={handleToggle}
        disabled={isLoading}
        sx={{
          color: isShortlisted ? '#ff9800' : 'default',
          '&:hover': {
            color: '#ff9800',
          },
        }}
      >
        {isLoading ? (
          <CircularProgress size={24} />
        ) : isShortlisted ? (
          <BookmarkIcon />
        ) : (
          <BookmarkBorderIcon />
        )}
      </IconButton>
    </Tooltip>
  );
};
