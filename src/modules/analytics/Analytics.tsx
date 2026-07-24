import React from 'react';
import { AnalyticsDecisionProvider } from './context';
import { AnalyticsDecisionHub } from './pages';

export const Analytics: React.FC = () => {
  return (
    <AnalyticsDecisionProvider>
      <AnalyticsDecisionHub />
    </AnalyticsDecisionProvider>
  );
};
