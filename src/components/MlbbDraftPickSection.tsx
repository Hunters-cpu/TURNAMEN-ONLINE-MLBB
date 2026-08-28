import React, { useState, useEffect } from 'react';
import { 
  Swords, Shield, Zap, Search, RefreshCw, Sparkles, CheckCircle2, 
  AlertTriangle, ShieldAlert, Ban, Copy, Check, Info, Lock, RotateCcw,
  Target, Cpu, HelpCircle, ArrowRight, Trophy, Flame, Award, BarChart3, X, Crosshair, Package, BookOpen
} from 'lucide-react';
import { MLBB_HEROES, MLBB_ROLES, MlbbHero } from '../data/mlbbHeroes';
import { MLBB_ITEMS, MlbbItem } from '../data/mlbbItems';

interface MlbbDraftPickSectionProps {
  onSelectHeroForRegistration?: (heroes: string[]) => void;
}

// MLBB Draft Pick Turn Order Definition
type DraftPhaseStep = 
  | 'BAN_BLUE_1' | 'BAN_RED_1' | 'BAN_BLUE_2' | 'BAN_RED_2' | 'BAN_BLUE_3' | 'BAN_RED_3'
  | 'PICK_BLUE_1' | 'PICK_RED_1' | 'PICK_RED_2' | 'PICK_BLUE_2' | 'PICK_BLUE_3' 
  | 'PICK_RED_3' | 'PICK_RED_4' | 'PICK_BLUE_4' | 'PICK_BLUE_5' | 'PICK_RED_5'
  | 'COMPLETED';

// Matchup detail for Victory Test
interface MatchupDetail {
  slotIndex: number;
  lane: string;
  blueHero: MlbbHero;
  redHero: MlbbHero;
  winner: 'BLUE' | 'RED' | 'TIE';
  advantageReason: string;
}

// Victory Test Evaluation Result
interface VictoryTestResult {
  winner: 'BLUE' | 'RED';
  blueScore: number;
  redScore: number;
  blueWinRate: number; // e.g. 65%
  redWinRate: number;  // e.g. 35%
  matchups: MatchupDetail[];
  blueCounterCount: number;
  redCounterCount: number;
  blueMetaPower: number;
  redMetaPower: number;
  winningKeyFactors: string[];
  inGameAdvice: string;
}

export const MlbbDraftPickSection: React.FC<MlbbDraftPickSectionProps> = () => {
  // Active Tab: 'SIMULATOR', 'COUNTER_LOOKUP', 'BUILD_RECOMMENDATION', 'COUNTER_ITEM'
  const [activeMainTab, setActiveMainTab] = useState<'SIMULATOR' | 'COUNTER_LOOKUP' | 'BUILD_RECOMMENDATION' | 'COUNTER_ITEM'>('SIMULATOR');

  // Draft Pick State
  const [activeRoleFilter, setActiveRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 5 Picks for Team Blue (My Team) and 5 Picks for Team Red (Enemy Team - Auto Picked Same Role)
  const [blueTeam, setBlueTeam] = useState<(MlbbHero | null)[]>([null, null, null, null, null]);
  const [redTeam, setRedTeam] = useState<(MlbbHero | null)[]>([null, null, null, null, null]);

  // Banned Heroes (Max 6: 3 Blue, 3 Red)
  const [blueBans, setBlueBans] = useState<(MlbbHero | null)[]>([null, null, null]);
  const [redBans, setRedBans] = useState<(MlbbHero | null)[]>([null, null, null]);

  // Active Draft Phase Step
  const [currentStep, setCurrentStep] = useState<DraftPhaseStep>('BAN_BLUE_1');

  // Currently hovered / preview hero before clicking Lock In in simulator
  const [hoveredHero, setHoveredHero] = useState<MlbbHero | null>(null);

  // Timer simulation (30s countdown per turn)
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // =========================================================================
  // DRAFT PICK TEST & VICTORY EVALUATION STATE
  // =========================================================================
  const [showVictoryTestModal, setShowVictoryTestModal] = useState<boolean>(false);
  const [victoryResult, setVictoryResult] = useState<VictoryTestResult | null>(null);

  // =========================================================================
  // DEDICATED COUNTER HERO LOOKUP STATE
  // =========================================================================
  const [counterLookupRoleFilter, setCounterLookupRoleFilter] = useState<string>('ALL');
  const [counterLookupSearch, setCounterLookupSearch] = useState<string>('');
  const [selectedCounterLookupHero, setSelectedCounterLookupHero] = useState<MlbbHero>(MLBB_HEROES[0]); // Default Tigreal (Tank)

  // =========================================================================
  // BUILD ITEM REKOMENDASI STATE
  // =========================================================================
  const [buildHeroRoleFilter, setBuildHeroRoleFilter] = useState<string>('ALL');
  const [buildHeroSearch, setBuildHeroSearch] = useState<string>('');
  const [selectedBuildHero, setSelectedBuildHero] = useState<MlbbHero>(MLBB_HEROES[0]); // Default Tigreal

  // =========================================================================
  // COUNTER ITEM STATE
  // =========================================================================
  const [itemCategoryFilter, setItemCategoryFilter] = useState<string>('ALL');
  const [itemSearchQuery, setItemSearchQuery] = useState<string>('');
  const [selectedCounterItem, setSelectedCounterItem] = useState<MlbbItem>(MLBB_ITEMS[0]); // Default Blade of Despair

  const laneLabels = ['Roam / Tank', 'Jungle / Core', 'EXP Lane', 'Gold Lane', 'Mid Lane'];

  // Auto decrement timer for simulation
  useEffect(() => {
    if (currentStep === 'COMPLETED') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) return 30;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentStep]);

  // Filtered Heroes List for Simulator
  const filteredHeroes = MLBB_HEROES.filter(hero => {
    const matchRole = activeRoleFilter === 'ALL' || hero.role === activeRoleFilter;
    const matchSearch = hero.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        hero.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        hero.recommendedLane.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchSearch;
  });

  // Filtered Heroes List for Dedicated Counter Lookup
  const counterLookupFilteredHeroes = MLBB_HEROES.filter(hero => {
    const matchRole = counterLookupRoleFilter === 'ALL' || hero.role === counterLookupRoleFilter;
    const matchSearch = hero.name.toLowerCase().includes(counterLookupSearch.toLowerCase()) ||
                        hero.specialty.toLowerCase().includes(counterLookupSearch.toLowerCase()) ||
                        hero.recommendedLane.toLowerCase().includes(counterLookupSearch.toLowerCase());
    return matchRole && matchSearch;
  });

  // Filtered Heroes List for Build Item Recommendation
  const buildFilteredHeroes = MLBB_HEROES.filter(hero => {
    const matchRole = buildHeroRoleFilter === 'ALL' || hero.role === buildHeroRoleFilter;
    const matchSearch = hero.name.toLowerCase().includes(buildHeroSearch.toLowerCase()) ||
                        hero.specialty.toLowerCase().includes(buildHeroSearch.toLowerCase()) ||
                        hero.recommendedLane.toLowerCase().includes(buildHeroSearch.toLowerCase());
    return matchRole && matchSearch;
  });

  // Filtered Items List for Counter Item Lookup
  const filteredItems = MLBB_ITEMS.filter(item => {
    const matchCategory = itemCategoryFilter === 'ALL' || item.category === itemCategoryFilter;
    const matchSearch = item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
                        item.description.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
                        (item.s41Note && item.s41Note.toLowerCase().includes(itemSearchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // Check if a hero is already picked or banned in simulator
  const isHeroSelectedInSimulator = (heroId: string) => {
    const inBlue = blueTeam.some(h => h?.id === heroId);
    const inRed = redTeam.some(h => h?.id === heroId);
    const inBlueBan = blueBans.some(h => h?.id === heroId);
    const inRedBan = redBans.some(h => h?.id === heroId);
    return inBlue || inRed || inBlueBan || inRedBan;
  };

  // Turn Step Progress Mapping
  const STEP_SEQUENCE: DraftPhaseStep[] = [
    'BAN_BLUE_1', 'BAN_RED_1', 'BAN_BLUE_2', 'BAN_RED_2', 'BAN_BLUE_3', 'BAN_RED_3',
    'PICK_BLUE_1',
    'PICK_RED_1', 'PICK_RED_2',
    'PICK_BLUE_2', 'PICK_BLUE_3',
    'PICK_RED_3', 'PICK_RED_4',
    'PICK_BLUE_4', 'PICK_BLUE_5',
    'PICK_RED_5',
    'COMPLETED'
  ];

  const getStepDescription = (step: DraftPhaseStep) => {
    switch (step) {
      case 'BAN_BLUE_1': return { team: 'blue', action: 'BAN', title: 'TIM BIRU: BAN HERO 1', sub: 'Pilih hero yang ingin di-ban oleh Tim Biru' };
      case 'BAN_RED_1': return { team: 'red', action: 'BAN', title: 'TIM MERAH: BAN HERO 1', sub: 'Pilih hero yang ingin di-ban oleh Tim Merah' };
      case 'BAN_BLUE_2': return { team: 'blue', action: 'BAN', title: 'TIM BIRU: BAN HERO 2', sub: 'Pilih hero kedua untuk di-ban oleh Tim Biru' };
      case 'BAN_RED_2': return { team: 'red', action: 'BAN', title: 'TIM MERAH: BAN HERO 2', sub: 'Pilih hero kedua untuk di-ban oleh Tim Merah' };
      case 'BAN_BLUE_3': return { team: 'blue', action: 'BAN', title: 'TIM BIRU: BAN HERO 3', sub: 'Pilih hero ketiga untuk di-ban oleh Tim Biru' };
      case 'BAN_RED_3': return { team: 'red', action: 'BAN', title: 'TIM MERAH: BAN HERO 3', sub: 'Pilih hero ketiga untuk di-ban oleh Tim Merah' };
      case 'PICK_BLUE_1': return { team: 'blue', action: 'PICK', slotIndex: 0, title: 'TIM BIRU (S1) - FIRST PICK', sub: 'Pilih hero Tim Biru. Tim lawan OTOMATIS memilih hero ROLE YANG SAMA!' };
      case 'PICK_RED_1': return { team: 'red', action: 'PICK', slotIndex: 0, title: 'TIM MERAH (S1) - PICK 1', sub: 'Otomatis terpilih sama Role dengan Tim Biru S1' };
      case 'PICK_RED_2': return { team: 'red', action: 'PICK', slotIndex: 1, title: 'TIM MERAH (S2) - PICK 2', sub: 'Otomatis terpilih sama Role' };
      case 'PICK_BLUE_2': return { team: 'blue', action: 'PICK', slotIndex: 1, title: 'TIM BIRU (S2) - PICK 2', sub: 'Pilih hero Tim Biru S2. Opponent auto pick role sama!' };
      case 'PICK_BLUE_3': return { team: 'blue', action: 'PICK', slotIndex: 2, title: 'TIM BIRU (S3) - PICK 3', sub: 'Pilih hero Tim Biru S3. Opponent auto pick role sama!' };
      case 'PICK_RED_3': return { team: 'red', action: 'PICK', slotIndex: 2, title: 'TIM MERAH (S3) - PICK 3', sub: 'Otomatis terpilih sama Role' };
      case 'PICK_RED_4': return { team: 'red', action: 'PICK', slotIndex: 3, title: 'TIM MERAH (S4) - PICK 4', sub: 'Otomatis terpilih sama Role' };
      case 'PICK_BLUE_4': return { team: 'blue', action: 'PICK', slotIndex: 3, title: 'TIM BIRU (S4) - PICK 4', sub: 'Pilih hero Tim Biru S4. Opponent auto pick role sama!' };
      case 'PICK_BLUE_5': return { team: 'blue', action: 'PICK', slotIndex: 4, title: 'TIM BIRU (S5) - LAST PICK', sub: 'Pilih hero Tim Biru S5. Opponent auto pick role sama!' };
      case 'PICK_RED_5': return { team: 'red', action: 'PICK', slotIndex: 4, title: 'TIM MERAH (S5) - LAST PICK', sub: 'Otomatis terpilih sama Role' };
      case 'COMPLETED': return { team: 'none', action: 'DONE', title: 'FASE DRAFT PICK SELESAI!', sub: 'Perbandingan 5 Role Sama antara Tim Biru & Tim Merah Selesai' };
    }
  };

  const currentStepInfo = getStepDescription(currentStep);

  // Helper to find available hero with SAME ROLE for Opponent Auto-Pick
  const findAutoOpponentHeroSameRole = (
    role: string, 
    excludedHeroIds: string[]
  ): MlbbHero | null => {
    // Find candidate hero with exact same role that hasn't been selected
    const candidates = MLBB_HEROES.filter(
      h => h.role === role && !excludedHeroIds.includes(h.id)
    );
    if (candidates.length > 0) {
      // Pick top available candidate
      return candidates[0];
    }
    // Fallback if no hero left in same role
    const fallback = MLBB_HEROES.find(h => !excludedHeroIds.includes(h.id));
    return fallback || null;
  };

  // Lock In Hero Action (WITH AUTOMATIC OPPONENT SAME ROLE PICK RULE)
  const handleLockInHero = (hero: MlbbHero) => {
    if (isHeroSelectedInSimulator(hero.id) || currentStep === 'COMPLETED') return;

    // BANNING PHASE
    if (currentStepInfo.action === 'BAN') {
      if (currentStepInfo.team === 'blue') {
        const nextBanIdx = blueBans.findIndex(b => b === null);
        if (nextBanIdx !== -1) {
          const updated = [...blueBans];
          updated[nextBanIdx] = hero;
          setBlueBans(updated);
        }
      } else {
        const nextBanIdx = redBans.findIndex(b => b === null);
        if (nextBanIdx !== -1) {
          const updated = [...redBans];
          updated[nextBanIdx] = hero;
          setRedBans(updated);
        }
      }

      // Advance step
      const currentIdx = STEP_SEQUENCE.indexOf(currentStep);
      if (currentIdx < STEP_SEQUENCE.length - 1) {
        setCurrentStep(STEP_SEQUENCE[currentIdx + 1]);
        setTimeLeft(30);
      }
    } 
    // PICKING PHASE: AUTO-PAIR OPPONENT WITH SAME ROLE
    else if (currentStepInfo.action === 'PICK') {
      const slotIndex = typeof currentStepInfo.slotIndex === 'number' ? currentStepInfo.slotIndex : 0;
      
      const updatedBlue = [...blueTeam];
      const updatedRed = [...redTeam];

      if (currentStepInfo.team === 'blue') {
        // User selects hero for Blue Team
        updatedBlue[slotIndex] = hero;

        // Collect all currently selected IDs
        const currentSelectedIds = [
          ...updatedBlue.filter(Boolean).map(h => h!.id),
          ...updatedRed.filter(Boolean).map(h => h!.id),
          ...blueBans.filter(Boolean).map(h => h!.id),
          ...redBans.filter(Boolean).map(h => h!.id)
        ];

        // AUTOMATICALLY pick hero for Red Team with EXACT SAME ROLE
        const autoOpponentHero = findAutoOpponentHeroSameRole(hero.role, currentSelectedIds);
        if (autoOpponentHero) {
          updatedRed[slotIndex] = autoOpponentHero;
        }

        setBlueTeam(updatedBlue);
        setRedTeam(updatedRed);
      } else {
        // User selects for Red Team directly
        updatedRed[slotIndex] = hero;

        const currentSelectedIds = [
          ...updatedBlue.filter(Boolean).map(h => h!.id),
          ...updatedRed.filter(Boolean).map(h => h!.id),
          ...blueBans.filter(Boolean).map(h => h!.id),
          ...redBans.filter(Boolean).map(h => h!.id)
        ];

        // AUTOMATICALLY pick hero for Blue Team with EXACT SAME ROLE
        const autoOpponentHero = findAutoOpponentHeroSameRole(hero.role, currentSelectedIds);
        if (autoOpponentHero) {
          updatedBlue[slotIndex] = autoOpponentHero;
        }

        setBlueTeam(updatedBlue);
        setRedTeam(updatedRed);
      }

      // Advance step past both pick turns if applicable
      const currentIdx = STEP_SEQUENCE.indexOf(currentStep);
      let nextIdx = currentIdx + 1;
      // Skip next pick step if it was auto-filled
      if (nextIdx < STEP_SEQUENCE.length && STEP_SEQUENCE[nextIdx].startsWith('PICK_')) {
        nextIdx += 1;
      }
      
      if (nextIdx < STEP_SEQUENCE.length) {
        setCurrentStep(STEP_SEQUENCE[nextIdx]);
      } else {
        setCurrentStep('COMPLETED');
      }
      setTimeLeft(30);
    }

    setHoveredHero(null);
  };

  // Reset entire draft simulation
  const handleResetDraft = () => {
    setBlueTeam([null, null, null, null, null]);
    setRedTeam([null, null, null, null, null]);
    setBlueBans([null, null, null]);
    setRedBans([null, null, null]);
    setCurrentStep('BAN_BLUE_1');
    setTimeLeft(30);
    setHoveredHero(null);
    setVictoryResult(null);
  };

  // Instant Meta Auto-Fill for quick simulation
  const handleAutoMetaDraft = () => {
    setBlueBans([
      MLBB_HEROES.find(h => h.id === 'diggie') || MLBB_HEROES[32],
      MLBB_HEROES.find(h => h.id === 'franco') || MLBB_HEROES[2],
      MLBB_HEROES.find(h => h.id === 'fanny') || MLBB_HEROES[14]
    ]);

    setRedBans([
      MLBB_HEROES.find(h => h.id === 'khufra') || MLBB_HEROES[1],
      MLBB_HEROES.find(h => h.id === 'ling') || MLBB_HEROES[12],
      MLBB_HEROES.find(h => h.id === 'wanwan') || MLBB_HEROES[27]
    ]);

    // Roles matched: Tank vs Tank, Assassin vs Assassin, Fighter vs Fighter, Marksman vs Marksman, Mage vs Mage
    setBlueTeam([
      MLBB_HEROES.find(h => h.id === 'tigreal') || MLBB_HEROES[0],  // Tank
      MLBB_HEROES.find(h => h.id === 'lancelot') || MLBB_HEROES[13], // Assassin
      MLBB_HEROES.find(h => h.id === 'yu-zhong') || MLBB_HEROES[6], // Fighter
      MLBB_HEROES.find(h => h.id === 'beatrix') || MLBB_HEROES[24], // Marksman
      MLBB_HEROES.find(h => h.id === 'pharsa') || MLBB_HEROES[18]  // Mage
    ]);

    setRedTeam([
      MLBB_HEROES.find(h => h.id === 'hylos') || MLBB_HEROES[5],    // Tank (Same Role)
      MLBB_HEROES.find(h => h.id === 'hayabusa') || MLBB_HEROES[15], // Assassin (Same Role)
      MLBB_HEROES.find(h => h.id === 'dyrroth') || MLBB_HEROES[10],  // Fighter (Same Role)
      MLBB_HEROES.find(h => h.id === 'brody') || MLBB_HEROES[25],    // Marksman (Same Role)
      MLBB_HEROES.find(h => h.id === 'xavier') || MLBB_HEROES[21]    // Mage (Same Role)
    ]);

    setCurrentStep('COMPLETED');
  };

  // =========================================================================
  // TEST DRAFT PICK & VICTORY EVALUATION ENGINE
  // =========================================================================
  const runVictoryTest = () => {
    // Fill empty slots with defaults if draft is incomplete for testing
    const filledBlue = blueTeam.map((h, i) => h || (MLBB_HEROES[i * 4 % MLBB_HEROES.length] || MLBB_HEROES[0]));
    const filledRed = redTeam.map((h, i) => h || (MLBB_HEROES[(i * 4 + 2) % MLBB_HEROES.length] || MLBB_HEROES[1]));

    let blueScore = 50;
    let redScore = 50;
    let blueCounterCount = 0;
    let redCounterCount = 0;
    let blueMetaPower = 0;
    let redMetaPower = 0;

    // 1. Calculate Meta Power (Tier S+ = 25, S = 20, A = 15, B = 10)
    filledBlue.forEach(h => {
      if (h.tier === 'S+') blueMetaPower += 25;
      else if (h.tier === 'S') blueMetaPower += 20;
      else if (h.tier === 'A') blueMetaPower += 15;
      else blueMetaPower += 10;
    });

    filledRed.forEach(h => {
      if (h.tier === 'S+') redMetaPower += 25;
      else if (h.tier === 'S') redMetaPower += 20;
      else if (h.tier === 'A') redMetaPower += 15;
      else redMetaPower += 10;
    });

    blueScore += blueMetaPower;
    redScore += redMetaPower;

    // 2. Direct Laning Matchup & Counter Comparisons
    const matchups: MatchupDetail[] = [];
    const keyFactors: string[] = [];

    filledBlue.forEach((bHero, idx) => {
      const rHero = filledRed[idx];
      let bAdv = 0;
      let rAdv = 0;

      // Counter checks
      const bCountersR = bHero.counters.some(c => c.toLowerCase().includes(rHero.name.toLowerCase()) || rHero.name.toLowerCase().includes(c.toLowerCase())) ||
                         rHero.counteredBy.some(cb => cb.heroName.toLowerCase().includes(bHero.name.toLowerCase()));

      const rCountersB = rHero.counters.some(c => c.toLowerCase().includes(bHero.name.toLowerCase()) || bHero.name.toLowerCase().includes(c.toLowerCase())) ||
                         bHero.counteredBy.some(cb => cb.heroName.toLowerCase().includes(rHero.name.toLowerCase()));

      let reason = '';

      if (bCountersR) {
        bAdv += 18;
        blueCounterCount++;
        reason = `🎯 ${bHero.name} meng-counter ${rHero.name}!`;
      }
      if (rCountersB) {
        rAdv += 18;
        redCounterCount++;
        reason = reason ? `${reason} & 🎯 ${rHero.name} meng-counter balik!` : `🎯 ${rHero.name} meng-counter ${bHero.name}!`;
      }

      // Tier Weights comparison
      const tierWeight = { 'S+': 12, 'S': 9, 'A': 6, 'B': 3 };
      const bTierVal = tierWeight[bHero.tier as keyof typeof tierWeight] || 6;
      const rTierVal = tierWeight[rHero.tier as keyof typeof tierWeight] || 6;
      bAdv += bTierVal;
      rAdv += rTierVal;

      if (!reason) {
        if (bAdv > rAdv) reason = `⚡ ${bHero.name} unggul tier power (${bHero.tier} vs ${rHero.tier})`;
        else if (rAdv > bAdv) reason = `⚡ ${rHero.name} unggul tier power (${rHero.tier} vs ${bHero.tier})`;
        else reason = `⚖️ Duel seimbang di lane ${laneLabels[idx] || bHero.recommendedLane}`;
      }

      let winner: 'BLUE' | 'RED' | 'TIE' = 'TIE';
      if (bAdv > rAdv) winner = 'BLUE';
      else if (rAdv > bAdv) winner = 'RED';

      matchups.push({
        slotIndex: idx,
        lane: laneLabels[idx] || bHero.recommendedLane,
        blueHero: bHero,
        redHero: rHero,
        winner,
        advantageReason: reason
      });

      blueScore += bAdv;
      redScore += rAdv;
    });

    // Determine total win probability percentage
    const totalScore = blueScore + redScore;
    let blueWinRate = Math.round((blueScore / totalScore) * 100);
    // Clamp between 20% and 80% to keep realistic competitive probability
    blueWinRate = Math.max(22, Math.min(78, blueWinRate));
    const redWinRate = 100 - blueWinRate;

    const winner: 'BLUE' | 'RED' = blueWinRate >= 50 ? 'BLUE' : 'RED';

    // Key factors summary
    if (blueCounterCount > redCounterCount) {
      keyFactors.push(`🔵 Tim Biru mendominasi ${blueCounterCount} direct hero counter vs ${redCounterCount} milik lawan.`);
    } else if (redCounterCount > blueCounterCount) {
      keyFactors.push(`🔴 Tim Merah memiliki ${redCounterCount} direct hero counter vs ${blueCounterCount} milik Tim Biru.`);
    } else {
      keyFactors.push(`⚖️ Kedua tim memiliki jumlah direct counter yang seimbang (${blueCounterCount} vs ${redCounterCount}).`);
    }

    if (blueMetaPower > redMetaPower) {
      keyFactors.push(`🔵 Tim Biru unggul dalam total skor Meta Tier Power (${blueMetaPower} pts vs ${redMetaPower} pts).`);
    } else if (redMetaPower > blueMetaPower) {
      keyFactors.push(`🔴 Tim Merah unggul dalam total skor Meta Tier Power (${redMetaPower} pts vs ${blueMetaPower} pts).`);
    } else {
      keyFactors.push(`⚡ Total kekuatan Meta Tier kedua tim berimbang (${blueMetaPower} pts).`);
    }

    // In-game tactical strategy advice
    let inGameAdvice = '';
    if (winner === 'BLUE') {
      inGameAdvice = '🛡️ STRATEGI KEMENANGAN: Tim Biru memiliki statistik draft lebih unggul. Fokus menekan di Early-Mid game, amankan Lithowanderer & Turtle pertama, lalu snowball melalui teamfight objective!';
    } else {
      inGameAdvice = '⚠️ PERINGATAN STRATEGI: Draft Tim Merah sedikit lebih kuat dalam head-to-head. Tim Biru disarankan bermain sabar (scaling), memanfaatkan gank gabungan 3 hero di Gold Lane, dan menculik hero damage utama lawan sebelum Contest Lord!';
    }

    setVictoryResult({
      winner,
      blueScore,
      redScore,
      blueWinRate,
      redWinRate,
      matchups,
      blueCounterCount,
      redCounterCount,
      blueMetaPower,
      redMetaPower,
      winningKeyFactors: keyFactors,
      inGameAdvice
    });

    setShowVictoryTestModal(true);
  };

  // Calculate Counter Hero Recommendations for Simulator
  const pickedRedHeroes = redTeam.filter((h): h is MlbbHero => h !== null);
  const pickedBlueHeroes = blueTeam.filter((h): h is MlbbHero => h !== null);

  const counterRecommendationsAgainstRed = MLBB_HEROES.filter(hero => {
    if (isHeroSelectedInSimulator(hero.id)) return false;
    return pickedRedHeroes.some(redHero => 
      hero.counters.some(cName => redHero.name.toLowerCase().includes(cName.toLowerCase()) || cName.toLowerCase().includes(redHero.name.toLowerCase())) ||
      redHero.counteredBy.some(cb => cb.heroName.toLowerCase().includes(hero.name.toLowerCase()))
    );
  });

  const counterThreatsToBlue: { blueHero: MlbbHero; redHero: MlbbHero; reason: string }[] = [];
  pickedBlueHeroes.forEach(bHero => {
    pickedRedHeroes.forEach(rHero => {
      const threat = bHero.counteredBy.find(cb => cb.heroName.toLowerCase().includes(rHero.name.toLowerCase()));
      if (threat) {
        counterThreatsToBlue.push({
          blueHero: bHero,
          redHero: rHero,
          reason: threat.reason
        });
      }
    });
  });

  // Copy Draft Summary to Clipboard
  const handleCopyDraftSummary = () => {
    const blueStr = blueTeam.map((h, i) => `  S${i+1}: ${h ? `${h.roleEmoji} ${h.name} (${h.role} - ${h.recommendedLane})` : '[Kosong]'}`).join('\n');
    const redStr = redTeam.map((h, i) => `  S${i+1}: ${h ? `${h.roleEmoji} ${h.name} (${h.role} - ${h.recommendedLane})` : '[Kosong]'}`).join('\n');
    const bBanStr = blueBans.filter(Boolean).map(h => h?.name).join(', ') || 'Tanpa Ban';
    const rBanStr = redBans.filter(Boolean).map(h => h?.name).join(', ') || 'Tanpa Ban';

    const text = 
      `🎮 HASIL DRAFT PICK MLBB (OTOMATIS SAME ROLE OPPONENT) 🎮\n` +
      `----------------------------------------\n` +
      `🔵 TIM BIRU:\n${blueStr}\n` +
      `🚫 Ban Tim Biru: ${bBanStr}\n\n` +
      `🔴 TIM MERAH (AUTO SAME ROLE):\n${redStr}\n` +
      `🚫 Ban Tim Merah: ${rBanStr}\n` +
      `----------------------------------------\n` +
      `🏆 Prediksi Kemenangan: ${victoryResult ? `${victoryResult.winner === 'BLUE' ? 'TIM BIRU' : 'TIM MERAH'} (${victoryResult.winner === 'BLUE' ? victoryResult.blueWinRate : victoryResult.redWinRate}%)` : 'Belum Diuji'}\n` +
      `💡 Rekomendasi Counter Hero: ${counterRecommendationsAgainstRed.slice(0, 3).map(h => h.name).join(', ') || 'Meta Standard'}\n` +
      `Diakses dari Website Turnamen Hunters Esports!`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Calculate detailed items counter for Selected Counter Lookup Hero
  const getItemCounters = (hero: MlbbHero) => {
    const items: { name: string; type: string; reason: string }[] = [];

    if (hero.role === 'Tank' || hero.role === 'Fighter') {
      items.push({
        name: 'Dominance Ice / Sea Halberd',
        type: 'Anti-Regen / Anti-Lifesteal',
        reason: `Mengurangi efek lifesteal, spell vamp, dan shield ${hero.name} sebesar 50%.`
      });
      items.push({
        name: 'Malefic Roar / Divine Glaive',
        type: 'Physical / Magic Penetration',
        reason: `Menembus pertahanan armor / magic defense tebal milik ${hero.name}.`
      });
    }

    if (hero.role === 'Mage') {
      items.push({
        name: "Athena's Shield",
        type: 'Magic Burst Counter',
        reason: `Mengurangi damage Magic Burst instan ${hero.name} hingga 25% selama 3 detik.`
      });
      items.push({
        name: 'Radiant Armor',
        type: 'Continuous Magic Counter',
        reason: `Memberikan akumulasi Magic Defense terhadap damage bertahap (DPS) ${hero.name}.`
      });
    }

    if (hero.role === 'Assassin' || hero.role === 'Marksman') {
      items.push({
        name: 'Antique Cuirass',
        type: 'Physical Skill Counter',
        reason: `Mengurangi Physical Attack ${hero.name} sebesar 6% setiap terkena skill (stack hingga 3x).`
      });
      items.push({
        name: 'Wind of Nature (WON) / Winter Truncheon',
        type: 'Immunity Item',
        reason: `Memberikan kebal damage fisik 2 detik (WON) atau membeku 2 detik (Winter) saat ditarget ${hero.name}.`
      });
    }

    return items;
  };

  return (
    <div className="space-y-6 bg-[#06080e] border border-cyan-500/30 rounded-3xl p-3 sm:p-6 shadow-2xl relative overflow-hidden select-none">
      {/* BACKGROUND GLOW EFFECTS */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP TAB NAVIGATION: 4 MAIN TABS (SIMULATOR, COUNTER LOOKUP, BUILD RECOMMENDATION, COUNTER ITEM) */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-3 bg-slate-950 p-2 rounded-2xl border border-cyan-500/30 relative z-10 shadow-lg">
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <button
            type="button"
            onClick={() => setActiveMainTab('SIMULATOR')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeMainTab === 'SIMULATOR'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Swords className="w-4 h-4 text-cyan-300" />
            <span>Simulasi Draft 5v5</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('COUNTER_LOOKUP')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeMainTab === 'COUNTER_LOOKUP'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/30 border border-amber-300'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Target className="w-4 h-4 text-amber-950" />
            <span>🎯 Counter Hero</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('BUILD_RECOMMENDATION')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeMainTab === 'BUILD_RECOMMENDATION'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 border border-emerald-400'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-300" />
            <span>📦 Build Item Rekomendasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('COUNTER_ITEM')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeMainTab === 'COUNTER_ITEM'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-pink-300" />
            <span>🛡️ Counter Item S41</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-slate-400 text-xs font-mono font-bold">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Aturan S41: Meta Tier, Item Counter & Draft Pick</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: SIMULATOR DRAFT PICK (5V5 SAME ROLE AUTO PICK) */}
      {/* ========================================================================= */}
      {activeMainTab === 'SIMULATOR' && (
        <div className="space-y-5 animate-fade-in">
          {/* ACTION BANNER & TEST VICTORY TRIGGER */}
          <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-red-950/80 border border-cyan-500/40 p-3.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl shrink-0 border border-cyan-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-cyan-300 uppercase tracking-wide flex items-center gap-2">
                  <span>🎮 ATURAN LAWAN OTOMATIS: SAME ROLE PICK</span>
                  <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 text-[9px] rounded font-mono font-bold">LOCKED</span>
                </p>
                <p className="text-[11px] text-slate-300">
                  Pilih hero Tim Biru, Tim Merah (Lawan) <span className="text-amber-300 font-bold">OTOMATIS memilih hero Role sama</span>. Lalu klik Uji Victory!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* FEATURE USER REQUESTED: TEST DRAFT PICK VICTORY BUTTON */}
              <button
                type="button"
                onClick={runVictoryTest}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs rounded-xl uppercase flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 border border-emerald-300 cursor-pointer transition-all active:scale-95 animate-pulse"
              >
                <Trophy className="w-4 h-4 text-slate-950" />
                <span>🧪 TEST DRAFT PICK (CEK VICTORY)</span>
              </button>

              <button
                type="button"
                onClick={handleAutoMetaDraft}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-black text-xs rounded-xl uppercase flex items-center gap-1 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Auto Draft</span>
              </button>

              <button
                type="button"
                onClick={handleResetDraft}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs rounded-xl uppercase flex items-center gap-1 cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* DRAFT PICK STATUS HEADER & BANS */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border font-mono font-black text-lg ${
                  currentStepInfo.team === 'blue' 
                    ? 'bg-blue-950 text-blue-400 border-blue-500 shadow-lg shadow-blue-500/30 animate-pulse' 
                    : currentStepInfo.team === 'red'
                    ? 'bg-red-950 text-red-400 border-red-500 shadow-lg shadow-red-500/30 animate-pulse'
                    : 'bg-emerald-950 text-emerald-400 border-emerald-500'
                }`}>
                  {currentStep === 'COMPLETED' ? '✓' : `${timeLeft}s`}
                </div>

                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                    currentStepInfo.team === 'blue' ? 'bg-blue-500/20 text-blue-400' : currentStepInfo.team === 'red' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {currentStepInfo.action === 'BAN' ? '🚫 FASE BANNED' : currentStepInfo.action === 'PICK' ? '⚔️ FASE PICK HERO (AUTO SAME ROLE)' : '🏆 DRAFT SELESAI'}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight mt-0.5">
                    {currentStepInfo.title}
                  </h3>
                  <p className="text-xs text-slate-400">{currentStepInfo.sub}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={runVictoryTest}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl uppercase flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Award className="w-4 h-4 text-slate-950" />
                  <span>Uji Victory</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyDraftSummary}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-black text-xs rounded-xl uppercase flex items-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                  <span>{isCopied ? 'Tersalin!' : 'Salin Rekap'}</span>
                </button>
              </div>
            </div>

            {/* BANNED HEROES ZONE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="flex items-center justify-between bg-blue-950/30 p-2.5 rounded-xl border border-blue-500/30">
                <span className="text-[11px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <Ban className="w-3.5 h-3.5 text-blue-400" />
                  <span>BAN TIM BIRU</span>
                </span>

                <div className="flex items-center gap-2">
                  {blueBans.map((hero, idx) => (
                    <div key={`bban-${idx}`} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-blue-500/40 flex items-center gap-1">
                      {hero ? (
                        <>
                          <span className="text-[10px] text-red-400 font-black">🚫 {hero.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono">({hero.role})</span>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-mono font-bold">Slot B{idx + 1}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between bg-red-950/30 p-2.5 rounded-xl border border-red-500/30">
                <span className="text-[11px] font-black text-red-400 uppercase tracking-wider flex items-center gap-1">
                  <Ban className="w-3.5 h-3.5 text-red-400" />
                  <span>BAN TIM MERAH</span>
                </span>

                <div className="flex items-center gap-2">
                  {redBans.map((hero, idx) => (
                    <div key={`rban-${idx}`} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-red-500/40 flex items-center gap-1">
                      {hero ? (
                        <>
                          <span className="text-[10px] text-red-400 font-black">🚫 {hero.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono">({hero.role})</span>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-mono font-bold">Slot R{idx + 1}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ARENA LAYOUT: TEAM BLUE (LEFT) VS HERO GALLERY (CENTER) VS TEAM RED (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
            {/* TIM BIRU - 5 SLOTS */}
            <div className="lg:col-span-3 space-y-2">
              <div className="bg-gradient-to-r from-blue-900 to-blue-950 p-2.5 rounded-xl border border-blue-500/50 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400 animate-ping" />
                  <h4 className="text-xs font-black text-blue-300 uppercase tracking-wider">
                    🔵 TIM BIRU (TIM SAYA)
                  </h4>
                </div>
                <span className="text-[9px] bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded font-bold">
                  1st Pick
                </span>
              </div>

              <div className="space-y-2">
                {blueTeam.map((hero, idx) => {
                  const isActiveTurn = currentStepInfo.team === 'blue' && currentStepInfo.slotIndex === idx;
                  return (
                    <div
                      key={`blue-slot-card-${idx}`}
                      className={`relative rounded-2xl overflow-hidden border transition-all duration-300 p-3 flex items-center justify-between ${
                        isActiveTurn
                          ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border-blue-400 ring-2 ring-blue-500/80 shadow-2xl shadow-blue-500/40 scale-[1.02]'
                          : hero
                          ? 'bg-slate-950/90 border-blue-500/40'
                          : 'bg-slate-950/50 border-dashed border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-500/50 flex items-center justify-center text-xs font-black font-mono text-blue-400 shrink-0">
                          S{idx + 1}
                        </div>

                        {hero ? (
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-sm font-black text-white uppercase tracking-tight truncate">
                                {hero.name}
                              </h5>
                              <span className="text-[9px] bg-amber-500/20 text-amber-300 font-mono px-1 rounded font-bold">
                                {hero.tier}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-blue-300 font-mono mt-0.5">
                              <span>{hero.roleEmoji}</span>
                              <span className="font-bold">{hero.role}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400 truncate">{hero.recommendedLane}</span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className={`text-xs font-bold ${isActiveTurn ? 'text-blue-400 animate-pulse' : 'text-slate-600'}`}>
                              {isActiveTurn ? '⚡ SEDANG MEMILIH...' : 'Menunggu Turn...'}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">{laneLabels[idx]}</p>
                          </div>
                        )}
                      </div>

                      {hero && (
                        <div className="p-1 bg-blue-500/10 text-blue-400 rounded-lg shrink-0 border border-blue-500/30">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CENTER COLUMN: HERO GALLERY GRID (PURE TEXT & BADGES - NO IMAGES) */}
            <div className="lg:col-span-6 bg-slate-950/80 p-3 sm:p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                {/* SEARCH & ROLE FILTER BAR */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="relative w-full sm:w-52">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Cari nama hero..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>

                  {/* ROLES TABS */}
                  <div className="flex flex-wrap items-center justify-center gap-1 w-full sm:w-auto">
                    {MLBB_ROLES.map((role) => (
                      <button
                        key={role.key}
                        type="button"
                        onClick={() => setActiveRoleFilter(role.key)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer uppercase ${
                          activeRoleFilter === role.key
                            ? 'bg-cyan-600 text-white border border-cyan-400 shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        <span>{role.icon}</span>
                        <span className="hidden sm:inline">{role.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* HEROES LIST GRID (TEXT BADGES ONLY) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {filteredHeroes.map((hero) => {
                    const selected = isHeroSelectedInSimulator(hero.id);
                    const isHovered = hoveredHero?.id === hero.id;

                    return (
                      <div
                        key={`hero-text-card-${hero.id}`}
                        onClick={() => {
                          if (!selected && currentStep !== 'COMPLETED') {
                            setHoveredHero(hero);
                          }
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                          selected
                            ? 'bg-slate-950/60 border-slate-850 opacity-30 cursor-not-allowed'
                            : isHovered
                            ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-500/50 scale-102 shadow-xl shadow-cyan-950/60'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-800/90'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-cyan-300 font-mono font-bold flex items-center gap-1">
                            <span>{hero.roleEmoji}</span>
                            <span>{hero.role}</span>
                          </span>
                          <span className={`text-[8px] font-black font-mono px-1 rounded ${
                            hero.tier === 'S+' ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
                          }`}>
                            {hero.tier}
                          </span>
                        </div>

                        <div className="my-1">
                          <h6 className={`text-xs font-black uppercase truncate ${selected ? 'text-slate-500 line-through' : 'text-white'}`}>
                            {hero.name}
                          </h6>
                          <p className="text-[9px] text-slate-400 truncate">{hero.specialty}</p>
                        </div>

                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                          <span>{hero.recommendedLane}</span>
                          {selected ? (
                            <span className="text-red-400 font-black">LOCKED</span>
                          ) : (
                            <span className="text-cyan-400 group-hover:underline">Pilih ›</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LOCK IN ACTION FOOTER */}
              {hoveredHero && currentStep !== 'COMPLETED' ? (
                <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-500/40 p-3 rounded-xl flex items-center justify-between gap-3 shadow-xl animate-fade-in mt-2">
                  <div>
                    <h5 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                      <span>{hoveredHero.roleEmoji} {hoveredHero.name}</span>
                      <span className="text-[10px] text-cyan-300 font-mono">({hoveredHero.role} - {hoveredHero.recommendedLane})</span>
                    </h5>
                    <p className="text-[10px] text-slate-300 line-clamp-1">{hoveredHero.description}</p>
                    <p className="text-[9px] text-amber-300 font-mono mt-0.5">
                      ⚡ Menolak Lock In akan otomatis memilihkan hero {hoveredHero.role} untuk tim lawan!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLockInHero(hoveredHero)}
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-xl border border-cyan-400 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Kunci Hero (Lock In)</span>
                  </button>
                </div>
              ) : (
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400 italic">
                    💡 Klik hero di atas untuk memilih. Lalu klik tombol Test Draft Pick untuk cek penentuan VICTORY!
                  </span>
                  <button
                    type="button"
                    onClick={runVictoryTest}
                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] rounded-lg uppercase tracking-wider shrink-0"
                  >
                    Uji Victory
                  </button>
                </div>
              )}
            </div>

            {/* TIM MERAH - 5 SLOTS (AUTO SAME ROLE ENEMY PICK) */}
            <div className="lg:col-span-3 space-y-2">
              <div className="bg-gradient-to-r from-red-950 to-red-900 p-2.5 rounded-xl border border-red-500/50 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400 animate-ping" />
                  <h4 className="text-xs font-black text-red-300 uppercase tracking-wider">
                    🔴 TIM MERAH (TIM LAWAN)
                  </h4>
                </div>
                <span className="text-[9px] bg-red-500/20 text-red-300 font-mono px-2 py-0.5 rounded font-bold">
                  Auto Same Role
                </span>
              </div>

              <div className="space-y-2">
                {redTeam.map((hero, idx) => {
                  const isActiveTurn = currentStepInfo.team === 'red' && currentStepInfo.slotIndex === idx;
                  return (
                    <div
                      key={`red-slot-card-${idx}`}
                      className={`relative rounded-2xl overflow-hidden border transition-all duration-300 p-3 flex items-center justify-between ${
                        isActiveTurn
                          ? 'bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-red-400 ring-2 ring-red-500/80 shadow-2xl shadow-red-500/40 scale-[1.02]'
                          : hero
                          ? 'bg-slate-950/90 border-red-500/40'
                          : 'bg-slate-950/50 border-dashed border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-xl bg-red-950 border border-red-500/50 flex items-center justify-center text-xs font-black font-mono text-red-400 shrink-0">
                          S{idx + 1}
                        </div>

                        {hero ? (
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-sm font-black text-white uppercase tracking-tight truncate">
                                {hero.name}
                              </h5>
                              <span className="text-[9px] bg-red-500/20 text-red-300 font-mono px-1 rounded font-bold">
                                {hero.tier}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-red-300 font-mono mt-0.5">
                              <span>{hero.roleEmoji}</span>
                              <span className="font-bold">{hero.role}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400 truncate">{hero.recommendedLane}</span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-bold text-slate-500">
                              Otomatis Same Role...
                            </p>
                            <p className="text-[10px] text-slate-600 font-mono">{laneLabels[idx]}</p>
                          </div>
                        )}
                      </div>

                      {hero && (
                        <span className="text-[8px] bg-red-950 text-red-400 border border-red-500/40 font-mono font-bold px-1.5 py-0.5 rounded">
                          AUTO ROLE
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* REAL-TIME DRAFT COUNTER ANALYZER */}
          <div className="bg-gradient-to-r from-cyan-950/70 via-slate-950 to-emerald-950/70 p-4 rounded-2xl border border-cyan-500/40 space-y-3 shadow-xl relative z-10">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  ANALISIS COUNTER REAL-TIME TIM SAYA VS TIM LAWAN
                </h4>
              </div>

              <button
                type="button"
                onClick={runVictoryTest}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-lg uppercase flex items-center gap-1 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-slate-950" />
                <span>Uji Victory Now</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#05080f] p-3 rounded-xl border border-emerald-500/30 space-y-2">
                <h5 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>REKOMENDASI HERO COUNTER UNTUK MEMBALAS LAWAN:</span>
                </h5>
                {counterRecommendationsAgainstRed.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {counterRecommendationsAgainstRed.slice(0, 6).map((hero) => (
                      <span key={`sim-counter-${hero.id}`} className="px-2 py-1 bg-slate-900 border border-emerald-500/40 rounded-lg text-xs font-bold text-emerald-300">
                        {hero.roleEmoji} {hero.name} ({hero.role})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Pilih hero di draft untuk melihat rekomendasi counter.</p>
                )}
              </div>

              <div className="bg-[#0f0507] p-3 rounded-xl border border-red-500/30 space-y-2">
                <h5 className="text-xs font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>ANCAMAN COUNTER DARI TIM LAWAN:</span>
                </h5>
                {counterThreatsToBlue.length > 0 ? (
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1 text-xs">
                    {counterThreatsToBlue.map((t, i) => (
                      <div key={`thr-${i}`} className="text-red-300 font-mono">
                        🔴 {t.redHero.name} meng-counter 🔵 {t.blueHero.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Tidak ada ancaman counter langsung saat ini.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: FITUR DEDIKASI LOOKUP COUNTER HERO */}
      {/* ========================================================================= */}
      {activeMainTab === 'COUNTER_LOOKUP' && (
        <div className="space-y-6 animate-fade-in relative z-10">
          {/* HEADER FEATURE TITLE */}
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-4 rounded-2xl border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-amber-300 uppercase tracking-wide">
                  🎯 FITUR LOOKUP COUNTER HERO MOBILE LEGENDS
                </h3>
                <p className="text-xs text-slate-300">
                  Pilih role (e.g. Tank) & hero untuk melihat seluruh daftar hero counter, hero yang di-counter, serta build item penangkalnya secara otomatis!
                </p>
              </div>
            </div>

            <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold rounded-full">
              {MLBB_HEROES.length} Hero Database
            </span>
          </div>

          {/* ROLE SELECTOR TABS & SEARCH BAR */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* SEARCH HERO */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama hero (misal: Tigreal, Khufra)..."
                  value={counterLookupSearch}
                  onChange={(e) => setCounterLookupSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              {/* ROLE FILTER TABS */}
              <div className="flex flex-wrap items-center gap-1.5">
                {MLBB_ROLES.map((role) => (
                  <button
                    key={`lookup-role-${role.key}`}
                    type="button"
                    onClick={() => setCounterLookupRoleFilter(role.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                      counterLookupRoleFilter === role.key
                        ? 'bg-amber-500 text-slate-950 border border-yellow-300 shadow-md scale-105'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>{role.icon}</span>
                    <span>{role.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* HERO SELECTOR HORIZONTAL / GRID LIST */}
            <div className="pt-2">
              <label className="text-[11px] font-black text-amber-300 uppercase tracking-wider block mb-2">
                PILIH HERO YANG INGIN DICARI COUNTERNYA:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                {counterLookupFilteredHeroes.map((hero) => {
                  const isSelected = selectedCounterLookupHero.id === hero.id;
                  return (
                    <button
                      key={`select-lookup-${hero.id}`}
                      type="button"
                      onClick={() => setSelectedCounterLookupHero(hero)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-950 to-slate-900 border-amber-400 ring-2 ring-amber-500/80 shadow-lg scale-102'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-amber-400 font-mono font-bold">
                          {hero.roleEmoji} {hero.role}
                        </span>
                        <span className={`text-[8px] font-black font-mono px-1 rounded ${
                          hero.tier === 'S+' ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
                        }`}>
                          {hero.tier}
                        </span>
                      </div>

                      <h5 className={`text-xs font-black uppercase tracking-tight my-1 truncate ${
                        isSelected ? 'text-amber-300' : 'text-white'
                      }`}>
                        {hero.name}
                      </h5>

                      <span className="text-[9px] text-slate-400 truncate">
                        {hero.recommendedLane}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AUTOMATIC COUNTER HERO DISPLAY PANEL FOR SELECTED HERO */}
          <div className="bg-slate-950 rounded-2xl border border-amber-500/40 p-5 space-y-6 shadow-2xl relative overflow-hidden">
            {/* SELECTED HERO DISPLAY HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black font-mono">
                    HERO TERPILIH
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    Lane: {selectedCounterLookupHero.recommendedLane}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <span>{selectedCounterLookupHero.roleEmoji} {selectedCounterLookupHero.name}</span>
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-mono">
                    Role: {selectedCounterLookupHero.role}
                  </span>
                </h2>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {selectedCounterLookupHero.description}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-right shrink-0">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Spesialisasi</span>
                <strong className="text-xs text-amber-300 font-mono">{selectedCounterLookupHero.specialty}</strong>
              </div>
            </div>

            {/* THREE COLUMN GRID: COUNTERED BY, COUNTERS, AND ITEM COUNTER BUILD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* 1. HERO YANG MENG-COUNTER HERO INI (PENAKLUK / COUNTERED BY) */}
              <div className="bg-[#0f0507] p-4 rounded-xl border border-red-500/40 space-y-3">
                <div className="flex items-center gap-2 border-b border-red-500/30 pb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div>
                    <h4 className="text-xs font-black text-red-400 uppercase tracking-wider">
                      HERO COUNTER {selectedCounterLookupHero.name.toUpperCase()}
                    </h4>
                    <p className="text-[10px] text-slate-400">Hero yang paling efektif menumbangkan {selectedCounterLookupHero.name}</p>
                  </div>
                </div>

                {selectedCounterLookupHero.counteredBy.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedCounterLookupHero.counteredBy.map((item, idx) => {
                      const counterHeroData = MLBB_HEROES.find(h => h.name.toLowerCase() === item.heroName.toLowerCase());
                      return (
                        <div key={`cb-${idx}`} className="p-3 bg-slate-950 border border-red-500/30 rounded-xl space-y-1.5 shadow-md">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-red-300 uppercase flex items-center gap-1">
                              <span>⚔️</span>
                              <span>{item.heroName}</span>
                            </span>
                            {counterHeroData && (
                              <span className="text-[9px] bg-red-950 text-red-400 border border-red-500/40 font-mono px-1.5 py-0.5 rounded font-bold">
                                {counterHeroData.roleEmoji} {counterHeroData.role}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                            💡 <span className="font-semibold text-slate-200">{item.reason}</span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Tidak ada catatan counter langsung.</p>
                )}
              </div>

              {/* 2. HERO YANG DITAKLUKKAN OLEH HERO INI (HERO COUNTERS) */}
              <div className="bg-[#05090f] p-4 rounded-xl border border-emerald-500/40 space-y-3">
                <div className="flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                      HERO YANG DI-COUNTER OLEH {selectedCounterLookupHero.name.toUpperCase()}
                    </h4>
                    <p className="text-[10px] text-slate-400">Hero yang mudah dikalahkan oleh {selectedCounterLookupHero.name}</p>
                  </div>
                </div>

                {selectedCounterLookupHero.counters.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCounterLookupHero.counters.map((cName, idx) => {
                      const targetHeroData = MLBB_HEROES.find(h => h.name.toLowerCase() === cName.toLowerCase());
                      return (
                        <div key={`c-${idx}`} className="p-2.5 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-1">
                          <p className="text-xs font-black text-emerald-300 uppercase truncate">
                            🎯 {cName}
                          </p>
                          {targetHeroData && (
                            <p className="text-[9px] text-slate-400 font-mono">
                              {targetHeroData.roleEmoji} {targetHeroData.role}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Dapat dimainkan seimbang menghadapi berbagai hero.</p>
                )}
              </div>

              {/* 3. REKOMENDASI BUILD ITEM COUNTER */}
              <div className="bg-[#0b080f] p-4 rounded-xl border border-cyan-500/40 space-y-3">
                <div className="flex items-center gap-2 border-b border-cyan-500/30 pb-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider">
                      ITEM COUNTER (PENANGKAL {selectedCounterLookupHero.name.toUpperCase()})
                    </h4>
                    <p className="text-[10px] text-slate-400">Equipment paling wajib dibeli di in-game shop</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {getItemCounters(selectedCounterLookupHero).map((item, idx) => (
                    <div key={`item-${idx}`} className="p-2.5 bg-slate-950 border border-cyan-500/30 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-cyan-300 uppercase">
                          🛡️ {item.name}
                        </span>
                        <span className="text-[9px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded font-mono font-bold">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                        {item.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: BUILD ITEM REKOMENDASI PER HERO (SEASON 41) */}
      {/* ========================================================================= */}
      {activeMainTab === 'BUILD_RECOMMENDATION' && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <div className="bg-[#050811] p-4 sm:p-6 rounded-2xl border border-emerald-500/30 space-y-4 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/40">
                  <Package className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <span>BUILD ITEM REKOMENDASI HERO S41</span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                      SEASON 41 META
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pilih hero untuk melihat 6 racikan equipment tersakit, terkuat, dan terefektif di Season 41.
                  </p>
                </div>
              </div>

              {/* ROLE FILTER BUTTONS */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {MLBB_ROLES.map((role) => (
                  <button
                    key={`build-role-${role.key}`}
                    type="button"
                    onClick={() => setBuildHeroRoleFilter(role.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                      buildHeroRoleFilter === role.key
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{role.icon}</span>
                    <span>{role.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* MAIN CONTENT GRID: HERO SELECTOR VS BUILD DISPLAY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT: HERO SELECTOR (SEARCH & GRID) */}
              <div className="lg:col-span-4 space-y-3 bg-[#080d1a] p-4 rounded-xl border border-slate-800">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={buildHeroSearch}
                    onChange={(e) => setBuildHeroSearch(e.target.value)}
                    placeholder="Cari hero untuk build item..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div className="max-h-[500px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                  {buildFilteredHeroes.map((hero) => {
                    const isSelected = selectedBuildHero.id === hero.id;
                    return (
                      <button
                        key={`b-hero-${hero.id}`}
                        type="button"
                        onClick={() => setSelectedBuildHero(hero)}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-950/80 to-slate-900 border-emerald-400 text-white shadow-md'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={hero.avatar}
                            alt={hero.name}
                            className={`w-10 h-10 rounded-lg object-cover shrink-0 border ${
                              isSelected ? 'border-emerald-400 ring-2 ring-emerald-400/30' : 'border-slate-700'
                            }`}
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-white truncate flex items-center gap-1.5">
                              <span>{hero.name}</span>
                              <span className="text-[10px] text-emerald-400 font-mono">({hero.tier})</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <span>{hero.roleEmoji} {hero.role}</span>
                              <span>•</span>
                              <span className="text-slate-500">{hero.recommendedLane}</span>
                            </p>
                          </div>
                        </div>
                        {isSelected && <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: SELECTED HERO BUILD DETAIL */}
              <div className="lg:col-span-8 space-y-4">
                {/* HERO NAME HEADER */}
                <div className="p-4 bg-gradient-to-r from-emerald-950/80 via-slate-950 to-slate-950 rounded-2xl border border-emerald-500/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                      {selectedBuildHero.name}
                    </h3>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold px-3 py-1 rounded-lg">
                    {selectedBuildHero.roleEmoji} {selectedBuildHero.role} {selectedBuildHero.secondaryRole ? `/ ${selectedBuildHero.secondaryRole}` : ''}
                  </span>
                </div>

                {/* BUILD ITEM LIST (6 SLOTS) */}
                <div className="bg-[#070b14] p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-400" />
                      <span>RACIKAN 6 EQUIPMENT core S41:</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">Slot 1 — Slot 6</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedBuildHero.recommendedBuild.map((itemName, idx) => {
                      const itemData = MLBB_ITEMS.find(
                        it => it.name.toLowerCase() === itemName.toLowerCase() ||
                              it.name.toLowerCase().includes(itemName.toLowerCase())
                      );

                      return (
                        <div
                          key={`b-item-${idx}`}
                          className="p-3 bg-slate-950 border border-emerald-500/30 hover:border-emerald-400 rounded-xl space-y-1.5 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded">
                              Slot #{idx + 1}
                            </span>
                            {itemData && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {itemData.categoryEmoji} {itemData.category}
                              </span>
                            )}
                          </div>
                          <h5 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                            <span>{itemName}</span>
                          </h5>
                          <p className="text-[10px] text-slate-300 font-sans leading-relaxed line-clamp-3">
                            {itemData ? itemData.description : 'Equipment pilihan penunjang performa pertempuran.'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* STRATEGY & EXPLANATION NOTE */}
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-2xl space-y-1.5">
                  <h5 className="text-xs font-black text-emerald-400 uppercase flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>TAKTIK & RAHASIA RACIKAN BUILD S41:</span>
                  </h5>
                  <p className="text-xs text-slate-200 font-sans leading-relaxed">
                    {selectedBuildHero.buildExplanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: LOOKUP COUNTER ITEM SEASON 41 */}
      {/* ========================================================================= */}
      {activeMainTab === 'COUNTER_ITEM' && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <div className="bg-[#08050e] p-4 sm:p-6 rounded-2xl border border-purple-500/30 space-y-4 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 text-pink-400 rounded-2xl border border-purple-500/40">
                  <ShieldAlert className="w-6 h-6 text-pink-300" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <span>DATABASE COUNTER ITEM SEASON 41</span>
                    <span className="text-xs bg-pink-500/20 text-pink-300 border border-pink-500/40 px-2 py-0.5 rounded font-mono font-bold">
                      S41 ITEM COUNTERS
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cari item musuh yang bikin pusing, dan temukan item penangkal (counter) beserta taktik netralisasinya.
                  </p>
                </div>
              </div>

              {/* ITEM CATEGORY FILTERS */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {['ALL', 'PHYSICAL', 'MAGIC', 'DEFENSE', 'BOOTS', 'JUNGLE', 'ROAMING'].map((cat) => (
                  <button
                    key={`cat-${cat}`}
                    type="button"
                    onClick={() => setItemCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                      itemCategoryFilter === cat
                        ? 'bg-purple-500 text-white font-black shadow-lg shadow-purple-500/30'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* ITEM SEARCH & DISPLAY GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT: ITEM SELECTOR LIST */}
              <div className="lg:col-span-5 space-y-3 bg-[#0d0716] p-4 rounded-xl border border-slate-800">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    placeholder="Cari item (contoh: Sky Piercer, Dominance...)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div className="max-h-[500px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                  {filteredItems.map((item) => {
                    const isSelected = selectedCounterItem.id === item.id;
                    return (
                      <button
                        key={`item-btn-${item.id}`}
                        type="button"
                        onClick={() => setSelectedCounterItem(item)}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-950/80 to-slate-900 border-pink-400 text-white shadow-md'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">{item.categoryEmoji}</span>
                            <h4 className="text-xs font-black text-white truncate">{item.name}</h4>
                          </div>
                          {item.s41Note && (
                            <p className="text-[9px] text-pink-400 font-mono truncate mt-0.5">
                              ✨ {item.s41Note}
                            </p>
                          )}
                        </div>
                        <span className="text-[9px] text-purple-300 font-mono uppercase bg-purple-950 px-1.5 py-0.5 rounded shrink-0">
                          {item.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: SELECTED ITEM DETAILS & COUNTERS */}
              <div className="lg:col-span-7 space-y-4">
                {/* ITEM HEADER BANNER */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950/80 via-slate-950 to-slate-950 rounded-2xl border border-pink-500/40 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{selectedCounterItem.categoryEmoji}</span>
                      <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                        {selectedCounterItem.name}
                      </h3>
                    </div>
                    <span className="text-xs bg-purple-950 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded font-mono font-bold">
                      Kategori {selectedCounterItem.category}
                    </span>
                  </div>

                  {selectedCounterItem.s41Note && (
                    <div className="p-2 bg-pink-950/30 border border-pink-500/40 rounded-xl text-xs text-pink-300 font-mono font-bold flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-pink-400 shrink-0" />
                      <span>{selectedCounterItem.s41Note}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
                    {selectedCounterItem.description}
                  </p>
                </div>

                {/* ITEM COUNTERS & NETRALISASI */}
                <div className="bg-[#070b14] p-4 rounded-2xl border border-pink-500/30 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Shield className="w-5 h-5 text-pink-400" />
                    <div>
                      <h4 className="text-xs font-black text-pink-300 uppercase tracking-wider">
                        ITEM & STRATEGI COUNTER PENANGKAL {selectedCounterItem.name.toUpperCase()}:
                      </h4>
                      <p className="text-[10px] text-slate-400">Equipment wajib beli untuk meredam efek item ini</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedCounterItem.counters.map((cItem, idx) => (
                      <div
                        key={`counter-it-${idx}`}
                        className="p-3.5 bg-slate-950 border border-purple-500/30 hover:border-pink-400 rounded-xl space-y-1.5 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-black text-pink-300 uppercase flex items-center gap-1.5">
                            <span>🛡️ COUNTER ITEM #{idx + 1}: {cItem.counterItemName}</span>
                          </h5>
                          <span className="text-[9px] text-purple-300 bg-purple-950 px-2 py-0.5 rounded font-mono">
                            REKOMENDASI OPSI
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 font-sans leading-relaxed">
                          {cItem.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showVictoryTestModal && victoryResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-[#070b14] border-2 border-amber-500/60 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-auto space-y-4 p-4 sm:p-6 text-slate-100">
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setShowVictoryTestModal(false)}
              className="absolute top-4 right-4 p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-700 cursor-pointer transition-all z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* MODAL HEADER */}
            <div className="flex items-center gap-3 border-b border-amber-500/30 pb-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40">
                <Trophy className="w-7 h-7 text-amber-400 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-black uppercase px-2 py-0.5 rounded">
                  HASIL ANALISIS TEST DRAFT PICK 5V5
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight mt-0.5">
                  PENENTUAN PEMENANG & VICTORY DRAFT
                </h3>
              </div>
            </div>

            {/* BIG VICTORY BANNER */}
            <div className={`p-5 rounded-2xl border-2 text-center space-y-3 relative overflow-hidden shadow-2xl ${
              victoryResult.winner === 'BLUE'
                ? 'bg-gradient-to-r from-blue-950 via-cyan-950 to-blue-950 border-cyan-400'
                : 'bg-gradient-to-r from-red-950 via-amber-950 to-red-950 border-red-500'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <Flame className="w-6 h-6 text-amber-400" />
                <span className="text-xs font-mono font-black tracking-widest text-amber-300 uppercase">
                  HASIL SIMULASI DRAFT MATCHUP
                </span>
                <Flame className="w-6 h-6 text-amber-400" />
              </div>

              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-white">
                <span>🏆 VICTORY:</span>
                <span className={victoryResult.winner === 'BLUE' ? 'text-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]' : 'text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]'}>
                  {victoryResult.winner === 'BLUE' ? 'TIM BIRU (TIM SAYA)' : 'TIM MERAH (TIM LAWAN)'}
                </span>
              </h2>

              {/* WIN PROBABILITY BAR */}
              <div className="max-w-md mx-auto space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-mono font-black uppercase">
                  <span className="text-cyan-400">🔵 Tim Biru: {victoryResult.blueWinRate}%</span>
                  <span className="text-red-400">🔴 Tim Merah: {victoryResult.redWinRate}%</span>
                </div>
                <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700 flex">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-l-full transition-all duration-700"
                    style={{ width: `${victoryResult.blueWinRate}%` }}
                  />
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-r-full transition-all duration-700"
                    style={{ width: `${victoryResult.redWinRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* LANING MATCHUP DETAILED TABLE */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>EVALUASI DUEL 5 LANE (SAME ROLE)</span>
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {victoryResult.matchups.map((m, idx) => (
                  <div key={`m-detail-${idx}`} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2">
                    {/* BLUE HERO */}
                    <div className="flex items-center gap-2 w-full sm:w-2/5">
                      <span className="text-xs font-mono font-bold text-blue-400 shrink-0">S{m.slotIndex + 1}</span>
                      <div className="truncate">
                        <span className="text-xs font-black text-white uppercase">{m.blueHero.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">({m.blueHero.role} - {m.blueHero.tier})</span>
                      </div>
                    </div>

                    {/* VS & ADVANTAGE REASON */}
                    <div className="text-center w-full sm:w-1/5 shrink-0 my-1 sm:my-0">
                      <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded border block mb-0.5 ${
                        m.winner === 'BLUE' ? 'bg-blue-950 text-blue-300 border-blue-500' : m.winner === 'RED' ? 'bg-red-950 text-red-300 border-red-500' : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}>
                        {m.winner === 'BLUE' ? '🔵 BIRU UNGGUL' : m.winner === 'RED' ? '🔴 MERAH UNGGUL' : '⚖️ SEIMBANG'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono block">{m.lane}</span>
                    </div>

                    {/* RED HERO */}
                    <div className="flex items-center justify-end gap-2 w-full sm:w-2/5 text-right">
                      <div className="truncate">
                        <span className="text-xs font-black text-white uppercase">{m.redHero.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">({m.redHero.role} - {m.redHero.tier})</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-red-400 shrink-0">S{m.slotIndex + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KEY WINNING FACTORS & IN-GAME ADVICE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <h5 className="text-xs font-black text-cyan-300 uppercase flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <span>FAKTOR PENENTU KEMENANGAN:</span>
                </h5>
                <ul className="space-y-1 text-xs text-slate-300">
                  {victoryResult.winningKeyFactors.map((f, i) => (
                    <li key={`kf-${i}`} className="flex items-start gap-1.5 font-sans">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <h5 className="text-xs font-black text-amber-300 uppercase flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>REKOMENDASI TAKTIK IN-GAME:</span>
                </h5>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {victoryResult.inGameAdvice}
                </p>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 pt-4">
              <p className="text-[11px] text-slate-400 font-mono">
                💡 Hasil berdasarkan bobot Meta Tier, Direct Hero Counters, dan Lane Balance MLBB.
              </p>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyDraftSummary}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Salin Rekap</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowVictoryTestModal(false)}
                  className="flex-1 sm:flex-initial px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer shadow-lg"
                >
                  Tutup Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
