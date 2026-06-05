export type TeamLogoEra = {
  start: number;
  end: number;
  file: string;
};

export const TEAM_LOGO_ERAS: Record<string, TeamLogoEra[]> = {
  ANA: [
    { start: 2006, end: 2024, file: "2006-24.png" },
    { start: 2024, end: 9999, file: "2024-current.png" },
  ],

  BUF: [
    { start: 2006, end: 2010, file: "2006-10.png" },
    { start: 2010, end: 2020, file: "2010-20.png" },
    { start: 2020, end: 9999, file: "2020-current.png" },
  ],

  ARI: [
    { start: 2003, end: 2015, file: "2003-15.png" },
    { start: 2015, end: 2021, file: "2015-21.png" },
    { start: 2021, end: 2024, file: "2021-24.png" },
  ],

  ATL: [{ start: 1999, end: 2011, file: "1999-11.png" }],

  CAR: [{ start: 1997, end: 9999, file: "1997-current.png" }],

  CBJ: [{ start: 2007, end: 9999, file: "2007-current.png" }],

  CGY: [
    { start: 2007, end: 2020, file: "2007-20.png" },
    { start: 2020, end: 9999, file: "2020-current.png" },
  ],

  CHI: [{ start: 1959, end: 9999, file: "1959-current.png" }],

  COL: [{ start: 1995, end: 9999, file: "1995-current.png" }],

  DAL: [
    { start: 1994, end: 2013, file: "1994-13.png" },
    { start: 2013, end: 9999, file: "2013-current.png" },
  ],

  DET: [{ start: 1932, end: 9999, file: "1932-current.png" }],

  EDM: [{ start: 1996, end: 9999, file: "1996-current.png" }],

  FLA: [
    { start: 1993, end: 2016, file: "1993-16.png" },
    { start: 2016, end: 9999, file: "2016-current.png" },
  ],

  LAK: [
    { start: 2002, end: 2011, file: "2002-11.png" },
    { start: 2011, end: 2024, file: "2011-24.png" },
    { start: 2024, end: 9999, file: "2024-current.png" },
  ],

  MIN: [{ start: 2000, end: 9999, file: "2000-current.png" }],

  MTL: [{ start: 1917, end: 9999, file: "1917-current.png" }],

  NJD: [{ start: 1992, end: 9999, file: "1992-current.png" }],

  NSH: [
    { start: 1998, end: 2011, file: "1998-11.png" },
    { start: 2011, end: 9999, file: "2011-current.png" },
  ],

  NYI: [{ start: 1998, end: 9999, file: "1998-current.png" }],

  NYR: [{ start: 1926, end: 9999, file: "1926-current.png" }],

  OTT: [
    { start: 2007, end: 2020, file: "2007-20.png" },
    { start: 2020, end: 9999, file: "2020-current.png" },
  ],

  PHI: [{ start: 1967, end: 9999, file: "1967-current.png" }],

  PIT: [
    { start: 2002, end: 2016, file: "2002-16.png" },
    { start: 2016, end: 9999, file: "2016-current.png" },
  ],

  SJS: [
    { start: 2007, end: 2022, file: "2007-22.png" },
    { start: 2022, end: 9999, file: "2022-current.png" },
  ],

  SEA: [{ start: 2021, end: 9999, file: "2021-current.png" }],

  STL: [{ start: 1998, end: 9999, file: "1998-current.png" }],

  TBL: [
    { start: 2007, end: 2011, file: "2007-11.png" },
    { start: 2011, end: 9999, file: "2011-current.png" },
  ],

  TOR: [
    { start: 1970, end: 2016, file: "1970-16.png" },
    { start: 2016, end: 9999, file: "2016-current.png" },
  ],

  VAN: [
    { start: 2007, end: 2019, file: "2007-19.png" },
    { start: 2019, end: 9999, file: "2019-current.png" },
  ],

  VGK: [{ start: 2017, end: 9999, file: "2017-current.png" }],

  WPG: [{ start: 2011, end: 9999, file: "2011-current.png" }],

  WSH: [
    { start: 2007, end: 2024, file: "2007-24.png" },
    { start: 2024, end: 9999, file: "2024-current.png" },
  ],

  UTA: [{ start: 2024, end: 9999, file: "2024-current.png" }],
};

export function getSeasonStartYear(season: string) {
  const year = Number(season.split("-")[0]);

  return Number.isNaN(year) ? null : year;
}

export function getTeamLogoFile({
  teamCode,
  season,
}: {
  teamCode: string;
  season: string;
}) {
  const startYear = getSeasonStartYear(season);

  if (startYear === null) return null;

  const eras = TEAM_LOGO_ERAS[teamCode];

  if (!eras) return null;

  const matchingEra = eras.find(
    (era) => startYear >= era.start && startYear <= era.end
  );

  return matchingEra?.file ?? null;
}

export function getTeamLogoSrc({
  teamCode,
  season,
}: {
  teamCode: string;
  season: string;
}) {
  const file = getTeamLogoFile({
    teamCode,
    season,
  });

  if (!file) return "/team-logos/NBI.png";

  return `/team-logos/${teamCode}/${file}`;
}