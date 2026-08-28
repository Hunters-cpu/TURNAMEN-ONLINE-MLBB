import { SiteConfig, WebsiteBridgeLog } from '../types';
import { uploadToCentralizedStorage } from './storageBridge1TB';

export interface BridgeSendResponse {
  success: boolean;
  httpStatus?: number;
  message: string;
  latencyMs: number;
  targetUrl: string;
  timestamp: string;
  responseBody?: any;
}

/**
 * Ping / Test handshake to target website URL via backend API
 */
export async function testTargetWebsiteConnection(
  targetUrl: string,
  secretKey?: string
): Promise<BridgeSendResponse> {
  try {
    const res = await fetch('/api/bridge/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl, secretKey }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Gagal menghubungi server proxy bridge lokal',
      latencyMs: 0,
      targetUrl,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Send real media, video, payment proof, or data files directly to target website
 */
export async function sendPayloadToDestinationWebsite(params: {
  targetUrl: string;
  secretKey?: string;
  type: 'FOTO_MEDIA' | 'VIDEO' | 'BUKTI_PEMBAYARAN' | 'FILE_DATA' | 'AUTO_DISPATCH';
  typeLabel?: string;
  itemName: string;
  fileType?: string;
  fileSize?: string;
  payload: any;
}): Promise<BridgeSendResponse> {
  try {
    const res = await fetch('/api/bridge/send-payload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Gagal mengirim payload ke website tujuan',
      latencyMs: 0,
      targetUrl: params.targetUrl,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Fetch latest bridge transmission logs from backend
 */
export async function fetchBridgeLogs(): Promise<WebsiteBridgeLog[]> {
  try {
    const res = await fetch('/api/bridge/logs');
    const data = await res.json();
    return data.logs || [];
  } catch (err) {
    console.warn('Failed to fetch bridge logs:', err);
    return [];
  }
}

/**
 * Clear bridge logs in backend
 */
export async function clearBackendBridgeLogs(): Promise<boolean> {
  try {
    const res = await fetch('/api/bridge/clear-logs', { method: 'POST' });
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.warn('Failed to clear bridge logs:', err);
    return false;
  }
}

/**
 * Automatically dispatch events to connected website if auto-sync is enabled
 */
export async function triggerAutoBridgeSync(
  siteConfig: SiteConfig,
  type: 'FOTO_MEDIA' | 'VIDEO' | 'BUKTI_PEMBAYARAN' | 'FILE_DATA',
  itemName: string,
  payloadData: any,
  fileType?: string,
  fileSize?: string
): Promise<void> {
  const bridge = siteConfig.bridgeConfig;
  if (!bridge || !bridge.isEnabled || !bridge.targetWebsiteUrl || !bridge.targetWebsiteUrl.trim()) {
    return;
  }

  // Check specific auto-send category flags
  if (type === 'BUKTI_PEMBAYARAN' && bridge.autoSendPaymentProof === false) return;
  if (type === 'FOTO_MEDIA' && bridge.autoSendPhotosMedia === false) return;
  if (type === 'VIDEO' && bridge.autoSendVideos === false) return;
  if (type === 'FILE_DATA' && bridge.autoSendFilesData === false) return;

  const typeLabels: Record<string, string> = {
    BUKTI_PEMBAYARAN: 'Auto-Sync Bukti Pembayaran',
    FOTO_MEDIA: 'Auto-Sync Foto/Media',
    VIDEO: 'Auto-Sync Rekaman Video',
    FILE_DATA: 'Auto-Sync Berkas & Database',
  };

  try {
    console.log(`[BRIDGE-AUTODISPATCH] Transmitting ${type} (${itemName}) to ${bridge.targetWebsiteUrl}...`);
    await sendPayloadToDestinationWebsite({
      targetUrl: bridge.targetWebsiteUrl,
      secretKey: bridge.secretKey,
      type,
      typeLabel: typeLabels[type] || 'Auto-Sync Dispatch',
      itemName,
      fileType,
      fileSize,
      payload: payloadData,
    });

    // Also archive to 1 TB centralized cloud storage
    await uploadToCentralizedStorage(
      {
        name: itemName,
        size: fileSize ? parseInt(fileSize) || 1024 : 1024,
        type: fileType || 'application/json',
      },
      {
        category: type === 'FOTO_MEDIA' ? 'photo' : type === 'BUKTI_PEMBAYARAN' ? 'photo' : type === 'VIDEO' ? 'video' : 'document',
        description: `Arsip Otomatis ${itemName} via Bridge Sync`,
      }
    );
  } catch (e) {
    console.warn('[BRIDGE-AUTODISPATCH-ERROR]', e);
  }
}
