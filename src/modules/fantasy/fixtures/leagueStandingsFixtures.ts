/**
 * League Standings Fixtures
 * Realistic sample data for league standings
 * Used for UI development and testing
 *
 * NOTE: This is temporary local fixture data.
 * Replace with real FPL API data once the connection flow is complete.
 */

import type { LeagueStandings, LeagueStandingEntry } from '../types';

/**
 * Generate realistic manager data for league standings
 * Used across multiple leagues
 */
const createManagerEntry = (
  managerId: number,
  managerName: string,
  teamName: string,
  rank: number,
  previousRank: number,
  totalPoints: number,
  gameweekPoints: number
): LeagueStandingEntry => ({
  managerId,
  managerName,
  teamName,
  currentRank: rank,
  previousRank,
  totalPoints,
  gameweekPoints,
});

/**
 * League standings for "DC5 FPL 25/26" (leagueId: 12345)
 * Current manager (Trí Nguyễn) is at rank 8 of 24 managers
 * 20 additional managers to fill out the standings
 */
export const dc5FPLStandings: LeagueStandings = {
  leagueId: 12345,
  entries: [
    createManagerEntry(9001, 'Hùng Trịnh', 'HuTi', 1, 1, 2420, 58),
    createManagerEntry(9002, 'Hải Trần', 'Hải Bình Sữa', 2, 3, 2398, 57),
    createManagerEntry(9003, 'Huy Nhất', 'Hi Da Den', 3, 2, 2387, 58),
    createManagerEntry(9004, 'Minh Khoa', 'Minh Team FPL', 4, 5, 2365, 55),
    createManagerEntry(9005, 'Lâm Phong', 'Dream XI', 5, 4, 2348, 52),
    createManagerEntry(9006, 'Tú Anh', 'Fantasy Legends', 6, 7, 2335, 61),
    createManagerEntry(9007, 'Quân Lý', 'Rising Stars', 7, 8, 2321, 54),
    createManagerEntry(1234567, 'Trí Nguyễn', 'Đã Tới Lúc Lụm Chi', 8, 9, 2228, 61), // Current manager
    createManagerEntry(9009, 'Đức Thái', 'Elite Squad', 9, 6, 2215, 50),
    createManagerEntry(9010, 'Việt Hùng', 'Thunder XI', 10, 10, 2198, 48),
    createManagerEntry(9011, 'Anh Tuấn', 'Phantom', 11, 12, 2185, 56),
    createManagerEntry(9012, 'Thắng Duy', 'Victory', 12, 11, 2172, 52),
    createManagerEntry(9013, 'Hoàng Nam', 'Phoenix', 13, 15, 2164, 59),
    createManagerEntry(9014, 'Kiên Giang', 'Kingdom', 14, 13, 2151, 51),
    createManagerEntry(9015, 'Long Vũ', 'Warriors', 15, 14, 2138, 54),
    createManagerEntry(9016, 'Tài Lộc', 'Fortune XI', 16, 17, 2125, 49),
    createManagerEntry(9017, 'Sơn Trà', 'Dynasty', 17, 16, 2112, 53),
    createManagerEntry(9018, 'Bình An', 'Tranquility', 18, 19, 2104, 50),
    createManagerEntry(9019, 'Tú Lâm', 'Sanctuary', 19, 18, 2091, 47),
    createManagerEntry(9020, 'Hà An', 'Peaceful XI', 20, 20, 2078, 55),
    createManagerEntry(9021, 'Mạnh Dũng', 'Mighty', 21, 21, 2065, 52),
    createManagerEntry(9022, 'Hải Anh', 'Ocean XI', 22, 22, 2052, 48),
    createManagerEntry(9023, 'Quốc Toàn', 'Nation', 23, 24, 2039, 51),
    createManagerEntry(9024, 'Tân Tài', 'Innovation', 24, 23, 2026, 46),
  ],
};

/**
 * League standings for "Báo Động Đỏ Fantasy" (leagueId: 67890)
 * Smaller secondary league (12 managers)
 */
export const baoDongDaStandings: LeagueStandings = {
  leagueId: 67890,
  entries: [
    createManagerEntry(8001, 'Ngô Anh', 'Red Alert', 1, 2, 2512, 62),
    createManagerEntry(8002, 'Tùng Dương', 'Victory Road', 2, 1, 2498, 58),
    createManagerEntry(8003, 'Hương Chi', 'Harmony', 3, 3, 2476, 55),
    createManagerEntry(8004, 'Thế Anh', 'Eternal', 4, 5, 2454, 60),
    createManagerEntry(1234567, 'Trí Nguyễn', 'Đã Tới Lúc Lụm Chi', 5, 4, 2432, 58), // Current manager
    createManagerEntry(8006, 'Phúc Hòa', 'Blessing', 6, 6, 2410, 52),
    createManagerEntry(8007, 'Thanh Tâm', 'Pure Mind', 7, 8, 2388, 49),
    createManagerEntry(8008, 'Minh Trí', 'Smart XI', 8, 7, 2365, 57),
    createManagerEntry(8009, 'Hồng Linh', 'Pink Spirit', 9, 9, 2342, 51),
    createManagerEntry(8010, 'Khoa Anh', 'Knowledge', 10, 10, 2319, 48),
    createManagerEntry(8011, 'Vân Trang', 'Cloud IX', 11, 11, 2296, 54),
    createManagerEntry(8012, 'Bảo Châu', 'Treasure XI', 12, 12, 2273, 50),
  ],
};

/**
 * Export all league standings by leagueId
 * Used by league standings page to fetch data for a specific league
 */
export const leagueStandingsFixtures: Record<number, LeagueStandings> = {
  12345: dc5FPLStandings,
  67890: baoDongDaStandings,
};
