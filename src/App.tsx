import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TabType, RegisteredTeam, UserAccount, SiteConfig, DeletedItem, UserWallet, MatchPredictionBet, AppNotification } from './types';
import { INITIAL_FF_TEAMS, INITIAL_MLBB_TEAMS, INITIAL_SITE_CONFIG } from './data/initialData';
import { 
  subscribeToTeams, 
  subscribeToSiteConfig, 
  subscribeToBets, 
  subscribeToWallets, 
  subscribeToUserWallet,
  subscribeToNotifications,
  getUserWalletKey,
  syncTeamsToFirestore, 
  saveSiteConfigToFirestore, 
  saveBetsToFirestore, 
  saveWalletToFirestore,
  saveUserWalletToFirestore,
  registerDeviceInFirestore
} from './lib/firebaseStore';
import { triggerNativeDeviceNotification } from './lib/notificationService';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { RegistrationModal } from './components/RegistrationModal';
import { HomeView } from './components/views/HomeView';
import { DaftarSemuaTurnamenView } from './components/views/DaftarSemuaTurnamenView';
import { FreeFireView } from './components/views/FreeFireView';
import { MobileLegendsView } from './components/views/MobileLegendsView';
import { CaraDaftarView } from './components/views/CaraDaftarView';
import { AturanLengkapView } from './components/views/AturanLengkapView';
import { TimTerdaftarView } from './components/views/TimTerdaftarView';
import { InfoPertandinganView } from './components/views/InfoPertandinganView';
import { GrupKomunitasView } from './components/views/GrupKomunitasView';
import { DataLaporanView } from './components/views/DataLaporanView';
import { HubungiKamiView } from './components/views/HubungiKamiView';
import { LoginView } from './components/views/LoginView';
import { ProfilPemainView } from './components/views/ProfilPemainView';
import { AdminView } from './components/views/AdminView';
import { TotalHadiahView } from './components/views/TotalHadiahView';
import { PengumumanView } from './components/views/PengumumanView';
import { RiwayatView } from './components/views/RiwayatView';
import { StatusPembayaranView } from './components/views/StatusPembayaranView';
import { FormPendaftaranView } from './components/views/FormPendaftaranView';
import { PengaturanUmumView } from './components/views/PengaturanUmumView';
import { BantuanView } from './components/views/BantuanView';
import { ArsipView } from './components/views/ArsipView';
import { BagikanView } from './components/views/BagikanView';
import { PrediksiView } from './components/views/PrediksiView';
import { SaldoView } from './components/views/SaldoView';
import { TopUpGameView } from './components/views/TopUpGameView';
import { UnduhApkView } from './components/views/UnduhApkView';
import { DonasiView } from './components/views/DonasiView';
import { GeminiAIView } from './components/views/GeminiAIView';
import { WorkspaceView } from './components/views/WorkspaceView';
import { BridgeWebsiteView } from './components/views/BridgeWebsiteView';
import { triggerAutoBridgeSync } from './lib/websiteBridgeClient';
import { FloatingAIAssistant } from './components/FloatingAIAssistant';
import { ExitConfirmationModal } from './components/navigation/ExitConfirmationModal';
import { GlobalBackgroundMusic } from './components/audio/GlobalBackgroundMusic';
import { ThemeProvider } from './context/ThemeContext';
import { AdminQuickToolbar } from './components/admin/AdminQuickToolbar';
import { listenToGoogleAuth, isSuperAdminEmail } from './lib/googleAuth';

export default function App() {
  const [activeTab, setActiveTabInternal] = useState<TabType>('beranda');
  const [infoMatchSubTab, setInfoMatchSubTab] = useState<string>('jadwal');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [modalInitialGame, setModalInitialGame] = useState<'FF' | 'MLBB'>('FF');
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // History stack reference for reliable back navigation
  const historyStackRef = useRef<TabType[]>(['beranda']);
  const activeTabRef = useRef<TabType>(activeTab);
  activeTabRef.current = activeTab;
  const isRegisterModalOpenRef = useRef<boolean>(isRegisterModalOpen);
  isRegisterModalOpenRef.current = isRegisterModalOpen;
  const isExitModalOpenRef = useRef<boolean>(isExitModalOpen);
  isExitModalOpenRef.current = isExitModalOpen;

  // Unified tab navigation with browser history sync
  const setActiveTab = (tab: TabType) => {
    if (tab === activeTabRef.current) return;
    historyStackRef.current.push(tab);
    setActiveTabInternal(tab);
    if (typeof window !== 'undefined') {
      window.history.pushState({ tab, modal: null }, '', window.location.href);
    }
  };

  // Hardware / Browser Back button listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Seed initial history state
    if (!window.history.state || !window.history.state.tab) {
      window.history.replaceState({ tab: 'beranda', modal: null }, '', window.location.href);
    }

    const handlePopState = (e: PopStateEvent) => {
      // 1. If Register Modal is open, close modal only
      if (isRegisterModalOpenRef.current) {
        setIsRegisterModalOpen(false);
        window.history.pushState({ tab: activeTabRef.current, modal: null }, '', window.location.href);
        return;
      }

      // 2. If Exit Modal is open, close modal
      if (isExitModalOpenRef.current) {
        setIsExitModalOpen(false);
        window.history.pushState({ tab: activeTabRef.current, modal: null }, '', window.location.href);
        return;
      }

      // 3. If on a sub-page, navigate back through the history stack
      if (activeTabRef.current !== 'beranda') {
        historyStackRef.current.pop(); // Pop current
        const prevTab = historyStackRef.current.length > 0 
          ? historyStackRef.current[historyStackRef.current.length - 1] 
          : 'beranda';
        setActiveTabInternal(prevTab);
        return;
      }

      // 4. If already on Home page ('beranda'), trigger exit confirmation dialog
      setIsExitModalOpen(true);
      window.history.pushState({ tab: 'beranda', modal: 'exit-confirm' }, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Shared Central Realtime State with Firestore
  const [siteConfig, setSiteConfigInternal] = useState<SiteConfig>(INITIAL_SITE_CONFIG);
  const [registeredTeams, setRegisteredTeamsInternal] = useState<RegisteredTeam[]>([]);
  const [userWallet, setUserWalletInternal] = useState<UserWallet>({ balance: 0, topUpHistory: [], withdrawalHistory: [] });
  const [predictionBets, setPredictionBetsInternal] = useState<MatchPredictionBet[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Current logged in user account (stored locally per session)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const savedUser = localStorage.getItem('hunters_community_user');
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
    return null;
  });

  // Current active user key for wallet sync
  const activeUserKey = currentUser
    ? getUserWalletKey(currentUser.phone || currentUser.email || currentUser.username || currentUser.id)
    : 'guest_default';

  // Track seen notifications to trigger popups only on NEW incoming broadcast notifications
  const seenNotifIdsRef = useRef<Set<string>>(new Set());
  const isFirstNotifLoadRef = useRef<boolean>(true);

  // Automatic Device Registration in Firestore for Cloud Notifications
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Automatic Notification Permission Prompt
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        Notification.requestPermission().then((permission) => {
          console.log('[HUNTERS FCM] Automatic Notification Permission State:', permission);
        }).catch(err => console.warn('[HUNTERS FCM] Permission request error:', err));
      } catch (e) {
        // ignore
      }
    }

    // 2. Generate or retrieve unique device token ID
    let deviceId = localStorage.getItem('hunters_device_id');
    if (!deviceId) {
      deviceId = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('hunters_device_id', deviceId);
    }

    // 3. Register device token in Firestore
    registerDeviceInFirestore({
      deviceId,
      userPhone: currentUser?.phone || '',
      userName: currentUser?.username || currentUser?.id || '',
      platform: typeof navigator !== 'undefined' && navigator.userAgent.includes('Android') ? 'Android Mobile App / APK' : 'Web Desktop App',
      permissionGranted: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission === 'granted' : false,
      lastActive: new Date().toISOString(),
    });
  }, [currentUser]);

  // Subscribe to central Firestore Realtime Database updates
  useEffect(() => {
    const unsubTeams = subscribeToTeams((teams) => {
      setRegisteredTeamsInternal(teams);
    }, [...INITIAL_FF_TEAMS, ...INITIAL_MLBB_TEAMS]);

    const unsubConfig = subscribeToSiteConfig((config) => {
      setSiteConfigInternal(config);
    }, INITIAL_SITE_CONFIG);

    const unsubBets = subscribeToBets((bets) => {
      setPredictionBetsInternal(bets);
    });

    const unsubWallets = subscribeToUserWallet(activeUserKey, (wallet) => {
      setUserWalletInternal(wallet);
    }, { balance: 0, topUpHistory: [], withdrawalHistory: [] });

    const unsubNotifs = subscribeToNotifications((items) => {
      setNotifications(items);

      // Trigger Push Notification / Sound / Vibration on ALL Devices for NEW Broadcast Messages
      if (isFirstNotifLoadRef.current) {
        // First load: store existing notification IDs without popping up alerts for historical items
        items.forEach(item => seenNotifIdsRef.current.add(item.id));
        isFirstNotifLoadRef.current = false;
      } else {
        // Subsequent updates: find newly added broadcast notifications
        items.forEach(notif => {
          if (!seenNotifIdsRef.current.has(notif.id)) {
            seenNotifIdsRef.current.add(notif.id);

            // Check target audience match
            const isTargeted = notif.targetRole === 'all' || 
              (notif.targetRole === 'admin' && currentUser?.role === 'admin') ||
              (notif.targetPhone && currentUser?.phone && notif.targetPhone.trim() === currentUser.phone.trim());

            if (isTargeted) {
              console.log('[HUNTERS Push Notification Engine] Delivering realtime broadcast to device:', notif.title);
              triggerNativeDeviceNotification(notif.title, notif.message, notif.actionTab);
            }
          }
        });
      }
    });

    return () => {
      unsubTeams();
      unsubConfig();
      unsubBets();
      unsubWallets();
      unsubNotifs();
    };
  }, [activeUserKey, currentUser]);

  // Google OAuth Auth State Listener - Keep logged in user synced with auto Super Admin promotion
  useEffect(() => {
    const unsubAuth = listenToGoogleAuth((firebaseUser, account) => {
      if (firebaseUser && account) {
        setCurrentUser((prev) => {
          // Keep existing custom attributes if already defined
          if (prev && prev.email.toLowerCase() === account.email.toLowerCase()) {
            return {
              ...account,
              ...prev,
              role: account.isSuperAdmin ? 'admin' : prev.role,
              isSuperAdmin: account.isSuperAdmin,
            };
          }
          return account;
        });
      }
    }, siteConfig.memberAccounts);

    return () => unsubAuth();
  }, [siteConfig.memberAccounts]);

  // Central state update helpers that update local state AND write to Firestore
  const setRegisteredTeams: React.Dispatch<React.SetStateAction<RegisteredTeam[]>> = (action) => {
    setRegisteredTeamsInternal((prev) => {
      const nextTeams = typeof action === 'function' ? action(prev) : action;
      syncTeamsToFirestore(nextTeams);
      return nextTeams;
    });
  };

  const setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>> = (action) => {
    setSiteConfigInternal((prev) => {
      const nextConfig = typeof action === 'function' ? action(prev) : action;
      saveSiteConfigToFirestore(nextConfig);
      return nextConfig;
    });
  };

  const setUserWallet: React.Dispatch<React.SetStateAction<UserWallet>> = (action) => {
    setUserWalletInternal((prev) => {
      const nextWallet = typeof action === 'function' ? action(prev) : action;
      saveUserWalletToFirestore(activeUserKey, nextWallet);
      return nextWallet;
    });
  };

  const setPredictionBets: React.Dispatch<React.SetStateAction<MatchPredictionBet[]>> = (action) => {
    setPredictionBetsInternal((prev) => {
      const nextBets = typeof action === 'function' ? action(prev) : action;
      saveBetsToFirestore(nextBets);
      return nextBets;
    });
  };

  // Auto-clean expired failed teams (24 hours)
  useEffect(() => {
    if (!registeredTeams || registeredTeams.length === 0) return;

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();

    const expiredFailedTeams: RegisteredTeam[] = [];
    const validTeams: RegisteredTeam[] = [];

    registeredTeams.forEach(team => {
      if (team.status === 'Gagal') {
        const referenceTimeStr = team.failedAt || team.registeredAt;
        let refTime = new Date(referenceTimeStr).getTime();
        if (isNaN(refTime)) {
          refTime = now - ONE_DAY_MS - 1000;
        }

        if (now - refTime >= ONE_DAY_MS) {
          expiredFailedTeams.push(team);
        } else {
          validTeams.push(team);
        }
      } else {
        validTeams.push(team);
      }
    });

    if (expiredFailedTeams.length > 0) {
      setRegisteredTeams(validTeams);

      const newTrashItems: DeletedItem[] = expiredFailedTeams.map(team => ({
        id: `del-failed-team-${team.id}-${Date.now()}`,
        type: 'pendaftaran',
        title: team.teamName,
        subtitle: `${team.game === 'FF' ? '🔥 Free Fire' : '⚔️ Mobile Legends'} • Slot #${team.slotNumber} • Kapten: ${team.captainName} (${team.captainPhone}) • Status: Gagal (Otomatis Dihapus Setelah 1 Hari)`,
        deletedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
        data: team,
      }));

      setSiteConfig(prev => {
        const updatedTrash = [...newTrashItems, ...(prev.recentlyDeleted || [])];
        return { ...prev, recentlyDeleted: updatedTrash };
      });
    }
  }, [registeredTeams]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('hunters_community_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('hunters_community_user');
      }
    } catch (e) {
      console.error('Failed to save user to localStorage', e);
    }
  }, [currentUser]);

  const handleLogin = (account: UserAccount) => {
    setCurrentUser(account);
  };

  const handleUpdateUser = (updatedAccount: UserAccount) => {
    setCurrentUser(updatedAccount);
    try {
      localStorage.setItem('hunters_community_user', JSON.stringify(updatedAccount));
    } catch (e) {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('beranda');
  };

  const handleOpenRegisterModal = (game?: 'FF' | 'MLBB') => {
    if (game) setModalInitialGame(game);
    setActiveTab('form-pendaftaran');
  };

  const handleAddTeam = (newTeam: RegisteredTeam) => {
    setRegisteredTeams(prev => [newTeam, ...prev]);

    // Real-time automatic bridge dispatch to connected website
    if (newTeam.paymentProofUrl) {
      triggerAutoBridgeSync(
        siteConfig,
        'BUKTI_PEMBAYARAN',
        `Bukti Transfer Pendaftaran Tim: ${newTeam.teamName} (${newTeam.game})`,
        {
          teamName: newTeam.teamName,
          game: newTeam.game,
          captainName: newTeam.captainName,
          captainPhone: newTeam.captainPhone,
          paymentProofUrl: newTeam.paymentProofUrl,
          paymentMethod: newTeam.paymentMethod,
          paymentAmount: newTeam.paymentAmount,
          status: newTeam.status,
          registeredAt: newTeam.registeredAt || new Date().toISOString(),
        },
        'image/jpeg'
      );
    }
    triggerAutoBridgeSync(
      siteConfig,
      'FILE_DATA',
      `Data Pendaftaran Tim Baru: ${newTeam.teamName}`,
      newTeam,
      'application/json'
    );
  };

  // Dynamic Atmosphere Colors:
  // 1. 🏠 BERANDA (#6366f1) | 2. 🏆 TURNAMEN (#f59e0b) | 3. 👥 TIM (#10b981) | 4. 💰 SALDO (#ef4444) | 5. ⚙️ LAINNYA (#8b5cf6)
  const getTabTheme = (tab: TabType) => {
    if (tab === 'beranda') {
      return {
        color: '#6366f1',
        bgGradient: 'radial-gradient(ellipse 85% 85% at 50% -15%, rgba(99, 102, 241, 0.18), rgba(6, 2, 14, 0.98))',
      };
    }
    if (['ff', 'mlbb', 'info-match', 'total-hadiah', 'riwayat', 'arsip', 'form-pendaftaran'].includes(tab)) {
      return {
        color: '#f59e0b',
        bgGradient: 'radial-gradient(ellipse 85% 85% at 50% -15%, rgba(245, 158, 11, 0.16), rgba(12, 6, 2, 0.98))',
      };
    }
    if (['tim', 'cara-daftar', 'aturan', 'status-pembayaran'].includes(tab)) {
      return {
        color: '#10b981',
        bgGradient: 'radial-gradient(ellipse 85% 85% at 50% -15%, rgba(16, 185, 129, 0.16), rgba(2, 12, 8, 0.98))',
      };
    }
    if (['saldo', 'prediksi', 'topup-game', 'donasi'].includes(tab)) {
      return {
        color: '#ef4444',
        bgGradient: 'radial-gradient(ellipse 85% 85% at 50% -15%, rgba(239, 68, 68, 0.16), rgba(15, 2, 4, 0.98))',
      };
    }
    return {
      color: '#8b5cf6',
      bgGradient: 'radial-gradient(ellipse 85% 85% at 50% -15%, rgba(139, 92, 246, 0.18), rgba(8, 2, 18, 0.98))',
    };
  };

  const currentTheme = getTabTheme(activeTab);

  return (
    <ThemeProvider>
      <div 
        className="min-h-screen bg-[#06020c] text-white font-sans selection:bg-purple-600 selection:text-white flex flex-col relative"
        style={{
          background: currentTheme.bgGradient,
          transition: 'background 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        {/* HEADER (BARIS 1 & BARIS 2 UNIFIED) */}
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenRegisterModal={handleOpenRegisterModal} 
          currentUser={currentUser}
          notifications={notifications}
          tickerText={siteConfig.tickerText}
          onSelectInfoMatchSubTab={(subTab) => {
            setActiveTab('info-match');
            setInfoMatchSubTab(subTab);
          }}
        />

      {/* MAIN CONTAINER CONTENT WITH LIQUID PAGE TRANSITIONS (0.4s CUBIC-BEZIER) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.985 }}
            transition={{
              duration: 0.38,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full"
          >
            {activeTab === 'beranda' && (
          <HomeView 
            setActiveTab={setActiveTab} 
            onOpenRegisterModal={handleOpenRegisterModal} 
            registeredTeams={registeredTeams}
            ffInfo={siteConfig.ffInfo}
            mlbbInfo={siteConfig.mlbbInfo}
            communityGroups={siteConfig.communityGroups}
            adminWa={siteConfig.adminWa || siteConfig.contactInfo?.adminWa}
            homeConfig={siteConfig.homeConfig}
            currentUser={currentUser}
            isAdmin={currentUser?.role === 'admin' || currentUser?.isSuperAdmin}
            userWallet={userWallet}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
          />
        )}

        {activeTab === 'prediksi' && (
          <PrediksiView 
            schedules={siteConfig.matchSchedules || []}
            userWallet={userWallet}
            setUserWallet={setUserWallet}
            bets={predictionBets}
            setBets={setPredictionBets}
            setActiveTab={setActiveTab}
            qrisNmid={siteConfig.qrisNmid}
            qrisImageUrl={siteConfig.qrisImageUrl}
            adminWa={siteConfig.adminWa || siteConfig.contactInfo?.adminWa}
            initialSubTab={infoMatchSubTab}
          />
        )}

        {activeTab === 'saldo' && (
          <SaldoView 
            userWallet={userWallet}
            setUserWallet={setUserWallet}
            setActiveTab={setActiveTab}
            qrisNmid={siteConfig.qrisNmid || siteConfig.paymentConfig?.qrisNmid}
            qrisImageUrl={siteConfig.qrisImageUrl || siteConfig.paymentConfig?.qrisImageUrl}
            adminWa={siteConfig.adminWa || siteConfig.contactInfo?.adminWa}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
            initialSubTab={infoMatchSubTab}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'login' && (
          <LoginView 
            currentUser={currentUser}
            onLogin={handleLogin}
            onLogout={handleLogout}
            setActiveTab={setActiveTab}
            siteConfig={siteConfig}
          />
        )}

        {activeTab === 'profil' && (
          <ProfilPemainView 
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            registeredTeams={registeredTeams}
            userWallet={userWallet}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
            setActiveTab={setActiveTab}
            onOpenRegisterModal={handleOpenRegisterModal}
            onSelectInfoMatchSubTab={(subTab) => {
              setInfoMatchSubTab(subTab);
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView 
            currentUser={currentUser}
            registeredTeams={registeredTeams}
            setRegisteredTeams={setRegisteredTeams}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
            userWallet={userWallet}
            setUserWallet={setUserWallet}
            bets={predictionBets}
            setBets={setPredictionBets}
          />
        )}

        {activeTab === 'semua-turnamen' && (
          <DaftarSemuaTurnamenView
            siteConfig={siteConfig}
            registeredTeams={registeredTeams}
            setActiveTab={setActiveTab}
            onOpenRegisterModal={handleOpenRegisterModal}
            onSelectInfoMatchSubTab={(subTab) => {
              setInfoMatchSubTab(subTab);
            }}
          />
        )}

        {activeTab === 'ff' && (
          <FreeFireView 
            onOpenRegisterModal={handleOpenRegisterModal} 
            teams={registeredTeams}
            ffInfo={siteConfig.ffInfo}
            ffRules={siteConfig.ffRules}
          />
        )}

        {activeTab === 'mlbb' && (
          <MobileLegendsView 
            onOpenRegisterModal={handleOpenRegisterModal} 
            teams={registeredTeams}
            mlbbInfo={siteConfig.mlbbInfo}
            mlbbRules={siteConfig.mlbbRules}
          />
        )}

        {activeTab === 'total-hadiah' && (
          <TotalHadiahView 
            setActiveTab={setActiveTab}
            onOpenRegisterModal={handleOpenRegisterModal}
            ffInfo={siteConfig.ffInfo}
            mlbbInfo={siteConfig.mlbbInfo}
            prizePoolConfig={siteConfig.prizePoolConfig}
            adminWa={siteConfig.adminWa || siteConfig.contactInfo?.adminWa}
            isAdmin={currentUser?.role === 'admin' || currentUser?.isSuperAdmin}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
          />
        )}

        {activeTab === 'pengumuman' && (
          <PengumumanView 
            announcements={siteConfig.announcements}
            setActiveTab={setActiveTab}
            isAdmin={currentUser?.role === 'admin' || currentUser?.isSuperAdmin}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
          />
        )}

        {activeTab === 'riwayat' && (
          <RiwayatView 
            pastWinners={siteConfig.pastWinners}
            setActiveTab={setActiveTab}
            isAdmin={currentUser?.role === 'admin'}
          />
        )}

        {activeTab === 'status-pembayaran' && (
          <StatusPembayaranView 
            registeredTeams={registeredTeams}
            setRegisteredTeams={setRegisteredTeams}
            setActiveTab={setActiveTab}
            isAdmin={currentUser?.role === 'admin'}
          />
        )}

        {activeTab === 'form-pendaftaran' && (
          <FormPendaftaranView 
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
            registeredTeams={registeredTeams}
            setRegisteredTeams={setRegisteredTeams}
            setActiveTab={setActiveTab}
            isAdmin={currentUser?.role === 'admin'}
            initialGame={modalInitialGame}
          />
        )}

        {activeTab === 'pengaturan-umum' && (
          <PengaturanUmumView 
            siteConfig={siteConfig}
            setActiveTab={setActiveTab}
            isAdmin={currentUser?.role === 'admin'}
          />
        )}

        {activeTab === 'bantuan' && (
          <BantuanView 
            siteConfig={siteConfig}
            setActiveTab={setActiveTab}
            isAdmin={currentUser?.role === 'admin'}
          />
        )}

        {activeTab === 'arsip' && (
          <ArsipView 
            siteConfig={siteConfig}
            pastWinners={siteConfig.pastWinners}
            setActiveTab={setActiveTab}
            isAdmin={currentUser?.role === 'admin'}
          />
        )}

        {activeTab === 'topup-game' && (
          <TopUpGameView
            siteConfig={siteConfig}
            isAdmin={currentUser?.role === 'admin' || currentUser?.isSuperAdmin}
            setActiveTab={setActiveTab}
            onUpdateTopUpUrl={(newUrl) => {
              setSiteConfig((prev) => ({
                ...prev,
                topUpGameUrl: newUrl
              }));
            }}
          />
        )}

        {activeTab === 'unduh-apk' && (
          <UnduhApkView
            siteConfig={siteConfig}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'donasi' && (
          <DonasiView
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
            currentUser={currentUser}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'gemini-ai' && (
          <GeminiAIView
            siteConfig={siteConfig}
            registeredTeams={registeredTeams}
            onOpenRegisterModal={() => handleOpenRegisterModal()}
          />
        )}

        {activeTab === 'workspace-google' && (
          <WorkspaceView
            currentUser={currentUser}
            siteConfig={siteConfig}
            onUpdateUser={handleUpdateUser}
          />
        )}

        {activeTab === 'bridge-website' && (
          <BridgeWebsiteView
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
            registeredTeams={registeredTeams}
            isAdmin={currentUser?.role === 'admin' || currentUser?.isSuperAdmin}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'bagikan' && (
          <BagikanView 
            siteConfig={siteConfig}
            setActiveTab={setActiveTab}
            isAdmin={currentUser?.role === 'admin' || currentUser?.isSuperAdmin}
            registeredTeams={registeredTeams}
          />
        )}

        {activeTab === 'cara-daftar' && (
          <CaraDaftarView 
            onOpenRegisterModal={() => handleOpenRegisterModal()} 
            qrisNmid={siteConfig.qrisNmid}
            qrisImageUrl={siteConfig.qrisImageUrl}
            adminWa={siteConfig.adminWa || siteConfig.contactInfo?.adminWa}
            adminWaClean={siteConfig.adminWaClean || siteConfig.contactInfo?.adminWaClean}
            ewalletNumber={siteConfig.ewalletNumber}
            ewalletHolder={siteConfig.ewalletHolder}
            bankBcaNumber={siteConfig.bankBcaNumber}
            bankBcaHolder={siteConfig.bankBcaHolder}
          />
        )}

        {activeTab === 'aturan' && (
          <AturanLengkapView 
            ffRules={siteConfig.ffRules}
            mlbbRules={siteConfig.mlbbRules}
            isAdmin={currentUser?.role === 'admin' || currentUser?.isSuperAdmin}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
          />
        )}

        {activeTab === 'tim' && (
          <TimTerdaftarView 
            teams={registeredTeams} 
            onOpenRegisterModal={handleOpenRegisterModal} 
          />
        )}

        {activeTab === 'info-match' && (
          <InfoPertandinganView 
            schedules={siteConfig.matchSchedules}
            pastWinners={siteConfig.pastWinners}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
            registeredTeams={registeredTeams}
            setActiveTab={setActiveTab}
            initialSubTab={infoMatchSubTab}
            isAdmin={currentUser?.role === 'admin' || currentUser?.isSuperAdmin}
          />
        )}

        {activeTab === 'grup' && (
          <GrupKomunitasView 
            communityGroups={siteConfig.communityGroups}
            isAdmin={currentUser?.role === 'admin' || currentUser?.isSuperAdmin}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
          />
        )}

        {activeTab === 'laporan' && (
          <DataLaporanView />
        )}

        {activeTab === 'kontak' && (
          <HubungiKamiView 
            adminWa={siteConfig.adminWa || siteConfig.contactInfo?.adminWa}
            adminWaClean={siteConfig.adminWaClean || siteConfig.contactInfo?.adminWaClean}
            officialEmail={siteConfig.officialEmail || siteConfig.contactInfo?.officialEmail}
            officialDomain={siteConfig.officialDomain || siteConfig.contactInfo?.officialDomain}
            setActiveTab={setActiveTab}
            isAdmin={currentUser?.role === 'admin' || currentUser?.isSuperAdmin}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
          />
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* REGISTRATION FORM MODAL */}
      <RegistrationModal 
        isOpen={isRegisterModalOpen}
        initialGame={modalInitialGame}
        onClose={() => setIsRegisterModalOpen(false)}
        onAddTeam={handleAddTeam}
        qrisNmid={siteConfig.qrisNmid}
        qrisImageUrl={siteConfig.qrisImageUrl}
        adminWa={siteConfig.adminWa || siteConfig.contactInfo?.adminWa}
        adminWaClean={siteConfig.adminWaClean || siteConfig.contactInfo?.adminWaClean}
        ewalletNumber={siteConfig.ewalletNumber}
        ewalletHolder={siteConfig.ewalletHolder}
        bankBcaNumber={siteConfig.bankBcaNumber}
        bankBcaHolder={siteConfig.bankBcaHolder}
      />

      {/* EXIT CONFIRMATION MODAL ON ANDROID/BROWSER BACK AT HOME */}
      <ExitConfirmationModal
        isOpen={isExitModalOpen}
        onCancel={() => setIsExitModalOpen(false)}
        onConfirmExit={() => {
          setIsExitModalOpen(false);
          try {
            if (typeof window !== 'undefined') {
              window.history.go(-2);
            }
          } catch (e) {}
        }}
      />

      {/* FLOATING QUICK AI ASSISTANT */}
      <FloatingAIAssistant onNavigateToTab={setActiveTab} />

      {/* GLOBAL PERSISTENT BACKGROUND MUSIC PLAYER & FLOATING WIDGET */}
      <GlobalBackgroundMusic siteConfig={siteConfig} />

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSelectInfoMatchSubTab={(subTab) => {
          setInfoMatchSubTab(subTab);
          setActiveTab('info-match');
        }}
        currentUser={currentUser}
        onOpenRegisterModal={(game) => {
          setModalInitialGame(game || 'FF');
          setIsRegisterModalOpen(true);
        }}
      />

      {/* FLOATING DIRECT ADMIN QUICK DOCK */}
      <AdminQuickToolbar
        isAdmin={currentUser?.role === 'admin' || currentUser?.isSuperAdmin === true}
        siteConfig={siteConfig}
        setSiteConfig={setSiteConfig}
        registeredTeams={registeredTeams}
        setRegisteredTeams={setRegisteredTeams}
        onNavigateToAdmin={() => setActiveTab('admin')}
      />
    </div>
    </ThemeProvider>
  );
}

