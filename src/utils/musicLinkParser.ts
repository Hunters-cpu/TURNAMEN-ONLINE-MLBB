import { MusicSourceType } from '../types';

export interface ParsedMusicInfo {
  sourceType: MusicSourceType;
  platformName: string;
  originalUrl: string;
  embedUrl: string;
  titleSuggestion: string;
  youtubeVideoId?: string;
  spotifyType?: 'track' | 'album' | 'playlist' | 'artist';
  spotifyId?: string;
  thumbnailUrl?: string;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Detects and parses YouTube, Spotify, SoundCloud, or direct audio link
 */
export function parseMusicLink(rawUrl: string, autoPlay: boolean = false, loop: boolean = true): ParsedMusicInfo {
  const url = (rawUrl || '').trim();

  if (!url) {
    return {
      sourceType: 'direct_link',
      platformName: 'Link Kosong',
      originalUrl: '',
      embedUrl: '',
      titleSuggestion: '',
      isValid: false,
      errorMessage: 'Silakan masukkan tautan / URL musik.'
    };
  }

  // 1. Check YouTube
  // Formats:
  // https://youtu.be/abc1234
  // https://www.youtube.com/watch?v=abc1234
  // https://www.youtube.com/embed/abc1234
  // https://music.youtube.com/watch?v=abc1234
  // https://www.youtube.com/shorts/abc1234
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/|music\/watch\?(?:.*&)?v=))([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    const autoplayParam = autoPlay ? 1 : 0;
    const loopParam = loop ? `&loop=1&playlist=${videoId}` : '';
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplayParam}&enablejsapi=1&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}${loopParam}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    return {
      sourceType: 'youtube',
      platformName: 'YouTube Music / Video',
      originalUrl: url,
      embedUrl,
      titleSuggestion: `YouTube Audio (${videoId})`,
      youtubeVideoId: videoId,
      thumbnailUrl,
      isValid: true
    };
  }

  // 2. Check Spotify
  // Formats:
  // https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
  // https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3
  // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
  // https://open.spotify.com/intl-id/track/4cOdK2wGLETKBW3PvgPWqT
  const spotifyMatch = url.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(track|album|playlist|artist)\/([a-zA-Z0-9]+)/i);
  if (spotifyMatch && spotifyMatch[1] && spotifyMatch[2]) {
    const spotifyType = spotifyMatch[1].toLowerCase() as 'track' | 'album' | 'playlist' | 'artist';
    const spotifyId = spotifyMatch[2];
    const embedUrl = `https://open.spotify.com/embed/${spotifyType}/${spotifyId}?utm_source=generator&theme=0`;

    const typeLabel = spotifyType === 'track' ? 'Lagu' : spotifyType === 'album' ? 'Album' : spotifyType === 'playlist' ? 'Playlist' : 'Artis';

    return {
      sourceType: 'spotify',
      platformName: `Spotify (${typeLabel})`,
      originalUrl: url,
      embedUrl,
      titleSuggestion: `Spotify ${typeLabel} (${spotifyId.substring(0, 8)}...)`,
      spotifyType,
      spotifyId,
      thumbnailUrl: 'https://open.spotify.com/favicon.ico',
      isValid: true
    };
  }

  // 3. Check SoundCloud
  // Formats:
  // https://soundcloud.com/artist-name/track-title
  // https://m.soundcloud.com/artist-name/track-title
  // https://on.soundcloud.com/xxxx
  if (url.includes('soundcloud.com/')) {
    const autoplayParam = autoPlay ? 'true' : 'false';
    const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23f59e0b&auto_play=${autoplayParam}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;

    // Extract path for title suggestion
    let slug = 'SoundCloud Track';
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        slug = `${parts[0]} — ${parts[1].replace(/-/g, ' ')}`;
      } else if (parts.length === 1) {
        slug = parts[0];
      }
    } catch (e) {}

    return {
      sourceType: 'soundcloud',
      platformName: 'SoundCloud Audio',
      originalUrl: url,
      embedUrl,
      titleSuggestion: slug,
      thumbnailUrl: 'https://soundcloud.com/favicon.ico',
      isValid: true
    };
  }

  // 4. Direct Audio File Link (.mp3, .wav, .ogg, .m4a, etc.)
  const directAudioRegex = /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i;
  if (directAudioRegex.test(url) || url.startsWith('data:audio/')) {
    const fileName = url.split('/').pop()?.split('?')[0] || 'audio-file.mp3';
    return {
      sourceType: 'direct_link',
      platformName: 'Direct Audio Stream / MP3',
      originalUrl: url,
      embedUrl: url,
      titleSuggestion: fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      isValid: true
    };
  }

  // General URL fallback (attempt direct streaming or embedded iframe)
  try {
    new URL(url);
    return {
      sourceType: 'direct_link',
      platformName: 'Tautan Audio Eksternal',
      originalUrl: url,
      embedUrl: url,
      titleSuggestion: 'Audio Streaming Eksternal',
      isValid: true
    };
  } catch (err) {
    return {
      sourceType: 'direct_link',
      platformName: 'Format Link Tidak Dikenali',
      originalUrl: url,
      embedUrl: '',
      titleSuggestion: '',
      isValid: false,
      errorMessage: 'Format link tidak valid! Masukkan tautan YouTube, Spotify, SoundCloud, atau berkas audio langsung.'
    };
  }
}
