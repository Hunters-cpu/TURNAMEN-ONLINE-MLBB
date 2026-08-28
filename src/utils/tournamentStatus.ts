import { SiteConfig, UpcomingTournament } from '../types';

/**
 * Checks if an active tournament for the given game is configured/added by Admin.
 */
export function isGameTournamentAdded(siteConfig?: SiteConfig, game: 'FF' | 'MLBB' = 'FF'): boolean {
  if (!siteConfig) return false;

  if (game === 'FF') {
    if (siteConfig.isFfTournamentActive === true) return true;
    const hasUpcomingFf = (siteConfig.upcomingTournaments || []).some(t => t.game === 'FF' && t.status !== 'Pendaftaran Ditutup');
    return hasUpcomingFf;
  }

  if (game === 'MLBB') {
    if (siteConfig.isMlbbTournamentActive === true) return true;
    const hasUpcomingMlbb = (siteConfig.upcomingTournaments || []).some(t => t.game === 'MLBB' && t.status !== 'Pendaftaran Ditutup');
    return hasUpcomingMlbb;
  }

  return false;
}

/**
 * Checks if registration is currently OPEN for the given game.
 * If registration is closed or tournament is not added, returns false.
 */
export function isGameRegistrationOpen(siteConfig?: SiteConfig, game: 'FF' | 'MLBB' = 'FF'): boolean {
  if (!siteConfig) return false;

  // Tournament must be active / added first
  if (!isGameTournamentAdded(siteConfig, game)) {
    return false;
  }

  if (game === 'FF') {
    return siteConfig.isFfRegistrationOpen === true;
  }

  if (game === 'MLBB') {
    return siteConfig.isMlbbRegistrationOpen === true;
  }

  return false;
}

/**
 * Check if ANY tournament is added (FF or MLBB).
 */
export function hasAnyTournamentAdded(siteConfig?: SiteConfig): boolean {
  return isGameTournamentAdded(siteConfig, 'FF') || isGameTournamentAdded(siteConfig, 'MLBB');
}

/**
 * Check if ANY registration is open.
 */
export function hasAnyOpenRegistration(siteConfig?: SiteConfig): boolean {
  return isGameRegistrationOpen(siteConfig, 'FF') || isGameRegistrationOpen(siteConfig, 'MLBB');
}
