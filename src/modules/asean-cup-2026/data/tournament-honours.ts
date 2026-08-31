export interface TournamentHonour {
  rank: number;
  teamName: string;
  countryCode: string;
  titles: number;
  winningYears: number[];
  isCurrentChampion?: boolean;
}

export interface IndividualAwardWinner {
  name: string;
  countryCode: string;
  countryName: string;
}

export interface IndividualAward {
  id: 'best-player' | 'best-goalkeeper' | 'top-scorer' | 'best-young-player';
  title: string;
  eyebrow: string;
  winners: IndividualAwardWinner[];
}

export const ASEAN_CHAMPIONSHIP_HONOURS: TournamentHonour[] = [
  {
    rank: 1,
    teamName: 'Thái Lan',
    countryCode: 'TH',
    titles: 7,
    winningYears: [1996, 2000, 2002, 2014, 2016, 2020, 2022],
  },
  {
    rank: 2,
    teamName: 'Việt Nam',
    countryCode: 'VN',
    titles: 4,
    winningYears: [2008, 2018, 2024, 2026],
    isCurrentChampion: true,
  },
  {
    rank: 3,
    teamName: 'Singapore',
    countryCode: 'SG',
    titles: 4,
    winningYears: [1998, 2004, 2007, 2012],
  },
  {
    rank: 4,
    teamName: 'Malaysia',
    countryCode: 'MY',
    titles: 1,
    winningYears: [2010],
  },
];

export const ASEAN_CUP_2026_INDIVIDUAL_AWARDS: IndividualAward[] = [
  {
    id: 'best-player',
    eyebrow: 'Cầu thủ xuất sắc nhất',
    title: 'Cầu thủ xuất sắc nhất',
    winners: [{ name: 'Nguyễn Đình Bắc', countryCode: 'VN', countryName: 'Việt Nam' }],
  },
  {
    id: 'best-goalkeeper',
    eyebrow: 'Găng tay vàng',
    title: 'Thủ môn xuất sắc nhất',
    winners: [{ name: 'Lê Giang Patrik', countryCode: 'VN', countryName: 'Việt Nam' }],
  },
  {
    id: 'top-scorer',
    eyebrow: 'Vua phá lưới',
    title: 'Vua phá lưới',
    winners: [
      { name: 'Nguyễn Đình Bắc', countryCode: 'VN', countryName: 'Việt Nam' },
      { name: 'Nguyễn Xuân Son', countryCode: 'VN', countryName: 'Việt Nam' },
    ],
  },
  {
    id: 'best-young-player',
    eyebrow: 'Tài năng trẻ',
    title: 'Cầu thủ trẻ xuất sắc nhất',
    winners: [{ name: 'Yotsakorn', countryCode: 'TH', countryName: 'Thái Lan' }],
  },
];
