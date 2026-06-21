export type Language = 'id' | 'en';

export interface TranslationSchema {
  settings: string;
  settingsSub: string;
  appearance: string;
  darkMode: string;
  darkModeSub: string;
  notifications: string;
  notificationsApp: string;
  notificationsSub: string;
  collection: string;
  favorites: string;
  favoritesSub: (count: number) => string;
  dataPrivacy: string;
  resetData: string;
  resetDataSub: string;
  aboutApp: string;
  aboutAppSub: string;
  language: string;
  languageSub: string;
  faq: string;
  faqSub: string;
  back: string;
  darkModeOn: string;
  darkModeOff: string;
  filterSemua: string;
  filterMakanan: string;
  filterMinuman: string;
  faqTitle: string;
  faqItems: Array<{q: string; a: string}>;
  aboutTitle: string;
  aboutDescription: string;
  features: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  feature4Title: string;
  feature4Desc: string;
  contactTitle: string;
  contactSub: string;
  contactAgentTitle: string;
  contactAgentSub: string;
  contactAgentButton: string;
  supportTitle: string;
  supportWaiting: string;
  supportWaitingDesc: string;
  supportConnected: string;
  supportEnded: string;
  supportPlaceholder: string;
  supportCancel: string;
  supportEndChat: string;
  supportConfirmEnd: string;
  supportAgentName: string;
  supportUserTitle: string;
  supportConnectConfirm: string;
  supportConnectNow: string;
  copyright: string;
  aboutFeedDescription: string;
  home: string;
  search: string;
  bot: string;
  setelan: string;
  terserah: string;
  spinWheel: string;
  dashboardHalo: string;
  dashboardGreetingMorning: string;
  dashboardGreetingLunch: string;
  dashboardGreetingAfternoon: string;
  dashboardGreetingDinner: string;
  dashboardGreetingNight: string;
  dashboardGreetingMidnight: string;
  dashboardBannerTitle: string;
  categories: Record<string, string>;
  dashboardBannerSubtitle: (count: number) => string;
  dashboardSectionRecommended: string;
  dashboardSectionRecommendedSub: string;
  dashboardSectionTrending: string;
  dashboardSeeAll: string;
  searchTitle: string;
  searchPlaceholder: string;
  searchResults: string;
  searchRecommended: string;
  searchFound: (count: number) => string;
  searchNotFound: string;
  searchNotFoundSub: string;
  searchReset: string;
  searchBranch: (count: number) => string;
  chatHeader: string;
  chatStatus: string;
  chatHistory: string;
  chatEmpty: string;
  chatHistoryNoteTitle: string;
  chatHistoryNote: string;
  chatNewChat: string;
  chatPesan: string;
  chatIntro: string;
  chatPlaceholder: string;
  chatLimit: string;
  chatMaintenance: string;
  chatThinking: string;
  chatChessDiscovery: string;
  chatPlayChess: string;
  favoritesTitle: string;
  favoritesScreenSub: string;
  favoritesEmpty: string;
  favoritesEmptySub: string;
  favoritesExplore: string;
  detailReviews: string;
  detailWhy: string;
  detailBranches: string;
  detailViewLocation: string;
  detailRandomize: string;
  detailShareText: (name: string, desc: string) => string;
  detailDownloadApp: string;
  detailCopied: string;
  randomTitle: string;
  randomSub: string;
  randomButton: string;
  randomLoading: string;
  randomDetail: string;
  randomSkip: string;
  randomSpin: string;
  randomSuccessAdd: string;
  randomActionTitle: string;
  randomAddToSpin: string;
  randomSpinNow: (count: number) => string;
  randomClose: string;
  randomAjaDeh: string;
  randomAIPick: string;
  randomStartSearch: string;
  randomGo: string;
  randomTryAgain: string;
  spinTitle: string;
  spinSub: string;
  spinList: string;
  spinAdd: string;
  spinInputPlaceholder: string;
  spinDelete: string;
  spinButton: string;
  spinResult: string;
  spinGreeting: string;
  spinTap: string;
  spinMinPilihan: string;
  spinPlaceholder: string;
  spinWinner: string;
  spinChosen: string;
  spinMantap: string;
  spinRemoveWinner: string;
  spinShuffle: string;
  spinDeleteAll: string;
  spinCongrats: (name: string) => string;
  resetTitle: string;
  resetSub: string;
  resetWarning: string;
  resetAll: string;
  resetFav: string;
  resetChat: string;
  resetNote: string;
  resetDelete: string;
  resetDataLabel: string;
  resetSuccessAll: string;
  resetSuccessFav: string;
  resetSuccessChat: string;
  newFeatureBadge: string;
  resetConfirmTitle: string;
  resetConfirmSub: (type: string) => string;
  resetCancel: string;
  resetYes: string;
  resetFavDB: string;
  resetChatDB: string;
  resetAllData: string;
  resetAllChat: string;
  resetAllFav: string;
  resetStored: string;
  resetItem: string;
  resetSession: string;
  resetWarningDetailed: string;
  splashLoading: string;
  splashFinish: string;
  splashSubtitle: string;
  onboarding: Array<{title: string; desc: string; icon: string}>;
  onboardingNext: string;
  onboardingStart: string;
  shortFeed: string;
  feedBetaInfo: string;
  feedPreparing: string;
  feedError: string;
  feedErrorSub: string;
  feedFinishedTitle: string;
  feedFinishedDesc: (count: number) => string;
  feedFinishedButton: string;
  watchInTikTok: string;
  feedStatusPlaying: string;
  feedStatusPaused: string;
  feedUploadVideo: string;
  feedRestrictedAccess: string;
  feedLoginTitle: string;
  feedLoginDesc: string;
  feedLoginButton: string;
  feedUploadSuccessTitle: string;
  feedUploadSuccessDesc: string;
  feedSelectFile: string;
  feedMax50MB: string;
  feedDeleteReplace: string;
  feedTikTokLink: string;
  feedPostButton: string;
  feedTryAgain: string;
  feedOpenLink: string;
  feedLike: string;
  feedComment: string;
  feedKomentarTitle: string;
  feedNoComments: string;
  feedWriteComment: string;
  feedDeleting: string;
  feedDeleteVideo: string;
  feedDeleteConfirm: string;
  feedDeleteSuccess: string;
  feedLoginToLike: string;
  feedLoginToDelete: string;
  feedNoPermissionDelete: string;
  feedPosting: string;
  feedLoading: string;
  feedPostNow: string;
  feedUploading: (progress: number) => string;
  feedCancellingUpload: string;
  feedAuthChecking: string;
  feedPostNote: (name: string) => string;
  feedSource: string;
  feedSourcePlaceholder: string;
  feedSourceMatchRule: string;
  feedHome: string;
  feedProfile: string;
  feedLoginPromptTitle: string;
  feedLoginPromptDesc: string;
  feedMaybeLater: string;
  feedDeleteAccountWarning: string;
  feedDeleteAccountSuccess: string;
  feedDeleteAccountError: (msg: string) => string;
  feedFollowers: string;
  feedFollowing: string;
  feedView: string;
  feedNoList: string;
  feedSend: string;
  feedSwitchAccount: string;
  feedActive: string;
  feedAddAccount: string;
  feedEditProfile: string;
  feedLikeHistory: string;
  feedWatchHistory: string;
  feedLogout: string;
  feedDeleteAccountPermanent: string;
  feedUsername: string;
  feedSelectAvatarPrompt: string;
  feedSaveChanges: string;
  feedVideosYouLiked: string;
  feedLastViewed: string;
  feedNoData: string;
  feedMyVideos: string;
  feedVideosBy: (name: string) => string;
  feedFollowingState: string;
  feedUnfollow: string;
  feedFollow: string;
  feedProfileIdentityDesc: string;
  feedNameEmpty: string;
  feedProfileUpdated: (name: string) => string;
  feedProfileSaveError: string;
  feedSyncError: (msg: string) => string;
  feedVideoTooLarge: string;
  feedInvalidTikTok: string;
  feedSupabaseNotConfigured: string;
  feedUploadError: (msg: string) => string;
  feedUploadRLSNote: string;
  feedEmpty: string;
  feedSupabaseRLSWarning: string;
  feedSupabaseRLSDesc: string;
  feedSupabaseRLSFix: string;
  feedGuestPrompt: string;
  feedStatusGuest: string;
  feedReloadFeed: string;
  feedScrollToReload: string;
  feedLoadingMore: string;
  feedGlobalComments: string;
  feedReply: string;
  feedNoCommentsAlt: string;
  feedFirstCommentPrompt: string;
  feedAddCommentPlaceholder: string;
  feedManualRefresh: string;
  feedDeleteErrorInternal: string;
  feedDeleteErrorGeneric: (msg: string) => string;
  uploadNext: string;
  uploadBack: string;
  uploadSetThumbnail: string;
  uploadUseDefaultThumbnail: string;
  uploadCaptureFrame: string;
  uploadCaptureHint: string;
  uploadStatusVideo: string;
  uploadStatusThumb: string;
  uploadStatusDB: string;
  uploadComplete: string;
  uploadSourcePlaceholder: string;
  uploadSourceLabel: string;
  uploadStep1Title: string;
  uploadStep2Title: string;
  feedSwitchingTo: (email: string) => string;
  feedSessionExpired: string;
  feedSwitchAccountError: string;
  feedGuestName: string;
  feedSupabaseConfigPrompt: string;
  feedLoginError: (msg: string) => string;
  feedLogoutConfirm: string;
  feedLogoutSuccess: string;
  feedDefaultUserName: string;
  feedSpeed: string;
  feedThumbnailPreview: string;
  feedThumbnailSliderHint: string;
  feedThumbnailAutoHint: string;
  feedAutoFrame: string;
  feedCustomFrame: string;
  feedThumbnailVideo: string;
  feedThumbnailUpload: string;
  loginGoogle: string;
  loginGuest: string;
  loginLoggingIn: string;
  loginTitle: string;
  loginSub: string;
  roleTitle: string;
  roleSub: string;
  roleUser: string;
  roleUserDesc: string;
  roleMerchant: string;
  roleMerchantDesc: string;
  onboardTitle: string;
  onboardSub: string;
  onboardName: string;
  onboardUsername: string;
  onboardSubmit: string;
  onboardSaving: string;
  onboardPhotoError: string;
  onboardCropTitle: string;
  onboardCropSave: string;
  onboardCancel: string;
  onboardPhotoFail: string;
  onboardFail: string;
  onboardUsernameTaken: string;
  onboardErrorTitle: string;
  onboardRetry: string;
  onboardLogout: string;
  reportTitle: string;
  reportCategory: string;
  reportName: string;
  reportEmail: string;
  reportExplanation: string;
  reportSend: string;
  reportSending: string;
  reportSuccess: string;
  reportError: string;
  reportPlaceholderName: string;
  reportPlaceholderEmail: string;
  reportPlaceholderDetail: string;
  reportBug: string;
  reportAccount: string;
  reportOther: string;
  reportProcessed: string;
  reportSelectCategory: string;
  feedBetaTag: string;
  commentSuccess: string;
  loginSuccessTitle: string;
  creator: string;
  feedOfflineModeTag: string;
  feedOfflineModalTitle: string;
  feedOfflineModalDesc: string;
  feedSwitchMode: string;
  feedSwitchTitle: string;
  feedSwitchOnline: string;
  feedSwitchOffline: string;
  feedSwitchDesc: string;
  feedTitleLabel: string;
  feedDescriptionLabel: string;
  feedOptional: string;
  feedActionSheetTitle: string;
  feedActionEdit: string;
  feedActionDelete: string;
  feedActionSource: string;
}

export const translations: Record<Language, TranslationSchema> = {
  id: {
    settings: "Setelan",
    // ... (skipping some lines for brevity in instruction, will provided full in replacement)
    settingsSub: "Atur pengalaman kulinermu",
    appearance: "Tampilan",
    darkMode: "Mode Gelap",
    darkModeSub: "Ubah tema aplikasi",
    notifications: "Notifikasi",
    notificationsApp: "Notifikasi Aplikasi",
    notificationsSub: "Update makanan hits Malang",
    collection: "Koleksi",
    favorites: "Favorit Saya",
    favoritesSub: (count: number) => `${count} makanan yang kamu sukai`,
    dataPrivacy: "Data & Privasi",
    resetData: "Reset Data",
    resetDataSub: "Hapus history chat & favorit",
    aboutApp: "Tentang Aplikasi",
    aboutAppSub: "Informasi lengkap tentang Terserah App",
    newFeatureBadge: "NEW",
    language: "Bahasa",
    languageSub: "Pilih bahasa aplikasi",
    faq: "Bantuan & FAQ",
    faqSub: "Panduan lengkap penggunaan aplikasi",
    back: "Kembali",
    darkModeOn: "Mode Gelap",
    darkModeOff: "Mode Terang",
    filterSemua: "Semua",
    filterMakanan: "Makanan",
    filterMinuman: "Minuman",
    faqTitle: "Pusat Bantuan",
    faqItems: [
      {
        q: "Apa itu fitur 'Terserah'?",
        a: "Fitur ini membantu Anda memilih makanan saat bingung. AI akan mengacak daftar makanan berdasarkan waktu (pagi/siang/malam) dan preferensi Anda."
      },
      {
        q: "Bagaimana cara kerja Filter di Terserah?",
        a: "Filter memungkinkan Anda membatasi hasil acakan. Pilih 'Makanan' jika hanya ingin menu berat, 'Minuman' untuk yang segar-segar, atau 'Semua' untuk campuran keduanya."
      },
      {
        q: "Apa kegunaan ChatBot 'Terserah AI'?",
        a: "ChatBot adalah asisten pribadi Anda. Anda bisa bertanya seperti 'Rekomendasi makanan pedas di Soehat' atau 'Minuman yang enak buat sore hari'. Ia akan memberikan saran menu beserta detailnya."
      },
      {
        q: "Apa itu fitur 'Kuliner Feed'?",
        a: "Fitur Feed adalah platform berbagi video pendek kuliner Malang. Anda bisa melihat video rekomendasi dari pengguna lain untuk referensi visual makanan yang ingin dicoba."
      },
      {
        q: "Bagaimana cara upload video di Feed?",
        a: "Untuk upload, Anda harus masuk/login akun Google terlebih dahulu. Klik tombol '+' di menu Feed. Masukkan video kuliner (maks 50MB) dan berikan link sumber video yang sesuai."
      },
      {
        q: "Apa aturan upload di Feed?",
        a: "Anda wajib mencantumkan 'Link Sumber Video' yang asli dan sesuai dengan video yang Anda upload. Tidak diperbolehkan menggunakan link dari sumber video yang berbeda."
      }
    ],
    aboutTitle: "Tentang Terserah App",
    aboutDescription: "Terserah App adalah solusi cerdas untuk dilema 'Makan apa ya hari ini?'. Kami menghadirkan katalog lengkap kuliner khas Malang dengan sentuhan teknologi AI untuk memudahkan pencarian Anda.",
    aboutFeedDescription: "Update Terbaru: Kami menghadirkan fitur Kuliner Feed di mana Anda bisa melihat rekomendasi makanan lewat video pendek yang diupload komunitas.",
    features: "Fitur Aplikasi",
    feature1Title: "Rekomendasi AI",
    feature1Desc: "Saran makanan pintar berdasarkan waktu dan lokasi Anda saat ini.",
    feature2Title: "Randomizer Menu",
    feature2Desc: "Pengacak menu instan untuk menentukan pilihan makananmu.",
    feature3Title: "Spin Wheel",
    feature3Desc: "Roda keberuntungan untuk menentukan pilihan yang lebih seru.",
    feature4Title: "Koleksi Favorit",
    feature4Desc: "Simpan daftar kuliner impian Anda untuk dikunjungi nanti.",
    contactTitle: "Hubungi Agent Sekarang",
    contactSub: "Chat langsung dengan tim kami",
    contactAgentTitle: "Hubungi Agent Sekarang",
    contactAgentSub: "Chat langsung dengan tim kami untuk bantuan instan.",
    contactAgentButton: "MULAI CHAT SEKARANG",
    supportTitle: "Live Agent Chat",
    supportWaiting: "Menghubungkan ke Agent...",
    supportWaitingDesc: "Harap tunggu sebentar, tim kami akan segera melayani Kakak.",
    supportConnected: "Terhubung dengan Agent",
    supportEnded: "Sesi Chat Berakhir",
    supportPlaceholder: "Ketik pesan...",
    supportCancel: "Batalkan Permintaan",
    supportEndChat: "Akhiri Chat",
    supportConfirmEnd: "Apakah Kakak yakin ingin mengakhiri sesi chat ini?",
    supportAgentName: "Agent Terserah",
    supportUserTitle: "Butuh Bantuan?",
    supportConnectConfirm: "Kakak akan dihubungkan dengan agent live kami. Siap untuk chat?",
    supportConnectNow: "YA, CHAT SEKARANG",
    copyright: "© 2026 Tim Terserah. Malang, Indonesia.",
    home: "Beranda",
    search: "Cari",
    bot: "ASISTEN",
    setelan: "Setelan",
    terserah: "Terserah",
    spinWheel: "Spin Wheel",
    dashboardHalo: "Selamat Datang & Welcome 👋",
    dashboardGreetingMorning: "🌅 Makan pagi yuk bestie!",
    dashboardGreetingLunch: "☀️ Waktunya makan siang!",
    dashboardGreetingAfternoon: "🌤️ Cemilan sore yuk~",
    dashboardGreetingDinner: "🌑 Waktunya makan malam, bestie!",
    dashboardGreetingNight: "🌙 Makan malam dulu~",
    dashboardGreetingMidnight: "🌃 Laper tengah malam?",
    dashboardBannerTitle: "Rekomendasi Hari Ini",
    categories: {
      "Semua": "Semua",
      "Mie": "Mie",
      "Nasi": "Nasi",
      "Bakso": "Bakso",
      "Soto": "Soto",
      "Ayam": "Ayam",
      "Pedas": "Pedas",
      "Nasgor": "Nasi Goreng",
      "Seafood": "Seafood",
      "Bebek": "Bebek",
      "Sate": "Sate",
      "Rawon": "Rawon",
      "Pecel": "Pecel",
      "Es/Cold": "Es/Cold",
      "Kopi": "Kopi",
      "Boba": "Boba",
      "Ramen": "Ramen",
      "Korean": "Korean",
      "Western": "Western",
      "Sarapan": "Sarapan",
      "Malam": "Malam",
      "Rice Box": "Rice Box",
      "Lalapan": "Lalapan",
      "Bakar": "Bakar",
      "Goreng": "Goreng",
      "Berkuah": "Berkuah",
      "UMKM": "UMKM"
    },
    dashboardBannerSubtitle: (count: number) => `${count} lokasi di Malang`,
    dashboardSectionRecommended: "Cocok Buat Sekarang",
    dashboardSectionRecommendedSub: "Andalan Malang 🕐",
    dashboardSectionTrending: "Lagi Trending 🔥",
    dashboardSeeAll: "Lihat Semua",
    searchTitle: "Cari Kuliner",
    searchPlaceholder: "Mau makan apa hari ini?",
    searchResults: "Hasil Pencarian",
    searchRecommended: "Rekomendasi Buat Kamu",
    searchFound: (count: number) => `${count} ditemukan`,
    searchNotFound: "Yah, tidak ketemu...",
    searchNotFoundSub: "Coba cari kata kunci lain atau hapus filter.",
    searchReset: "Reset Pencarian",
    searchBranch: (count: number) => `${count} Cabang`,
    chatHeader: "ASISTEN",
    chatStatus: "Online & Siap Membantu",
    chatHistory: "Riwayat Chat",
    chatEmpty: "Belum ada riwayat chat.",
    chatHistoryNoteTitle: "Pemberitahuan Penting",
    chatHistoryNote: "Aplikasi hanya menyimpan 10 percakapan terakhir. Percakapan lama akan dihapus secara otomatis dan permanen.",
    chatNewChat: "Percakapan Baru",
    chatPesan: "pesan",
    chatIntro: "Halo bestie! Lagi bingung mau makan apa atau butuh rekomendasi kuliner hits di Malang? Chat aku yuk, aku siap bantu cari menu paling mantap buat kamu hari ini!",
    chatPlaceholder: "Tanya apa saja...",
    chatLimit: "Waduh kak, asisten AI sedang istirahat sejenak karena terlalu banyak yang tanya (Limit Capai). Coba lagi beberapa saat lagi ya! 🙏",
    chatMaintenance: "Semua jalur sedang sibuk atau limit tercapai. Silakan coba lagi nanti ya kak! 🛠️",
    chatThinking: "Berfikir...",
    chatChessDiscovery: "♟️ Wah, kamu menemukan **Secret Game**! 🎉 Ini adalah permainan tersembunyi yang hanya bisa dimainkan di sini — bisa online maupun offline! Klik tombol di bawah untuk mulai bermain:",
    chatPlayChess: "MAIN CATUR",
    favoritesTitle: "Favorit Saya",
    favoritesScreenSub: "Koleksi makanan pilihanmu",
    favoritesEmpty: "Belum ada favorit!",
    favoritesEmptySub: "Klik ikon hati di detail makanan untuk menyimpan makanan yang kamu sukai di sini.",
    favoritesExplore: "Cari Makanan",
    detailReviews: "ulasan",
    detailWhy: "Kenapa Harus Coba?",
    detailBranches: "Lokasi Cabang",
    detailViewLocation: "Lihat Lokasi",
    detailRandomize: "Ganti Makanan Lain",
    detailShareText: (name: string, desc: string) => `${name}\n\nWuih! Cek kuliner mantap di Malang: ${name}. ${desc}`,
    detailDownloadApp: "Kunjungi website kami untuk informasi lebih lanjut.",
    detailCopied: "Link disalin ke clipboard!",
    randomTitle: "Rekomendasi Terserah",
    randomSub: "Bingung mau makan apa? Biar kami yang pilihin buat kamu!",
    randomButton: "Acak Makanan",
    randomLoading: "Tunggu sebentar...",
    randomDetail: "Lihat Detail",
    randomSkip: "Lewati",
    randomSpin: "Spin Wheel",
    randomSuccessAdd: "Berhasil ditambahkan!",
    randomActionTitle: "Pilih aksi untuk daftar makananmu:",
    randomAddToSpin: "TAMBAH KE SPIN WHEEL",
    randomSpinNow: (count: number) => `SPIN SEKARANG (${count})`,
    randomClose: "TUTUP",
    randomAjaDeh: "Terserah Aja Deh!",
    randomAIPick: "Serahkan nasib perutmu di sini!",
    randomStartSearch: "MULAI CARI!",
    randomGo: "Gaskeun!",
    randomTryAgain: "Coba Lagi",
    spinTitle: "Spin Wheel",
    spinSub: "Tentukan nasib kulinermu dengan roda keberuntungan!",
    spinList: "Daftar Pilihan",
    spinAdd: "Tambah Pilihan",
    spinInputPlaceholder: "Masukkan nama makanan...",
    spinDelete: "Hapus",
    spinButton: "PUTAR RODA",
    spinResult: "Hasil:",
    spinGreeting: "Roda Keberuntungan",
    spinTap: "Tap roda untuk memutar",
    spinMinPilihan: "Tambahkan minimal 2 pilihan makanan untuk mulai memutar roda!",
    spinPlaceholder: "Tulis nama makanan...",
    spinWinner: "Pemenangnya Adalah!",
    spinChosen: "Roda keberuntungan telah memilih:",
    spinMantap: "MANTAP!",
    spinRemoveWinner: "Hapus Pilihan Ini",
    spinShuffle: "Shuffle",
    spinDeleteAll: "Hapus Semua",
    spinCongrats: (name: string) => `Mantap! Kamu dapet: ${name}`,
    resetTitle: "Reset Data",
    resetSub: "Kelola database penyimpanan aplikasi kamu.",
    resetWarning: "Gawat!",
    resetAll: "Hapus Semua Data",
    resetFav: "Database Favorit",
    resetChat: "History ChatBot",
    resetNote: "Semua data akan dihapus permanen.",
    resetDelete: "Hapus",
    resetDataLabel: "data",
    resetSuccessAll: "Seluruh data (History Chat & Favorit) telah dihapus secara permanen!",
    resetSuccessFav: "Database Favorit telah dihapus secara permanen!",
    resetSuccessChat: "History ChatBot telah dihapus secara permanen!",
    resetConfirmTitle: "Konfirmasi Hapus",
    resetConfirmSub: (type: string) => `Apakah Anda yakin ingin menghapus ${type} secara permanen? Tindakan ini tidak dapat dibatalkan.`,
    resetCancel: "Batal",
    resetYes: "Ya, Hapus",
    resetFavDB: "Database Favorit",
    resetChatDB: "History ChatBot",
    resetAllData: "SELURUH data aplikasi",
    resetAllChat: "semua history chat",
    resetAllFav: "semua favorit",
    resetStored: "tersimpan",
    resetItem: "item",
    resetSession: "sesi",
    resetWarningDetailed: "Hati-hati! Menghapus data di sini akan menghilangkan data tersebut secara permanen dari perangkat Anda.",
    splashLoading: "Mencari menu terbaik...",
    splashFinish: "Siap Berangkat!",
    splashSubtitle: "Kuliner Malang untuk semua suasana 🍜",
    onboarding: [
      {
        title: "Pencarian Cerdas AI",
        desc: "Dapatkan saran menu terbaik yang disesuaikan dengan waktu dan seleramu secara instan.",
        icon: "Sparkles"
      },
      {
        title: "Terserah Randomizer",
        desc: "Bingung pilih menu? Biar kami yang pilihkan secara acak dengan satu ketukan!",
        icon: "Dice5"
      },
      {
        title: "Tonton Kuliner Feed",
        desc: "Lihat visual makanan lewat video-video pendek dari komunitas kuliner Malang.",
        icon: "PlayCircle"
      },
      {
        title: "Simpan Favoritmu",
        desc: "Kumpulkan daftar makanan impianmu dan jangan sampai ada yang terlewatkan.",
        icon: "Heart"
      }
    ],
    onboardingNext: "Lanjut",
    onboardingStart: "Mulai Sekarang",
    shortFeed: "Kuliner Feed",
    feedBetaInfo: "Fitur Kuliner Feed sedang dalam tahap Beta Testing. Masih ditemukan beberapa bug. Mohon bantuannya untuk melaporkan kendala melalui menu Pengaturan di Profil Anda.",
    feedPreparing: "Menyiapkan Feed",
    feedError: "Video Gagal Dimuat",
    feedErrorSub: "Silakan periksa koneksi internet Anda atau coba lagi beberapa saat lagi",
    feedFinishedTitle: "Feed Habis!",
    feedFinishedDesc: (count: number) => `Kamu sudah menonton semua ${count} feed terbaru. Scroll lagi untuk acak ulang atau klik tombol di bawah!`,
    feedFinishedButton: "Putar Lagi (Random)",
    watchInTikTok: "Sumber Video",
    feedStatusPlaying: "Memutar",
    feedStatusPaused: "Jeda",
    feedUploadVideo: "Upload Video",
    feedRestrictedAccess: "Akses Terbatas",
    feedLoginTitle: "LOGIN GOOGLE DULU YUK!",
    feedLoginDesc: "Kakak perlu login menggunakan Google untuk menjaga keamanan komunitas dan agar video kulinermu bisa dikelola.",
    feedLoginButton: "LOGIN DENGAN GOOGLE",
    feedUploadSuccessTitle: "BERHASIL DIPOSTING!",
    feedUploadSuccessDesc: "Selesai! Video kulinermu sudah terupload secara global. Kembali ke beranda...",
    feedSelectFile: "Pilih File Video",
    feedMax50MB: "Maksimal 50MB",
    feedDeleteReplace: "Hapus & Ganti",
    feedTikTokLink: "(Link Sumber Video)",
    feedPostButton: "POSTING KULINER",
    feedTryAgain: "COBA LAGI",
    feedOpenLink: "BUKA LINK VIDEO",
    feedLike: "Suka",
    feedComment: "Komen",
    feedKomentarTitle: "KOMENTAR",
    feedNoComments: "Belum ada komentar. Jadilah yang pertama!",
    feedWriteComment: "Tulis komentar kulinermu...",
    feedDeleting: "Menghapus video...",
    feedDeleteVideo: "Hapus Video",
    feedDeleteConfirm: "Hapus video kulinermu ini secara PERMANEN dari server global? \n\nHal ini tidak bisa dibatalkan.",
    feedDeleteSuccess: "Video Berhasil Dihapus Permanen!",
    feedLoginToLike: "Kamu harus login untuk menyukai video.",
    feedLoginToDelete: "Kamu harus login untuk menghapus video.",
    feedNoPermissionDelete: "Maaf kak, hanya pemilik video yang bisa menghapus kulinernya sendiri.",
    feedPosting: "Posting...",
    feedLoading: "MEMUAT FEED...",
    feedPostNow: "POST SEKARANG",
    feedUploading: (progress: number) => `MENGUNGGAH... ${progress}%`,
    feedCancellingUpload: "Membatalkan upload...",
    feedAuthChecking: "Memeriksa identitas...",
    feedPostNote: (name: string) => `Postingan kamu akan langsung muncul secara global dengan nama profile: @${name}`,
    feedHome: "Beranda",
    feedProfile: "Profil",
    feedLoginPromptTitle: "SIAP BERBAGI KULINER?",
    feedLoginPromptDesc: "Masuk dengan Google untuk menyukai video, memberikan komentar global, dan mengikuti kreator kuliner favoritmu.",
    feedMaybeLater: "MUNGKIN NANTI",
    feedDeleteAccountWarning: "⚠️ PERINGATAN KERAS! ⚠️\n\nMenghapus akun akan melakukan hal berikut:\n1. SEMUA video yang pernah Kakak upload akan dihapus permanen dari server.\n2. Profil Kakak (nama, avatar) akan dihapus secara global.\n3. Riwayat komentar dan daftar followers/following akan hilang.\n4. Akun Kakak akan dikeluarkan secara paksa.\n\nTindakan ini TIDAK BISA DIBATALKAN. Kakak yakin mau hapus akun?",
    feedDeleteAccountSuccess: "✅ DATA BERHASIL DIHAPUS! Sampai jumpa lagi!",
    feedDeleteAccountError: (msg: string) => `Gagal hapus akun: ${msg}`,
    feedFollowers: "Pengikut",
    feedFollowing: "Mengikuti",
    feedView: "Lihat",
    feedNoList: "Belum ada daftar",
    feedSend: "Kirim",
    feedSwitchAccount: "Pindah Akun",
    feedActive: "Aktif",
    feedAddAccount: "Tambah Akun Lain",
    feedEditProfile: "Edit Profile",
    feedLikeHistory: "Riwayat Suka",
    feedWatchHistory: "Riwayat Tonton",
    feedLogout: "Keluar",
    feedDeleteAccountPermanent: "Hapus Akun Permanen",
    feedUsername: "Nama Pengguna",
    feedSelectAvatarPrompt: "Masukkan URL gambar profile baru kakak:",
    feedSaveChanges: "SIMPAN PERUBAHAN",
    feedVideosYouLiked: "Video yang kamu sukai",
    feedLastViewed: "Terakhir dilihat",
    feedNoData: "Belum ada data",
    feedMyVideos: "Video Saya",
    feedVideosBy: (name: string) => `Video @${name}`,
    feedFollowingState: "Mengikuti",
    feedUnfollow: "Berhenti Mengikuti",
    feedFollow: "Ikuti",
    feedProfileIdentityDesc: "Identitas profil kulinermu secara global di aplikasi Terserah.",
    feedNameEmpty: "Nama tidak boleh kosong kak!",
    feedProfileUpdated: (name: string) => `🎉 Profil Kakak "${name}" berhasil diperbarui!`,
    feedProfileSaveError: "Gagal simpan profil",
    feedSyncError: (msg: string) => `Ups! Gagal sinkron ke server: ${msg}`,
    feedVideoTooLarge: "Video terlalu besar! Maksimal 50MB ya kak.",
    feedInvalidTikTok: "Masukkan link sumber video yang valid!",
    feedSupabaseNotConfigured: "Supabase belum dikonfigurasi kak.",
    feedUploadError: (msg: string) => `Gagal upload: ${msg}`,
    feedUploadRLSNote: "\n\nKRN KAKAK PAKAI LOGIN GOOGLE, COBA CEK INI DI SUPABASE:\n1. Klik Policy 'INSERT' tadi.\n2. Pastikan 'Target Roles' adalah 'authenticated' DAN 'anon' (pilih dua-duanya).\n3. Pastikan 'UPDATE' juga dikasih izin yang sama jika error berlanjut.\n4. Pastikan 'SELECT' juga dikasih ke 'anon' & 'authenticated'.",
    feedEmpty: "Feed Kosong...",
    feedSupabaseRLSWarning: "⚠️ MASALAH IZIN SUPABASE (RLS)",
    feedSupabaseRLSDesc: "Saat login, Supabase butuh izin SELECT untuk role authenticated. Kelihatannya Kakak baru kasih izin ke anon saja.",
    feedSupabaseRLSFix: "FIX: Tambahkan Role 'authenticated' di Policy SELECT Storage Kakak!",
    feedGuestPrompt: "Coba klik tombol segarkan untuk memuat video.",
    feedStatusGuest: "Status: Guest Mode",
    feedReloadFeed: "RELOAD FEED ACAK",
    feedScrollToReload: "Scroll Lagi Untuk Reload",
    feedLoadingMore: "Memuat Ulang...",
    feedGlobalComments: "Komentar Global",
    feedReply: "Balas",
    feedNoCommentsAlt: "Tidak ada komentar",
    feedFirstCommentPrompt: "Jadilah yang pertama memberikan komentar global!",
    feedAddCommentPlaceholder: "Tambah komentar global...",
    feedManualRefresh: "Segarkan Manual",
    feedDeleteErrorInternal: "Gagal menghapus: Identitas file tidak ditemukan.",
    feedDeleteErrorGeneric: (msg: string) => `Gagal hapus video: ${msg}`,
    uploadNext: "Selanjutnya",
    uploadBack: "Kembali",
    uploadSetThumbnail: "Set Thumbnail Sendiri",
    uploadUseDefaultThumbnail: "Gunakan Default Thumbnail",
    uploadCaptureFrame: "Tangkap Frame",
    uploadCaptureHint: "Pilih tampilan thumbnail terbaik dari video kamu",
    uploadStatusVideo: "Mengupload video...",
    uploadStatusThumb: "Mengupload thumbnail...",
    uploadStatusDB: "Menyimpan data ke Supabase...",
    uploadComplete: "Upload selesai",
    uploadSourcePlaceholder: "Tempel link sumber video, contoh: TikTok/Instagram/YouTube",
    uploadSourceLabel: "Link Sumber Video",
    uploadStep1Title: "STEP 1: PILIH VIDEO & LINK SUMBER",
    uploadStep2Title: "STEP 2: SET THUMBNAIL, JUDUL, DESKRIPSI",
    feedSwitchingTo: (email: string) => `Mengalihkan ke ${email}...`,
    feedSessionExpired: "Sesi kedaluwarsa, silakan login ulang.",
    feedSwitchAccountError: "Gagal beralih akun.",
    feedGuestName: "Belum Login",
    feedSupabaseConfigPrompt: "Konfigurasi Supabase dulu ya kak di settings!",
    feedLoginError: (msg: string) => `Gagal Login: ${msg}`,
    feedLogoutConfirm: "Kakak yakin ingin keluar dari akun Kuliner ini?",
    feedLogoutSuccess: "Berhasil keluar akun!",
    feedDefaultUserName: "User Kuliner",
    feedSource: "Sumber Video",
    feedSourcePlaceholder: "Link TikTok/IG/dll",
    feedSourceMatchRule: "Link sumber video wajib di isi sesuai video yang anda upload.",
    feedSpeed: "2x CEPAT",
    feedThumbnailPreview: "Preview Thumbnail",
    feedThumbnailSliderHint: "Geser untuk pilih tampilan thumbnail",
    feedThumbnailAutoHint: "Thumbnail akan otomatis terpilih sesuai posisi slider",
    feedAutoFrame: "THUMBNAIL",
    feedCustomFrame: "CUSTOM",
    feedThumbnailVideo: "PAKAI THUMBNAIL VIDEO",
    feedThumbnailUpload: "UPLOAD GAMBAR",
    loginGoogle: "LOGIN GOOGLE",
    loginGuest: "MASUK SEBAGAI TAMU",
    loginLoggingIn: "SEDANG MASUK...",
    loginTitle: "TERSERAH.",
    loginSub: "Pilih Tanpa Ragu",
    roleTitle: "Masuk sebagai apa?",
    roleSub: "Silahkan pilih identitas kamu",
    roleUser: "Pengguna Biasa",
    roleUserDesc: "Cari rekomendasi makanan & tonton feed kuliner.",
    roleMerchant: "Penjual Makanan",
    roleMerchantDesc: "Upload menu aslimu & tampilkan lokasi usahamu.",
    onboardTitle: "Profil Kamu",
    onboardSub: "Lengkapi data diri singkat",
    onboardName: "Nama Tampilan",
    onboardUsername: "Username",
    onboardSubmit: "Mulai Sekarang",
    onboardSaving: "Menyimpan...",
    onboardPhotoError: "Foto terlalu besar (Max 5MB)",
    onboardCropTitle: "Potong Foto",
    onboardCropSave: "Simpan Foto",
    onboardCancel: "Batal",
    onboardPhotoFail: "Gagal upload foto",
    onboardFail: "Gagal menyelesaikan onboarding. Silakan coba lagi.",
    onboardUsernameTaken: "Username sudah digunakan. Silahkan pilih yang lain.",
    onboardErrorTitle: "Oops! Terjadi Masalah",
    onboardRetry: "Coba Simpan Lagi",
    onboardLogout: "Logout dan Login Ulang",
    reportTitle: "LAPORKAN KELUHAN ANDA",
    reportCategory: "Kategori Laporan",
    reportName: "Nama Pelapor",
    reportEmail: "Email Pelapor",
    reportExplanation: "Penjelasan Detail",
    reportSend: "REPORT NOW",
    reportSending: "MENGIRIM...",
    reportSuccess: "Laporan berhasil dikirim!",
    reportError: "Harap isi semua kolom",
    reportPlaceholderName: "Masukkan nama anda...",
    reportPlaceholderEmail: "Masukkan email anda...",
    reportPlaceholderDetail: "Ceritakan apa yang anda alami...",
    reportBug: "Laporkan Bug",
    reportAccount: "Permasalahan Akun",
    reportOther: "Lainnya",
    reportProcessed: "Laporan akan segera diproses oleh tim kami",
    reportSelectCategory: "Pilih Kategori...",
    feedBetaTag: "BETA TESTING",
    commentSuccess: "Komentar berhasil dikirim!",
    loginSuccessTitle: "Berhasil Login!",
    creator: "Pencipta",
    feedOfflineModeTag: "MODE OFFLINE",
    feedOfflineModalTitle: "KONEKSI BERMASALAH",
    feedOfflineModalDesc: "Waduh kak, kelihatannya server kami sedang mengalami gangguan teknis atau kuota harian telah habis. Kami mengalihkan sistem ke Mode Offline agar Kakak tetap bisa menikmati video kuliner yang tersedia secara lokal!",
    feedSwitchMode: "Ganti Mode",
    feedSwitchTitle: "Pengaturan Koneksi",
    feedSwitchOnline: "Pindah Mode Online",
    feedSwitchOffline: "Tetap Mode Offline",
    feedSwitchDesc: "Pilih mode yang ingin Kakak gunakan saat ini.",
    feedTitleLabel: "Judul Video",
    feedDescriptionLabel: "Deskripsi",
    feedOptional: "(Opsional)",
    feedActionSheetTitle: "Opsi Video",
    feedActionEdit: "Edit Video",
    feedActionDelete: "Hapus Video",
    feedActionSource: "Sumber Video",
  },
  en: {
    settings: "Settings",
    settingsSub: "Manage your culinary experience",
    appearance: "Appearance",
    darkMode: "Dark Mode",
    darkModeSub: "Change application theme",
    notifications: "Notifications",
    notificationsApp: "App Notifications",
    notificationsSub: "Malang hits food updates",
    collection: "Collection",
    favorites: "My Favorites",
    favoritesSub: (count: number) => `${count} foods you liked`,
    dataPrivacy: "Data & Privacy",
    resetData: "Reset Data",
    resetDataSub: "Clear chat history & favorites",
    aboutApp: "About Application",
    aboutAppSub: "Full information about Terserah App",
    newFeatureBadge: "NEW",
    language: "Language",
    languageSub: "Choose app language",
    faq: "Help & FAQ",
    faqSub: "Complete guide on app usage",
    back: "Back",
    darkModeOn: "Dark Mode",
    darkModeOff: "Light Mode",
    filterSemua: "All",
    filterMakanan: "Food",
    filterMinuman: "Drinks",
    faqTitle: "Help Center",
    faqItems: [
      {
        q: "What is the 'Whatever' feature?",
        a: "This feature helps you choose food when you're confused. AI will randomize the food list based on the time (morning/afternoon/night) and your preferences."
      },
      {
        q: "How does the Filter in 'Whatever' work?",
        a: "The filter allows you to limit the random results. Choose 'Food' if you only want heavy meals, 'Drinks' for something fresh, or 'All' for a mix of both."
      },
      {
        q: "What is the 'Whatever AI' ChatBot for?",
        a: "The ChatBot is your personal assistant. You can ask things like 'Spicy food recommendation in Soehat' or 'Good drinks for the afternoon'. It will provide menu suggestions along with their details."
      },
      {
        q: "What is the 'Culinary Feed' feature?",
        a: "The Feed feature is a short video sharing platform for Malang culinary. You can see recommended videos from other users for visual references of food you want to try."
      },
      {
        q: "How to upload videos on Feed?",
        a: "To upload, you must sign in/login to a Google account first. Click the '+' button in the Feed menu. Insert a culinary video (max 50MB) and provide the appropriate video source link."
      },
      {
        q: "What are the upload rules on Feed?",
        a: "You must include the original and correct 'Video Source Link' corresponding to the video you upload. Using links from different video sources is not allowed."
      }
    ],
    aboutTitle: "About Terserah App",
    aboutDescription: "Terserah App is the smart solution for the 'What should I eat today?' dilemma. We bring a complete catalog of Malang's culinary specialties with a touch of AI technology to simplify your search.",
    aboutFeedDescription: "Latest Update: We introduced the Culinary Feed feature where you can see food recommendations through short videos uploaded by the community.",
    features: "App Features",
    feature1Title: "AI Recommendation",
    feature1Desc: "Smart food suggestions based on your current time and location.",
    feature2Title: "Randomizer Menu",
    feature2Desc: "Instant menu randomizer to determine your food choice.",
    feature3Title: "Spin Wheel",
    feature3Desc: "A fun wheel of fortune to decide your culinary destiny.",
    feature4Title: "Favorite Collection",
    feature4Desc: "Save your dream culinary list to visit later.",
    contactTitle: "Contact Agent Now",
    contactSub: "Chat directly with our team",
    contactAgentTitle: "Contact Agent Now",
    contactAgentSub: "Chat directly with our team for instant help.",
    contactAgentButton: "START CHAT NOW",
    supportTitle: "Live Agent Chat",
    supportWaiting: "Connecting to Agent...",
    supportWaitingDesc: "Please wait a moment, our team will serve you soon.",
    supportConnected: "Connected with Agent",
    supportEnded: "Chat Session Ended",
    supportPlaceholder: "Type a message...",
    supportCancel: "Cancel Request",
    supportEndChat: "End Chat",
    supportConfirmEnd: "Are you sure you want to end this chat session?",
    supportAgentName: "Whatever Agent",
    supportUserTitle: "Need Help?",
    supportConnectConfirm: "You will be connected to our live agent. Ready to chat?",
    supportConnectNow: "YES, CHAT NOW",
    copyright: "© 2026 Terserah Team. Malang, Indonesia.",
    home: "Home",
    search: "Search",
    bot: "Assistant",
    setelan: "Settings",
    terserah: "Whatever",
    spinWheel: "Spin Wheel",
    dashboardHalo: "Welcome & Selamat Datang 👋",
    dashboardGreetingMorning: "🌅 Morning hunger!",
    dashboardGreetingLunch: "☀️ Lunch time!",
    dashboardGreetingAfternoon: "🌤️ Afternoon snack!",
    dashboardGreetingDinner: "🌑 Dinner time bestie!",
    dashboardGreetingNight: "🌙 Dinner time!",
    dashboardGreetingMidnight: "🌃 Midnight hunger!",
    dashboardBannerTitle: "Today's Recommendation",
    categories: {
      "Semua": "All",
      "Mie": "Noodles",
      "Nasi": "Rice",
      "Bakso": "Meatballs",
      "Soto": "Soup",
      "Ayam": "Chicken",
      "Pedas": "Spicy",
      "Nasgor": "Fried Rice",
      "Seafood": "Seafood",
      "Bebek": "Duck",
      "Sate": "Satay",
      "Rawon": "Beef Soup",
      "Pecel": "Salad Rice",
      "Es/Cold": "Cold Drinks",
      "Kopi": "Coffee",
      "Boba": "Boba",
      "Ramen": "Ramen",
      "Korean": "Korean",
      "Western": "Western",
      "Sarapan": "Breakfast",
      "Malam": "Late Night",
      "Rice Box": "Rice Box",
      "Lalapan": "Fresh Greens",
      "Bakar": "Grilled",
      "Goreng": "Fried",
      "Berkuah": "Soup Based",
      "UMKM": "Handmade"
    },
    dashboardBannerSubtitle: (count: number) => `${count} locations in Malang`,
    dashboardSectionRecommended: "Perfect for Now",
    dashboardSectionRecommendedSub: "Malang's Best 🕐",
    dashboardSectionTrending: "Currently Trending 🔥",
    dashboardSeeAll: "See All",
    searchTitle: "Food Search",
    searchPlaceholder: "What do you want to eat today?",
    searchResults: "Search Results",
    searchRecommended: "Recommended for You",
    searchFound: (count: number) => `${count} found`,
    searchNotFound: "Ops, not found...",
    searchNotFoundSub: "Try search another keyword or clear filters.",
    searchReset: "Reset Search",
    searchBranch: (count: number) => `${count} Branches`,
    chatHeader: "Assistant",
    chatStatus: "Online & Ready to Help",
    chatHistory: "Chat History",
    chatEmpty: "No chat history yet.",
    chatHistoryNoteTitle: "Important Notice",
    chatHistoryNote: "The app only stores the last 10 conversations. Old conversations will be deleted automatically and permanently.",
    chatNewChat: "New Conversation",
    chatPesan: "messages",
    chatIntro: "Hey bestie! Confused about what to eat or looking for trending food spots in Malang? Let's chat! I'm ready to find the perfect menu for you today!",
    chatPlaceholder: "Ask anything...",
    chatLimit: "Oops, the AI assistant is taking a short break because there are too many questions (Limit Reached). Please try again in a while! 🙏",
    chatMaintenance: "All channels are busy or limit reached. Please try again later, bestie! 🛠️",
    chatThinking: "Thinking...",
    chatChessDiscovery: "♟️ Wow, you found the **Secret Game**! 🎉 This is a hidden game that can only be played here — online or offline! Click the button below to start playing:",
    chatPlayChess: "PLAY CHESS",
    favoritesTitle: "My Favorites",
    favoritesScreenSub: "Your collection of selected food",
    favoritesEmpty: "No favorites yet!",
    favoritesEmptySub: "Click the heart icon on food details to save the food you like here.",
    favoritesExplore: "Explore Food",
    detailReviews: "reviews",
    detailWhy: "Why Try This?",
    detailBranches: "Branch Locations",
    detailViewLocation: "View Location",
    detailRandomize: "Change to Another Food",
    detailShareText: (name: string, desc: string) => `${name}\n\nCheck out this great food in Malang: ${name}. ${desc}`,
    detailDownloadApp: "Visit our website for more information.",
    detailCopied: "Link copied to clipboard!",
    randomTitle: "Whatever Recommendation",
    randomSub: "Confused what to eat? Let us choose for you!",
    randomButton: "Randomize Food",
    randomLoading: "Wait a second...",
    randomDetail: "View Detail",
    randomSkip: "Skip",
    randomSpin: "Spin Wheel",
    randomSuccessAdd: "Successfully added!",
    randomActionTitle: "Choose action for your food list:",
    randomAddToSpin: "ADD TO SPIN WHEEL",
    randomSpinNow: (count: number) => `SPIN NOW (${count})`,
    randomClose: "CLOSE",
    randomAjaDeh: "Whatever!",
    randomAIPick: "Leave your hunger to us!",
    randomStartSearch: "START SEARCH!",
    randomGo: "Let's Go!",
    randomTryAgain: "Try Again",
    spinTitle: "Spin Wheel",
    spinSub: "Determine your culinary fate with the wheel of fortune!",
    spinList: "Option List",
    spinAdd: "Add Option",
    spinInputPlaceholder: "Enter food name...",
    spinDelete: "Delete",
    spinButton: "SPIN WHEEL",
    spinResult: "Result:",
    spinGreeting: "Wheel of Fortune",
    spinTap: "Tap wheel to spin",
    spinMinPilihan: "Add at least 2 food options to start spinning the wheel!",
    spinPlaceholder: "Type food name...",
    spinWinner: "The Winner Is!",
    spinChosen: "The wheel of fortune has chosen:",
    spinMantap: "GREAT!",
    spinRemoveWinner: "Delete This Option",
    spinShuffle: "Shuffle",
    spinDeleteAll: "Delete All",
    spinCongrats: (name: string) => `Great! You got: ${name}`,
    resetTitle: "Reset Data",
    resetSub: "Manage your app's storage database.",
    resetWarning: "Danger!",
    resetAll: "Delete All Data",
    resetFav: "Favorites Database",
    resetChat: "ChatBot History",
    resetNote: "All data will be permanently deleted.",
    resetDelete: "Delete",
    resetDataLabel: "data",
    resetSuccessAll: "All data (Chat History & Favorites) have been permanently deleted!",
    resetSuccessFav: "Favorites Database has been permanently deleted!",
    resetSuccessChat: "ChatBot History has been permanently deleted!",
    resetConfirmTitle: "Confirm Delete",
    resetConfirmSub: (type: string) => `Are you sure you want to permanently delete ${type}? This action cannot be undone.`,
    resetCancel: "Cancel",
    resetYes: "Yes, Delete",
    resetFavDB: "Favorites Database",
    resetChatDB: "ChatBot History",
    resetAllData: "ALL app data",
    resetAllChat: "all chat history",
    resetAllFav: "all favorites",
    resetStored: "stored",
    resetItem: "item",
    resetSession: "session",
    resetWarningDetailed: "Careful! Deleting data here will permanently remove that data from your device.",
    splashLoading: "Searching for the best menu...",
    splashFinish: "Ready to Go!",
    splashSubtitle: "Malang Cuisine for every mood 🍜",
    onboarding: [
      {
        title: "Smart AI Search",
        desc: "Instantly get the best menu suggestions tailored to the time and your taste.",
        icon: "Sparkles"
      },
      {
        title: "Whatever Randomizer",
        desc: "Confused about the menu? Let us randomly choose for you with just one tap!",
        icon: "Dice5"
      },
      {
        title: "Watch Culinary Feed",
        desc: "See food visuals through short videos from the Malang culinary community.",
        icon: "PlayCircle"
      },
      {
        title: "Save Your Favorites",
        desc: "Collect your dream food list and make sure nothing is missed.",
        icon: "Heart"
      }
    ],
    onboardingNext: "Next",
    onboardingStart: "Get Started",
    shortFeed: "Short Feed",
    feedBetaInfo: "The Culinary Feed feature is currently in Beta Testing. You may encounter some bugs. Please help us by reporting issues via the Settings menu in your Profile.",
    feedPreparing: "Preparing Feed",
    feedError: "Video Failed to Load",
    feedErrorSub: "Please check your internet connection or try again later",
    feedFinishedTitle: "Feed Finished!",
    feedFinishedDesc: (count: number) => `You've watched all ${count} latest feeds. Scroll again to reshuffle or click the button below!`,
    feedFinishedButton: "Play Again (Random)",
    watchInTikTok: "Video Source",
    feedStatusPlaying: "Playing",
    feedStatusPaused: "Paused",
    feedUploadVideo: "Upload Video",
    feedRestrictedAccess: "Restricted Access",
    feedLoginTitle: "PLEASE LOGIN WITH GOOGLE!",
    feedLoginDesc: "You need to login with Google to maintain community safety and manage your culinary videos.",
    feedLoginButton: "LOGIN WITH GOOGLE",
    feedUploadSuccessTitle: "SUCCESSFULLY POSTED!",
    feedUploadSuccessDesc: "Done! Your culinary video has been uploaded globally. Returning to home...",
    feedSelectFile: "Select Video File",
    feedMax50MB: "Maximum 50MB",
    feedDeleteReplace: "Delete & Change",
    feedTikTokLink: "(Video Source Link)",
    feedPostButton: "POST CULINARY",
    feedTryAgain: "TRY AGAIN",
    feedOpenLink: "OPEN VIDEO LINK",
    feedLike: "Like",
    feedComment: "Comment",
    feedKomentarTitle: "COMMENTS",
    feedNoComments: "No comments yet. Be the first!",
    feedWriteComment: "Write your culinary comment...",
    feedDeleting: "Deleting video...",
    feedDeleteVideo: "Delete Video",
    feedDeleteConfirm: "Delete this culinary video PERMANENTLY from the global server? \n\nThis cannot be undone.",
    feedDeleteSuccess: "Video Successfully Deleted Permanently!",
    feedLoginToLike: "You must login to like a video.",
    feedLoginToDelete: "You must login to delete a video.",
    feedNoPermissionDelete: "Sorry, only the video owner can delete their own culinary video.",
    feedPosting: "Posting...",
    feedLoading: "LOADING FEED...",
    feedPostNow: "POST NOW",
    feedUploading: (progress: number) => `UPLOADING... ${progress}%`,
    feedCancellingUpload: "Cancelling upload...",
    feedAuthChecking: "Verifying identity...",
    feedPostNote: (name: string) => `Your post will appear globally with profile name: @${name}`,
    feedHome: "Home",
    feedProfile: "Profile",
    feedLoginPromptTitle: "READY TO SHARE CULINARY?",
    feedLoginPromptDesc: "Login with Google to like videos, leave global comments, and follow your favorite culinary creators.",
    feedMaybeLater: "MAYBE LATER",
    feedDeleteAccountWarning: "⚠️ STRICT WARNING! ⚠️\n\nDeleting your account will do the following:\n1. ALL videos you've ever uploaded will be permanently deleted from the server.\n2. Your profile (name, avatar) will be deleted globally.\n3. Comment history and followers/following lists will be lost.\n4. You will be forcibly logged out.\n\nThis action CANNOT BE UNDONE. Are you sure you want to delete your account?",
    feedDeleteAccountSuccess: "✅ DATA SUCCESSFULLY DELETED! Goodbye!",
    feedDeleteAccountError: (msg: string) => `Failed to delete account: ${msg}`,
    feedFollowers: "Followers",
    feedFollowing: "Following",
    feedView: "View",
    feedNoList: "No list yet",
    feedSend: "Send",
    feedSwitchAccount: "Switch Account",
    feedActive: "Active",
    feedAddAccount: "Add Another Account",
    feedEditProfile: "Edit Profile",
    feedLikeHistory: "Like History",
    feedWatchHistory: "Watch History",
    feedLogout: "Logout",
    feedDeleteAccountPermanent: "Delete Account Permanently",
    feedUsername: "Username",
    feedSelectAvatarPrompt: "Enter your new profile image URL:",
    feedSaveChanges: "SAVE CHANGES",
    feedVideosYouLiked: "Videos you liked",
    feedLastViewed: "Last viewed",
    feedNoData: "No data yet",
    feedMyVideos: "My Videos",
    feedVideosBy: (name: string) => `Videos by @${name}`,
    feedFollowingState: "Following",
    feedUnfollow: "Unfollow",
    feedFollow: "Follow",
    feedProfileIdentityDesc: "Your global culinary profile identity on Whatever App.",
    feedNameEmpty: "Name cannot be empty!",
    feedProfileUpdated: (name: string) => `🎉 Your profile "${name}" successfully updated!`,
    feedProfileSaveError: "Failed to save profile",
    feedSyncError: (msg: string) => `Oops! Failed to sync to server: ${msg}`,
    feedVideoTooLarge: "Video too large! Maximum 50MB.",
    feedInvalidTikTok: "Enter a valid video source link!",
    feedSupabaseNotConfigured: "Supabase is not configured yet.",
    feedUploadError: (msg: string) => `Upload failed: ${msg}`,
    feedUploadRLSNote: "\n\nSINCE YOU ARE USING GOOGLE LOGIN, CHECK THIS IN SUPABASE:\n1. Click the 'INSERT' Policy.\n2. Ensure 'Target Roles' are both 'authenticated' AND 'anon'.\n3. Ensure 'UPDATE' has the same permissions if the error persists.\n4. Ensure 'SELECT' is also given to 'anon' & 'authenticated'.",
    feedEmpty: "Feed Empty...",
    feedSupabaseRLSWarning: "⚠️ SUPABASE PERMISSION ISSUE (RLS)",
    feedSupabaseRLSDesc: "When logged in, Supabase needs SELECT permission for the authenticated role. It seems you only gave permission to anon.",
    feedSupabaseRLSFix: "FIX: Add 'authenticated' role to your Storage SELECT Policy!",
    feedGuestPrompt: "Try clicking refresh to load videos.",
    feedStatusGuest: "Status: Not Logged In",
    feedReloadFeed: "RELOAD RANDOM FEED",
    feedScrollToReload: "Scroll again to reload",
    feedLoadingMore: "Reloading...",
    feedGlobalComments: "Global Comments",
    feedReply: "Reply",
    feedNoCommentsAlt: "No comments",
    feedFirstCommentPrompt: "Be the first to leave a global comment!",
    feedAddCommentPlaceholder: "Add global comment...",
    feedManualRefresh: "Manual Refresh",
    feedDeleteErrorInternal: "Deletion failed: File identity not found.",
    feedDeleteErrorGeneric: (msg: string) => `Failed to delete video: ${msg}`,
    uploadNext: "Next",
    uploadBack: "Back",
    uploadSetThumbnail: "Set Own Thumbnail",
    uploadUseDefaultThumbnail: "Use Default Thumbnail",
    uploadCaptureFrame: "Capture Frame",
    uploadCaptureHint: "Choose the best frame from your video",
    uploadStatusVideo: "Uploading video...",
    uploadStatusThumb: "Uploading thumbnail...",
    uploadStatusDB: "Saving data to Supabase...",
    uploadComplete: "Upload complete",
    uploadSourcePlaceholder: "Paste video source link, e.g., TikTok/Instagram/YouTube",
    uploadSourceLabel: "Video Source Link",
    uploadStep1Title: "STEP 1: SELECT VIDEO & SOURCE LINK",
    uploadStep2Title: "STEP 2: SET THUMBNAIL, TITLE, DESCRIPTION",
    feedSwitchingTo: (email: string) => `Switching to ${email}...`,
    feedSessionExpired: "Session expired, please login again.",
    feedSwitchAccountError: "Failed to switch account.",
    feedGuestName: "Not Logged In",
    feedSupabaseConfigPrompt: "Please configure Supabase first in settings!",
    feedLoginError: (msg: string) => `Login Failed: ${msg}`,
    feedLogoutConfirm: "Are you sure you want to log out from this account?",
    feedLogoutSuccess: "Successfully logged out!",
    feedDefaultUserName: "Culinary User",
    feedSource: "Video Source",
    feedSourcePlaceholder: "TikTok/IG/etc Link",
    feedSourceMatchRule: "Video source link must be filled according to the video you upload.",
    feedSpeed: "2x SPEED",
    feedThumbnailPreview: "Thumbnail Preview",
    feedThumbnailSliderHint: "Slide to select the best frame",
    feedThumbnailAutoHint: "Thumbnail will be automatically selected based on slider position",
    feedAutoFrame: "THUMBNAIL",
    feedCustomFrame: "CUSTOM",
    feedThumbnailVideo: "USE VIDEO THUMBNAIL",
    feedThumbnailUpload: "UPLOAD IMAGE",
    loginGoogle: "LOGIN GOOGLE",
    loginGuest: "CONTINUE AS GUEST",
    loginLoggingIn: "LOGGING IN...",
    loginTitle: "WHATEVER.",
    loginSub: "CHOOSE WITHOUT HESITATION",
    roleTitle: "Continue as?",
    roleSub: "Please select your identity",
    roleUser: "Regular User",
    roleUserDesc: "Find food recommendations & watch culinary feeds.",
    roleMerchant: "Food Merchant",
    roleMerchantDesc: "Upload your authentic menu & show your location.",
    onboardTitle: "Your Profile",
    onboardSub: "Complete your brief profile",
    onboardName: "Display Name",
    onboardUsername: "Username",
    onboardSubmit: "Start Now",
    onboardSaving: "Saving...",
    onboardPhotoError: "Photo too large (Max 5MB)",
    onboardCropTitle: "Crop Photo",
    onboardCropSave: "Save Photo",
    onboardCancel: "Cancel",
    onboardPhotoFail: "Failed to upload photo",
    onboardFail: "Failed to complete onboarding. Please try again.",
    onboardUsernameTaken: "Username is already taken. Please choose another.",
    onboardErrorTitle: "Oops! Something Went Wrong",
    onboardRetry: "Try Saving Again",
    onboardLogout: "Logout and Login Again",
    reportTitle: "REPORT YOUR ISSUE",
    reportCategory: "Report Category",
    reportName: "Your Name",
    reportEmail: "Your Email",
    reportExplanation: "Detailed Explanation",
    reportSend: "REPORT NOW",
    reportSending: "SENDING...",
    reportSuccess: "Report successfully sent!",
    reportError: "Please fill in all fields",
    reportPlaceholderName: "Enter your name...",
    reportPlaceholderEmail: "Enter your email...",
    reportPlaceholderDetail: "Tell us what you experienced...",
    reportBug: "Report Bug",
    reportAccount: "Account Issue",
    reportOther: "Other",
    reportProcessed: "The report will be processed by our team soon",
    reportSelectCategory: "Select Category...",
    feedBetaTag: "BETA TESTING",
    commentSuccess: "Comment posted successfully!",
    loginSuccessTitle: "Login Successful!",
    creator: "Creator",
    feedOfflineModeTag: "OFFLINE MODE",
    feedOfflineModalTitle: "SERVER ISSUES",
    feedOfflineModalDesc: "Oops! It seems our server is experiencing technical issues or daily limits. We are switching to Offline Mode so you can still enjoy culinary videos available locally!",
    feedSwitchMode: "Change Mode",
    feedSwitchTitle: "Connection Settings",
    feedSwitchOnline: "Switch to Online Mode",
    feedSwitchOffline: "Stay in Offline Mode",
    feedSwitchDesc: "Choose which mode you want to use right now.",
    feedTitleLabel: "Video Title",
    feedDescriptionLabel: "Description",
    feedOptional: "(Optional)",
    feedActionSheetTitle: "Video Options",
    feedActionEdit: "Edit Video",
    feedActionDelete: "Remove Video",
    feedActionSource: "Video Source",
  }
};
