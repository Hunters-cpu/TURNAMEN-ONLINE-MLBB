import { MatchSchedule, RegisteredTeam } from '../types';
import { GENERATE_DEFAULT_MATCH_SCHEDULES } from '../data/initialData';

/**
 * Fisher-Yates array shuffle helper
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Create randomized 32-team pairings for Babak Penyisihan (16 matches)
 */
export function generateRandom32Pairings(
  currentSchedules: MatchSchedule[],
  gameTarget: 'FF' | 'MLBB',
  registeredTeams: RegisteredTeam[]
): MatchSchedule[] {
  // 1. Get verified / registered team names for the game target
  const gameTeams = (registeredTeams || [])
    .filter(
      (t) =>
        t.game === gameTarget ||
        (gameTarget === 'FF' && (t.game === ('Free Fire' as any) || t.game === ('FF' as any))) ||
        (gameTarget === 'MLBB' && (t.game === ('Mobile Legends' as any) || t.game === ('MLBB' as any) || t.game === ('Mobile Legends: Bang Bang' as any)))
    )
    .map((t) => t.teamName.trim())
    .filter(Boolean);

  // Remove duplicates
  const uniqueRegistered = Array.from(new Set(gameTeams));

  // Build array of 32 team names
  const teamNames: string[] = [...uniqueRegistered];

  // Fill up to 32 with slot names if registered teams < 32
  let slotIndex = 1;
  while (teamNames.length < 32) {
    const slotName = `${gameTarget} Tim Slot ${slotIndex}`;
    if (!teamNames.includes(slotName)) {
      teamNames.push(slotName);
    }
    slotIndex++;
  }

  // Take exactly 32 teams
  const target32Teams = teamNames.slice(0, 32);

  // Shuffle 32 teams randomly
  const shuffled32 = shuffleArray(target32Teams);

  // Create deep copy of current schedules
  let updatedSchedules = (currentSchedules || []).map((s) => ({ ...s }));

  // Check if Penyisihan matches for gameTarget exist and equals 16
  let penyisihanMatches = updatedSchedules.filter(
    (s) => s.game === gameTarget && s.phase === 'Babak Penyisihan'
  );

  if (penyisihanMatches.length < 16) {
    const defaultSchedules = GENERATE_DEFAULT_MATCH_SCHEDULES();
    const otherGameSchedules = updatedSchedules.filter((s) => s.game !== gameTarget);
    const targetGameDefaults = defaultSchedules.filter((s) => s.game === gameTarget);
    updatedSchedules = [...otherGameSchedules, ...targetGameDefaults];

    penyisihanMatches = updatedSchedules.filter(
      (s) => s.game === gameTarget && s.phase === 'Babak Penyisihan'
    );
  }

  // Sort by matchNumber ascending
  penyisihanMatches.sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));

  for (let i = 0; i < 16; i++) {
    const match = penyisihanMatches[i];
    if (match) {
      match.teamA = shuffled32[i * 2];
      match.teamB = shuffled32[i * 2 + 1];
      match.winner = ''; // reset winner on new draw
      match.status = 'mendatang';
    }
  }

  // Recalculate bracket advancements to clear/reset subsequent rounds
  return recalculateAllBracketAdvancements(updatedSchedules, gameTarget);
}

/**
 * Recalculate automatic winner advancements through all stages for a given game
 * Stages flow:
 * Babak Penyisihan (16 matches) -> Babak 16 Besar (8 matches) -> Perempat Final (4 matches) -> Semifinal (2 matches) -> Grand Final (1 match) & Perebutan Juara 3 (1 match)
 */
export function recalculateAllBracketAdvancements(
  schedules: MatchSchedule[],
  gameTarget: 'FF' | 'MLBB'
): MatchSchedule[] {
  const resultSchedules = schedules.map((s) => ({ ...s }));

  const getMatchesByPhase = (phaseName: string) => {
    return resultSchedules
      .filter((s) => s.game === gameTarget && s.phase === phaseName)
      .sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));
  };

  const penyisihan = getMatchesByPhase('Babak Penyisihan');
  const besar16 = getMatchesByPhase('Babak 16 Besar');
  const perempat = getMatchesByPhase('Perempat Final');
  const semifinal = getMatchesByPhase('Semifinal');
  const juara3 = getMatchesByPhase('Perebutan Juara 3');
  const grandFinal = getMatchesByPhase('Grand Final');

  // 1. Babak Penyisihan (16 matches) -> Babak 16 Besar (8 matches)
  penyisihan.forEach((m, idx) => {
    const targetMatchIdx = Math.floor(idx / 2); // 0 to 7
    const isTeamA = idx % 2 === 0;
    const targetMatch = besar16[targetMatchIdx];

    if (targetMatch) {
      if (m.winner && m.winner.trim()) {
        if (isTeamA) targetMatch.teamA = m.winner.trim();
        else targetMatch.teamB = m.winner.trim();
      } else {
        const placeholder = m.teamA && m.teamB ? 'Menunggu Lawan' : `Pemenang Match #${idx + 1}`;
        if (isTeamA) targetMatch.teamA = placeholder;
        else targetMatch.teamB = placeholder;
        // clear winner if source lost winner
        if (targetMatch.winner === targetMatch.teamA || targetMatch.winner === targetMatch.teamB) {
          // keep winner if still valid, else clear
        }
      }
    }
  });

  // 2. Babak 16 Besar (8 matches) -> Perempat Final (4 matches)
  besar16.forEach((m, idx) => {
    const targetMatchIdx = Math.floor(idx / 2); // 0 to 3
    const isTeamA = idx % 2 === 0;
    const targetMatch = perempat[targetMatchIdx];

    if (targetMatch) {
      if (m.winner && m.winner.trim()) {
        if (isTeamA) targetMatch.teamA = m.winner.trim();
        else targetMatch.teamB = m.winner.trim();
      } else {
        const placeholder = m.teamA && m.teamB ? 'Menunggu Lawan' : `Winner 16 Besar #${idx + 1}`;
        if (isTeamA) targetMatch.teamA = placeholder;
        else targetMatch.teamB = placeholder;
      }
    }
  });

  // 3. Perempat Final (4 matches) -> Semifinal (2 matches)
  perempat.forEach((m, idx) => {
    const targetMatchIdx = Math.floor(idx / 2); // 0 to 1
    const isTeamA = idx % 2 === 0;
    const targetMatch = semifinal[targetMatchIdx];

    if (targetMatch) {
      if (m.winner && m.winner.trim()) {
        if (isTeamA) targetMatch.teamA = m.winner.trim();
        else targetMatch.teamB = m.winner.trim();
      } else {
        const placeholder = m.teamA && m.teamB ? 'Menunggu Lawan' : `Winner Quarter #${idx + 1}`;
        if (isTeamA) targetMatch.teamA = placeholder;
        else targetMatch.teamB = placeholder;
      }
    }
  });

  // 4. Semifinal (2 matches) -> Grand Final & Perebutan Juara 3
  const sf1 = semifinal[0];
  const sf2 = semifinal[1];
  const gf = grandFinal[0];
  const j3 = juara3[0];

  if (sf1) {
    if (sf1.winner && sf1.winner.trim()) {
      const winner = sf1.winner.trim();
      const loser = sf1.teamA === winner ? sf1.teamB : sf1.teamA;

      if (gf) gf.teamA = winner;
      if (j3 && loser) j3.teamA = loser;
    } else {
      if (gf) gf.teamA = sf1.teamA && sf1.teamB ? 'Menunggu Lawan' : 'Finalist 1';
      if (j3) j3.teamA = sf1.teamA && sf1.teamB ? 'Menunggu Lawan' : 'Runner Up SF 1';
    }
  }

  if (sf2) {
    if (sf2.winner && sf2.winner.trim()) {
      const winner = sf2.winner.trim();
      const loser = sf2.teamA === winner ? sf2.teamB : sf2.teamA;

      if (gf) gf.teamB = winner;
      if (j3 && loser) j3.teamB = loser;
    } else {
      if (gf) gf.teamB = sf2.teamA && sf2.teamB ? 'Menunggu Lawan' : 'Finalist 2';
      if (j3) j3.teamB = sf2.teamA && sf2.teamB ? 'Menunggu Lawan' : 'Runner Up SF 2';
    }
  }

  return resultSchedules;
}
