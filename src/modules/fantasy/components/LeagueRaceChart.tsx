/**
 * League Race Chart Component
 * SVG-based line chart for manager progression across gameweeks
 * No external charting dependency
 */

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface ChartDataPoint {
  gameweek: number;
  myValue: number;
  opponentValue: number;
}

export interface LeagueRaceChartProps {
  data: ChartDataPoint[];
  metric: 'totalPoints' | 'rank' | 'gwPoints';
  myManagerName: string;
  opponentManagerName: string;
}

/**
 * Simple SVG line chart
 */
export const LeagueRaceChart: React.FC<LeagueRaceChartProps> = ({
  data,
  metric,
  myManagerName,
  opponentManagerName,
}) => {
  const chartConfig = useMemo(() => {
    // Chart dimensions
    const width = 800;
    const height = 400;
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    if (data.length === 0) {
      return null;
    }

    // Calculate Y axis range
    const allValues = data.flatMap((d) => [d.myValue, d.opponentValue]);
    let yMin = Math.min(...allValues);
    let yMax = Math.max(...allValues);

    // For rank, invert (lower rank is better)
    const isRank = metric === 'rank';

    // Add padding to Y axis
    const yRange = yMax - yMin;
    yMin = Math.max(0, yMin - yRange * 0.1);
    yMax = yMax + yRange * 0.1;

    // X axis is gameweeks
    const xMin = Math.min(...data.map((d) => d.gameweek));
    const xMax = Math.max(...data.map((d) => d.gameweek));
    const xRange = xMax - xMin || 1;

    // Calculate scale functions
    const xScale = (gw: number) => padding.left + ((gw - xMin) / xRange) * innerWidth;
    const yScale = (val: number) =>
      padding.top + innerHeight - ((val - yMin) / (yMax - yMin)) * innerHeight;

    // Generate line paths
    const myPath = data
      .map((d, i) => {
        const x = xScale(d.gameweek);
        const y = yScale(d.myValue);
        return i === 0 ? `M${x} ${y}` : `L${x} ${y}`;
      })
      .join(' ');

    const opponentPath = data
      .map((d, i) => {
        const x = xScale(d.gameweek);
        const y = yScale(d.opponentValue);
        return i === 0 ? `M${x} ${y}` : `L${x} ${y}`;
      })
      .join(' ');

    // Generate grid lines and labels
    const yTickCount = 5;
    const yTicks = [];
    for (let i = 0; i <= yTickCount; i++) {
      const val = yMin + (yMax - yMin) * (i / yTickCount);
      yTicks.push({ value: val, y: yScale(val) });
    }

    // X axis labels (show every Nth gameweek to avoid clutter)
    const xTickSpacing = Math.ceil(data.length / 6);
    const xTicks = data
      .filter((_, i) => i % xTickSpacing === 0 || i === data.length - 1)
      .map((d) => ({ gw: d.gameweek, x: xScale(d.gameweek) }));

    return {
      width,
      height,
      padding,
      innerWidth,
      innerHeight,
      myPath,
      opponentPath,
      yTicks,
      xTicks,
      isRank,
      yMin,
      yMax,
      xMin,
      xMax,
    };
  }, [data, metric]);

  if (!chartConfig) {
    return (
      <Box sx={{ textAlign: 'center', padding: ThemeTokens.spacing.lg }}>
        <Typography color="textSecondary">No data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <svg
        width={chartConfig.width}
        height={chartConfig.height}
        style={{ display: 'block', margin: '0 auto' }}
      >
        {/* Background */}
        <rect width={chartConfig.width} height={chartConfig.height} fill="#f9f9f9" />

        {/* Y Axis Grid Lines */}
        {chartConfig.yTicks.map((tick, i) => (
          <line
            key={`grid-y-${i}`}
            x1={chartConfig.padding.left}
            y1={tick.y}
            x2={chartConfig.width - chartConfig.padding.right}
            y2={tick.y}
            stroke="#e0e0e0"
            strokeDasharray="4"
          />
        ))}

        {/* X Axis */}
        <line
          x1={chartConfig.padding.left}
          y1={chartConfig.height - chartConfig.padding.bottom}
          x2={chartConfig.width - chartConfig.padding.right}
          y2={chartConfig.height - chartConfig.padding.bottom}
          stroke="#999"
          strokeWidth="2"
        />

        {/* Y Axis */}
        <line
          x1={chartConfig.padding.left}
          y1={chartConfig.padding.top}
          x2={chartConfig.padding.left}
          y2={chartConfig.height - chartConfig.padding.bottom}
          stroke="#999"
          strokeWidth="2"
        />

        {/* Y Axis Labels */}
        {chartConfig.yTicks.map((tick, i) => (
          <text
            key={`label-y-${i}`}
            x={chartConfig.padding.left - 10}
            y={tick.y + 4}
            textAnchor="end"
            fontSize="12"
            fill="#666"
          >
            {Math.round(tick.value)}
          </text>
        ))}

        {/* X Axis Labels */}
        {chartConfig.xTicks.map((tick, i) => (
          <text
            key={`label-x-${i}`}
            x={tick.x}
            y={chartConfig.height - chartConfig.padding.bottom + 20}
            textAnchor="middle"
            fontSize="12"
            fill="#666"
          >
            GW {tick.gw}
          </text>
        ))}

        {/* My Line */}
        <path
          d={chartConfig.myPath}
          fill="none"
          stroke="#2e7d32"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Opponent Line */}
        <path
          d={chartConfig.opponentPath}
          fill="none"
          stroke="#d84315"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Points for My Team */}
        {data.map((d, i) => {
          const x =
            chartConfig.padding.left +
            ((d.gameweek - chartConfig.xMin) / (chartConfig.xMax - chartConfig.xMin)) *
              chartConfig.innerWidth;
          const y =
            chartConfig.padding.top +
            chartConfig.innerHeight -
            ((d.myValue - chartConfig.yMin) / (chartConfig.yMax - chartConfig.yMin)) *
              chartConfig.innerHeight;
          return (
            <circle
              key={`point-my-${i}`}
              cx={x}
              cy={y}
              r="4"
              fill="#2e7d32"
              stroke="#fff"
              strokeWidth="2"
            />
          );
        })}

        {/* Data Points for Opponent */}
        {data.map((d, i) => {
          const x =
            chartConfig.padding.left +
            ((d.gameweek - chartConfig.xMin) / (chartConfig.xMax - chartConfig.xMin)) *
              chartConfig.innerWidth;
          const y =
            chartConfig.padding.top +
            chartConfig.innerHeight -
            ((d.opponentValue - chartConfig.yMin) / (chartConfig.yMax - chartConfig.yMin)) *
              chartConfig.innerHeight;
          return (
            <circle
              key={`point-opp-${i}`}
              cx={x}
              cy={y}
              r="4"
              fill="#d84315"
              stroke="#fff"
              strokeWidth="2"
            />
          );
        })}

        {/* Title */}
        <text
          x={chartConfig.width / 2}
          y={20}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#333"
        >
          {metric === 'totalPoints' && 'Total Points Progression'}
          {metric === 'rank' && 'Overall Rank Progression'}
          {metric === 'gwPoints' && 'Gameweek Points Progression'}
        </text>
      </svg>

      {/* Legend */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: ThemeTokens.spacing.lg,
          marginTop: ThemeTokens.spacing.md,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.xs }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              backgroundColor: '#2e7d32',
              borderRadius: '2px',
            }}
          />
          <Typography variant="caption">{myManagerName}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.xs }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              backgroundColor: '#d84315',
              borderRadius: '2px',
            }}
          />
          <Typography variant="caption">{opponentManagerName}</Typography>
        </Box>
      </Box>
    </Box>
  );
};
