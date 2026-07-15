/**
 * Team Logo Mapping
 * Centralized mapping of FPL team codes to team logos/badges
 */

/**
 * Get team logo URL by team code or name
 */
export function getTeamLogoUrl(teamCode: number | string): string {
  const codeToShortName: Record<number | string, string> = {
    1: 'ARS',
    2: 'AVL',
    3: 'BOU',
    4: 'BRE',
    5: 'CHE',
    6: 'CRY',
    7: 'EVE',
    8: 'FUL',
    9: 'IPS',
    10: 'LEI',
    11: 'LIV',
    12: 'MCI',
    13: 'MUN',
    14: 'NEW',
    15: 'NFO',
    16: 'SOU',
    17: 'TOT',
    18: 'WHU',
    19: 'WOL',
    20: 'BRI',
  };

  const shortName = codeToShortName[teamCode];
  if (!shortName) return '/images/placeholder-badge.png';

  return `https://resources.premierleague.com/premierleague/badges/t${teamCode}.svg`;
}

/**
 * Get team short name by team code
 */
export function getTeamShortName(teamCode: number): string {
  const codeToShortName: Record<number, string> = {
    1: 'ARS',
    2: 'AVL',
    3: 'BOU',
    4: 'BRE',
    5: 'CHE',
    6: 'CRY',
    7: 'EVE',
    8: 'FUL',
    9: 'IPS',
    10: 'LEI',
    11: 'LIV',
    12: 'MCI',
    13: 'MUN',
    14: 'NEW',
    15: 'NFO',
    16: 'SOU',
    17: 'TOT',
    18: 'WHU',
    19: 'WOL',
    20: 'BRI',
  };

  return codeToShortName[teamCode] || 'N/A';
}

/**
 * Get team primary color by team code
 * Used for theming/highlighting
 */
export function getTeamColor(teamCode: number): string {
  const colorMap: Record<number, string> = {
    1: '#EF0107', // Arsenal - Red
    2: '#095C27', // Aston Villa - Dark Green
    3: '#DA291C', // Bournemouth - Red
    4: '#B50E56', // Brentford - Magenta
    5: '#0055CC', // Chelsea - Blue
    6: '#1B50BE', // Crystal Palace - Blue
    7: '#003DA5', // Everton - Blue
    8: '#003399', // Fulham - Black/Blue
    9: '#0066CC', // Ipswich Town - Blue
    10: '#0053A0', // Leicester City - Blue
    11: '#C8102E', // Liverpool - Red
    12: '#6CABDA', // Manchester City - Sky Blue
    13: '#DA291C', // Manchester United - Red
    14: '#241F20', // Newcastle United - Black
    15: '#E50000', // Nottingham Forest - Red
    16: '#000000', // Southampton - Black
    17: '#132257', // Tottenham - Navy
    18: '#1D3461', // West Ham - Claret
    19: '#FDB913', // Wolverhampton - Gold
    20: '#003DA5', // Brighton - Blue
  };

  return colorMap[teamCode] || '#666666';
}
