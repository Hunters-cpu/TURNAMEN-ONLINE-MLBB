import { DeviceInfo } from '../types';

export function detectDevice(): DeviceInfo {
  const ua = navigator.userAgent || '';
  let deviceType: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';
  
  if (/iPad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    deviceType = 'Mobile';
  } else if (navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && /Macintosh/.test(ua)) {
    deviceType = 'Tablet'; // iPad Pro detect
  }

  // OS Detection
  let os = 'Unknown OS';
  if (/Windows NT 10.0/i.test(ua)) os = 'Windows 11/10';
  else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1';
  else if (/Windows NT 6.1/i.test(ua)) os = 'Windows 7';
  else if (/Android/i.test(ua)) {
    const match = ua.match(/Android\s([0-9\.]+)/);
    os = match ? `Android ${match[1]}` : 'Android OS';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    const match = ua.match(/OS\s([0-9_]+)/);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
  } else if (/Mac OS X/i.test(ua)) {
    os = 'macOS';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux OS';
  }

  // Browser Detection
  let browser = 'Browser';
  if (/Edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Google Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Apple Safari';
  else if (/Firefox/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  const screenRes = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '1920x1080';
  const notifPerm = typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';

  // Generate stable deviceId stored in localStorage
  let deviceId = '';
  try {
    deviceId = localStorage.getItem('hunters_device_id') || '';
    if (!deviceId) {
      deviceId = `DEV-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      localStorage.setItem('hunters_device_id', deviceId);
    }
  } catch (e) {
    deviceId = `DEV-${Date.now()}`;
  }

  return {
    deviceId,
    deviceType,
    os,
    browser,
    screenRes,
    userAgent: ua,
    lastLogin: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    isNotificationEnabled: notifPerm === 'granted',
    notificationPermission: notifPerm,
  };
}

export async function requestBrowserNotificationPermission(): Promise<'granted' | 'denied' | 'default'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    alert('⚠️ Perangkat/Browser Anda belum mendukung Notifikasi Web Native. Notifikasi in-app tetap akan aktif.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      try {
        new Notification('🔔 Notifikasi Perangkat Aktif!', {
          body: 'Perangkat Anda berhasil terhubung ke sistem pengumuman HUNTERS COMMUNITY & DEXZ STORE.',
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.log('Native notification trigger failed', e);
      }
    }
    return permission;
  } catch (e) {
    console.error('Error requesting notification permission', e);
    return 'denied';
  }
}

export function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    console.log('Audio playback prevented by browser policy', e);
  }
}
