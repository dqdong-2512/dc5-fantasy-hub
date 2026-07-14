import React from 'react';
import { Stack } from '@mui/material';
import type { StackProps } from '@mui/material';

interface WidgetContentProps extends StackProps {
  children: React.ReactNode;
}

export const WidgetContent: React.FC<WidgetContentProps> = ({
  children,
  spacing = 2,
  ...props
}) => (
  <Stack spacing={spacing} {...props}>
    {children}
  </Stack>
);
