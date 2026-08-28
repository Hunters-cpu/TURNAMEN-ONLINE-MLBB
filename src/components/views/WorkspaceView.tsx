import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Calendar, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Clock, 
  Plus, 
  Sparkles, 
  User, 
  ShieldCheck,
  CalendarCheck,
  Inbox,
  ArrowRight,
  BellRing
} from 'lucide-react';
import { 
  listGmailMessages, 
  sendGmailEmail, 
  listCalendarEvents, 
  addEventToGoogleCalendar, 
  GmailMessageItem, 
  GoogleCalendarEventItem 
} from '../../lib/workspaceServices';
import { getCachedGoogleAccessToken, signInWithGoogleOAuth, isSuperAdminEmail } from '../../lib/googleAuth';
import { UserAccount, SiteConfig, MatchSchedule } from '../../types';

interface WorkspaceViewProps {
  currentUser: UserAccount | null;
  siteConfig: SiteConfig;
  onUpdateUser?: (updated: UserAccount) => void;
  initialTab?: 'gmail' | 'calendar';
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  currentUser,
  siteConfig,
  initialTab = 'gmail'
}) => {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'gmail' | 'calendar'>(initialTab);
  const [accessToken, setAccessToken] = useState<string | null>(getCachedGoogleAccessToken());
  const [isConnecting, setIsConnecting] = useState(false);

  // Gmail states
  const [emails, setEmails] = useState<GmailMessageItem[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [emailSearchQuery, setEmailSearchQuery] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  // Compose email modal / form
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('🏆 Info Resmi Turnamen Hunters Community');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSendSuccess, setEmailSendSuccess] = useState<string | null>(null);
  const [emailSendError, setEmailSendError] = useState<string | null>(null);

  // Calendar states
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEventItem[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [calendarSuccess, setCalendarSuccess] = useState<string | null>(null);
  const [isSyncingAllMatches, setIsSyncingAllMatches] = useState(false);

  // Custom Calendar Event Modal
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('🔥 Match Turnamen Hunters Community');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('19:30');
  const [eventDesc, setEventDesc] = useState('Jadwal pertandingan turnamen resmi Hunters Community.');

  // Check token on mount or update
  useEffect(() => {
    const token = getCachedGoogleAccessToken();
    setAccessToken(token);
    if (token) {
      if (activeWorkspaceTab === 'gmail') {
        loadGmailMessages(token);
      } else {
        loadCalendarEvents(token);
      }
    }
  }, [activeWorkspaceTab]);

  const handleReconnectGoogle = async () => {
    try {
      setIsConnecting(true);
      const res = await signInWithGoogleOAuth(siteConfig.memberAccounts);
      if (res?.accessToken) {
        setAccessToken(res.accessToken);
        if (activeWorkspaceTab === 'gmail') {
          loadGmailMessages(res.accessToken);
        } else {
          loadCalendarEvents(res.accessToken);
        }
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        console.warn('Reconnect notice:', err?.message || err);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const loadGmailMessages = async (token: string) => {
    try {
      setIsLoadingEmails(true);
      setEmailError(null);
      const msgs = await listGmailMessages(token, emailSearchQuery);
      setEmails(msgs);
    } catch (err: any) {
      setEmailError(err.message || 'Gagal memuat pesan Gmail.');
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const loadCalendarEvents = async (token: string) => {
    try {
      setIsLoadingCalendar(true);
      setCalendarError(null);
      const evts = await listCalendarEvents(token);
      setCalendarEvents(evts);
    } catch (err: any) {
      setCalendarError(err.message || 'Gagal memuat Google Calendar.');
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  // Mandatory Confirmation Dialog for sending email
  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRecipient.trim() || !emailSubject.trim() || !emailBody.trim()) {
      setEmailSendError('Penerima, subjek, dan isi email wajib diisi.');
      return;
    }

    // Explicit confirmation dialog as mandated by skill
    const confirmed = window.confirm(
      `Konfirmasi Pengiriman Email via Gmail API:\n\nKepada: ${emailRecipient.trim()}\nSubjek: ${emailSubject.trim()}\n\nApakah Anda yakin ingin mengirim email ini sekarang?`
    );
    if (!confirmed) return;

    try {
      setIsSendingEmail(true);
      setEmailSendError(null);
      setEmailSendSuccess(null);

      const token = accessToken || getCachedGoogleAccessToken();
      if (!token) throw new Error('Akses token Google tidak tersedia. Silakan hubungkan ulang akun Google.');

      const formattedHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111827; color: #f3f4f6; border-radius: 16px; overflow: hidden; border: 1px solid #374151;">
          <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">HUNTERS COMMUNITY</h1>
            <p style="color: #fef3c7; margin: 4px 0 0 0; font-size: 13px;">Pusat Turnamen Esports Free Fire & Mobile Legends</p>
          </div>
          <div style="padding: 24px; font-size: 15px; line-height: 1.6; color: #e5e7eb;">
            <h2 style="color: #fbbf24; margin-top: 0; font-size: 18px;">${emailSubject}</h2>
            <div style="white-space: pre-wrap; margin: 16px 0;">${emailBody}</div>
            <hr style="border: 0; border-top: 1px solid #374151; margin: 24px 0;" />
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              Pesan ini dikirim secara resmi melalui sistem terintegrasi <b>Hunters Community × DEXZ STORE</b> via Google Gmail API.
            </p>
          </div>
        </div>
      `;

      await sendGmailEmail(token, emailRecipient.trim(), emailSubject.trim(), formattedHtml);
      setEmailSendSuccess(`✅ Email resmi berhasil terkirim ke ${emailRecipient}!`);
      setEmailBody('');
      setTimeout(() => {
        setShowComposeModal(false);
        setEmailSendSuccess(null);
        if (token) loadGmailMessages(token);
      }, 2000);
    } catch (err: any) {
      setEmailSendError(err.message || 'Gagal mengirim email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Mandatory Confirmation Dialog for single event
  const handleAddCalendarEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmed = window.confirm(
      `Konfirmasi Tambah ke Google Calendar:\n\nAcara: ${eventTitle}\nTanggal: ${eventDate} pukul ${eventTime} WIB\n\nTambahkan ke kalender akun Google Anda?`
    );
    if (!confirmed) return;

    try {
      setCalendarError(null);
      setCalendarSuccess(null);
      const token = accessToken || getCachedGoogleAccessToken();
      if (!token) throw new Error('Akses token Google tidak tersedia.');

      const startDateTime = new Date(`${eventDate}T${eventTime}:00+07:00`).toISOString();
      const endDateTime = new Date(new Date(`${eventDate}T${eventTime}:00+07:00`).getTime() + 60 * 60 * 1000).toISOString();

      await addEventToGoogleCalendar(token, {
        title: eventTitle,
        description: eventDesc,
        startIso: startDateTime,
        endIso: endDateTime,
      });

      setCalendarSuccess(`✅ Acara "${eventTitle}" berhasil ditambahkan ke Google Calendar Anda!`);
      setShowAddEventModal(false);
      loadCalendarEvents(token);
    } catch (err: any) {
      setCalendarError(err.message || 'Gagal menambahkan acara ke kalender.');
    }
  };

  // Sync All Match Schedules into user's Google Calendar with Confirmation
  const handleSyncAllSchedulesToCalendar = async () => {
    const schedules = siteConfig.matchSchedules || [];
    if (schedules.length === 0) {
      alert('Belum ada jadwal pertandingan yang tersedia untuk disinkronkan.');
      return;
    }

    const confirmed = window.confirm(
      `Konfirmasi Sinkronisasi Jadwal:\n\nApakah Anda ingin menambahkan ${schedules.length} jadwal pertandingan turnamen (Free Fire & MLBB) ke Google Calendar resmi Anda?\n\nPengingat otomatis 30 menit sebelum match akan diaktifkan.`
    );
    if (!confirmed) return;

    try {
      setIsSyncingAllMatches(true);
      setCalendarError(null);
      setCalendarSuccess(null);
      const token = accessToken || getCachedGoogleAccessToken();
      if (!token) throw new Error('Akses token Google tidak tersedia.');

      let count = 0;
      for (const match of schedules) {
        try {
          // Parse date or construct ISO
          const now = new Date();
          const startIso = new Date(now.getTime() + (count + 1) * 24 * 60 * 60 * 1000).toISOString();
          const endIso = new Date(new Date(startIso).getTime() + 60 * 60 * 1000).toISOString();

          await addEventToGoogleCalendar(token, {
            title: `🏆 [${match.game}] ${match.teamA || 'Tim A'} VS ${match.teamB || 'Tim B'} - ${match.phase}`,
            description: `Pertandingan ${match.game === 'FF' ? 'Free Fire' : 'Mobile Legends'} Babak ${match.phase}.\nJadwal: ${match.date} ${match.time}\nRoom: ${match.roomId || 'Diumumkan di App'}\nPassword: ${match.roomPassword || '***'}`,
            startIso,
            endIso,
          });
          count++;
        } catch (e) {
          console.warn('Single schedule sync error:', e);
        }
      }

      setCalendarSuccess(`🎉 Berhasil menyinkronkan ${count} jadwal pertandingan ke Google Calendar Anda!`);
      loadCalendarEvents(token);
    } catch (err: any) {
      setCalendarError(err.message || 'Gagal menyinkronkan jadwal.');
    } finally {
      setIsSyncingAllMatches(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
                  Layanan Google Workspace
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Resmi OAuth2
                </span>
              </div>
              <p className="text-xs md:text-sm text-neutral-400 max-w-2xl leading-relaxed">
                Terhubung langsung dengan <b>Gmail API</b> dan <b>Google Calendar API</b> untuk menerima notifikasi turnamen, mengirim konfirmasi slot tim, dan mengelola jadwal match secara otomatis.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!accessToken ? (
              <button
                onClick={handleReconnectGoogle}
                disabled={isConnecting}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer transition-all disabled:opacity-50"
              >
                {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Hubungkan Ulang Google</span>
              </button>
            ) : (
              <div className="px-4 py-2.5 rounded-2xl bg-neutral-800/80 border border-emerald-500/30 flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-neutral-200">
                  {currentUser?.email || 'Google Terhubung'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 mt-6 pt-5 border-t border-neutral-800/80">
          <button
            onClick={() => setActiveWorkspaceTab('gmail')}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
              activeWorkspaceTab === 'gmail'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>📧 Gmail Hub ({emails.length} Pesan)</span>
          </button>

          <button
            onClick={() => setActiveWorkspaceTab('calendar')}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
              activeWorkspaceTab === 'calendar'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>📅 Google Calendar Match</span>
          </button>
        </div>
      </div>

      {/* GMAIL TAB */}
      {activeWorkspaceTab === 'gmail' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-center gap-3 flex-1">
              <input
                type="text"
                value={emailSearchQuery}
                onChange={(e) => setEmailSearchQuery(e.target.value)}
                placeholder="Cari pesan di Gmail (contoh: Hunters, turnamen, invoice)..."
                className="w-full max-w-md px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => accessToken && loadGmailMessages(accessToken)}
                disabled={isLoadingEmails || !accessToken}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEmails ? 'animate-spin' : ''}`} />
                <span>Segarkan</span>
              </button>
            </div>

            <button
              onClick={() => setShowComposeModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Email Turnamen</span>
            </button>
          </div>

          {emailError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{emailError}</span>
            </div>
          )}

          {isLoadingEmails ? (
            <div className="py-16 text-center text-neutral-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs">Mengambil pesan dari akun Gmail resmi...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="py-16 text-center text-neutral-500 bg-neutral-900/40 rounded-3xl border border-neutral-800/80 p-8">
              <Inbox className="w-12 h-12 mx-auto text-neutral-600 mb-3" />
              <h4 className="text-sm font-bold text-neutral-300 mb-1">Tidak Ada Pesan Ditemukan</h4>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Belum ada email terbaru atau filter pencarian tidak cocok. Anda dapat mengirim email resmi turnamen menggunakan tombol di atas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {emails.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-2xl bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-white truncate max-w-xs">
                          {msg.from || 'Pengirim Gmail'}
                        </span>
                        {msg.labels?.map((label) => (
                          <span key={label} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
                            {label}
                          </span>
                        ))}
                      </div>
                      <h4 className="text-xs font-bold text-amber-300 mt-1 truncate">
                        {msg.subject}
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">
                        {msg.snippet}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-neutral-500 block">
                      {msg.date ? new Date(msg.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                    </span>
                    <a
                      href={`https://mail.google.com/mail/u/0/#inbox/${msg.threadId || msg.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-bold mt-1"
                    >
                      <span>Buka di Gmail</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GOOGLE CALENDAR TAB */}
      {activeWorkspaceTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => accessToken && loadCalendarEvents(accessToken)}
                disabled={isLoadingCalendar || !accessToken}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCalendar ? 'animate-spin' : ''}`} />
                <span>Segarkan Kalender</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setShowAddEventModal(true)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all border border-neutral-700"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Tambah Acara Manual</span>
              </button>

              <button
                onClick={handleSyncAllSchedulesToCalendar}
                disabled={isSyncingAllMatches || !accessToken}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-50"
              >
                {isSyncingAllMatches ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CalendarCheck className="w-3.5 h-3.5" />}
                <span>Sinkronkan Semua Match ke Google Calendar</span>
              </button>
            </div>
          </div>

          {calendarError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{calendarError}</span>
            </div>
          )}

          {calendarSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{calendarSuccess}</span>
            </div>
          )}

          {/* List of Calendar Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {calendarEvents.length === 0 && !isLoadingCalendar ? (
              <div className="col-span-full py-16 text-center text-neutral-500 bg-neutral-900/40 rounded-3xl border border-neutral-800/80 p-8">
                <Calendar className="w-12 h-12 mx-auto text-neutral-600 mb-3" />
                <h4 className="text-sm font-bold text-neutral-300 mb-1">Belum Ada Acara Kalender</h4>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  Klik tombol <b>"Sinkronkan Semua Match ke Google Calendar"</b> di atas untuk menambahkan jadwal turnamen secara otomatis ke kalender resmi Anda.
                </p>
              </div>
            ) : (
              calendarEvents.map((evt, idx) => (
                <div
                  key={evt.id || idx}
                  className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/30 transition-all flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        Google Calendar Event
                      </span>
                      <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        {evt.start?.dateTime ? new Date(evt.start.dateTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Sepanjang Hari'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-2">
                      {evt.summary}
                    </h4>
                    {evt.description && (
                      <p className="text-xs text-neutral-400 mt-1 whitespace-pre-wrap line-clamp-3">
                        {evt.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">
                      {evt.start?.dateTime ? new Date(evt.start.dateTime).toLocaleDateString('id-ID', { dateStyle: 'full' }) : evt.start?.date}
                    </span>
                    {evt.htmlLink && (
                      <a
                        href={evt.htmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-bold"
                      >
                        <span>Lihat di Calendar</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* COMPOSE EMAIL MODAL */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Kirim Email Resmi via Gmail
                </h3>
              </div>
              <button
                onClick={() => setShowComposeModal(false)}
                className="text-neutral-400 hover:text-white text-xs font-bold px-2.5 py-1 rounded-lg bg-neutral-800"
              >
                ✕ Tutup
              </button>
            </div>

            <form onSubmit={handleSendEmailSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                  Email Penerima (Kapten / Member)
                </label>
                <input
                  type="email"
                  required
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="contoh: kapten.squad@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                  Subjek Email
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Subjek email..."
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                  Isi Pesan / Pengumuman Turnamen
                </label>
                <textarea
                  rows={6}
                  required
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Tulis detail jadwal match, room ID & password, atau konfirmasi slot sah turnamen..."
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none font-sans"
                />
              </div>

              {emailSendError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {emailSendError}
                </div>
              )}

              {emailSendSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  {emailSendSuccess}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
                >
                  {isSendingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Kirim Email Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CALENDAR EVENT MODAL */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Tambah Jadwal ke Google Calendar
                </h3>
              </div>
              <button
                onClick={() => setShowAddEventModal(false)}
                className="text-neutral-400 hover:text-white text-xs font-bold px-2.5 py-1 rounded-lg bg-neutral-800"
              >
                ✕ Tutup
              </button>
            </div>

            <form onSubmit={handleAddCalendarEventSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                  Nama Acara / Pertandingan
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Jam (WIB)
                  </label>
                  <input
                    type="time"
                    required
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                  Catatan / Keterangan Match
                </label>
                <textarea
                  rows={3}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider"
                >
                  Simpan ke Google Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
