import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useCountUpAnimation } from "@/hooks/useCountUpAnimation";
import {
  MessageCircle, ChevronRight, ChevronDown, Globe, User, Bell, Shield, LogOut,
  Trash2, Edit3, TrendingUp, Heart,
} from "lucide-react";
import { ASSETS, APP_ASSETS } from "@/data/assets";
import { NotifToggle } from "@/components/market/NotifToggle";
import { TranslationStrings, UserComment } from "@/types";

interface ProfileTabProps {
  language: string;
  t: TranslationStrings;
  profilePage: string | null;
  setProfilePage: (p: string | null) => void;
  profilePicture: string | null;
  userComments: UserComment[];
  deleteComment: (id: string) => void;
  watchlistAssets: string[];
  pinnedAssets: string[];
  autoTranslate: boolean;
  setAutoTranslate: (v: boolean) => void;
  showLanguageMenu: boolean;
  setShowLanguageMenu: (v: boolean) => void;
  languageButtonRef: React.RefObject<HTMLButtonElement>;
  langMenuPos: { top: number; left: number };
  setLanguage: (lang: string) => void;
  setIsLoggedIn: (v: boolean) => void;
  handleProfilePicture: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileTab({
  language, t, profilePage, setProfilePage,
  profilePicture, userComments, deleteComment,
  watchlistAssets, pinnedAssets,
  autoTranslate, setAutoTranslate,
  showLanguageMenu, setShowLanguageMenu,
  languageButtonRef, langMenuPos, setLanguage,
  setIsLoggedIn, handleProfilePicture,
}: ProfileTabProps) {
  // Animated stats counters
  const commentsCount = useCountUpAnimation({
    end: userComments.length,
    duration: 800,
    decimals: 0,
  });
  const watchlistCount = useCountUpAnimation({
    end: watchlistAssets.length,
    duration: 800,
    decimals: 0,
  });
  const pinnedCount = useCountUpAnimation({
    end: pinnedAssets.length,
    duration: 800,
    decimals: 0,
  });
  return (
    <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 pt-10 pb-24">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="mpIconGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="20%" stopColor="#00FFFF" />
            <stop offset="100%" stopColor="#00FF55" />
          </linearGradient>
        </defs>
      </svg>
      <AnimatePresence mode="wait">
        {!profilePage ? (
          <motion.div key="profile-main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center gap-6 mb-8">
              <div className="relative group cursor-pointer" onClick={() => document.getElementById("profilePicInput")?.click()}>
                <div className="w-20 h-20 rounded-[32px] mp-gradient-badge p-0.5">
                  <div className="w-full h-full bg-[#0D0E12] rounded-[30px] flex items-center justify-center overflow-hidden">
                    {profilePicture ? <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" /> : <img src={APP_ASSETS.tabLogo} alt="Profile" className="w-10 h-10 object-contain opacity-40 grayscale" />}
                  </div>
                </div>
                <div className="absolute inset-0 rounded-[32px] bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Edit3 className="w-5 h-5 text-foreground" /></div>
                <input id="profilePicInput" type="file" accept="image/*" className="hidden" onChange={handleProfilePicture} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase">Gökalp</h2>
                <p className="text-sm text-[var(--mp-text-secondary)]">{t.proMember} • {t.since} 2024</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label: language === "Turkish" ? "Yorum" : "Comments", value: commentsCount },
                { label: language === "Turkish" ? "İzleme" : "Watchlist", value: watchlistCount },
                { label: language === "Turkish" ? "Sabitlenen" : "Pinned", value: pinnedCount },
              ].map((stat, i) => (
                <motion.div key={i} 
                  className="mp-glass-card rounded-2xl p-4 text-center hover:bg-white/5 transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-[26px] font-black text-foreground drop-shadow-md">{stat.value}</div>
                  <div className="text-[9px] font-black text-white/50 uppercase tracking-widest mt-1.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div onClick={() => setProfilePage("comments")} className="bg-gradient-to-r from-[var(--mp-purple)]/10 to-[var(--mp-blue)]/10 border border-[var(--mp-purple)]/20 rounded-[24px] p-5 mb-4 cursor-pointer hover:from-[var(--mp-purple)]/15 hover:to-[var(--mp-blue)]/15 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl mp-gradient-badge-purple flex items-center justify-center shadow-[0_0_15px_rgba(178,75,243,0.3)]"><MessageCircle className="w-5 h-5 text-background" /></div>
                  <div><span className="font-bold text-[15px] text-foreground">{language === "Turkish" ? "Yorumlarım" : "My Comments"}</span></div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--mp-purple)]" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="mp-glass-card rounded-[24px] overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-white/[0.03]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center"><Globe className="w-4 h-4" stroke="url(#mpIconGrad)" /></div>
                    <div><div className="font-bold text-[14px] text-white/90">{t.autoTranslate}</div><div className="text-[10px] text-[var(--mp-text-secondary)]">{t.translateComments}</div></div>
                  </div>
                  <div onClick={() => setAutoTranslate(!autoTranslate)} className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${autoTranslate ? "mp-positive-badge shadow-[0_0_10px_rgba(0,255,255,0.3)]" : "bg-white/10"}`}>
                    <motion.div animate={{ x: autoTranslate ? 20 : 0 }} className="w-4 h-4 rounded-full bg-background shadow-sm border border-black/10" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center"><MessageCircle className="w-4 h-4" stroke="url(#mpIconGrad)" /></div>
                    <div><div className="font-bold text-[14px] text-white/90">{t.language}</div><div className="text-[10px] text-[var(--mp-text-secondary)]">{t.targetLanguage}</div></div>
                  </div>
                  <div className="relative z-[60]">
                    <button ref={languageButtonRef} onClick={(e) => { e.stopPropagation(); setShowLanguageMenu(!showLanguageMenu); }} className="w-full flex items-center justify-between bg-white/[0.03] border border-white/[0.08] px-4 py-3 rounded-xl">
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground">{language}</span>
                      <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${showLanguageMenu ? "rotate-180" : ""}`} />
                    </button>
                    {showLanguageMenu && createPortal(
                      <>
                        <div onClick={() => setShowLanguageMenu(false)} className="fixed inset-0 z-[200]" />
                        <div className="fixed z-[201] bg-[#0D0E14] border border-white/[0.1] rounded-xl p-2.5 shadow-[0_10px_50px_rgba(0,0,0,0.8)] grid grid-cols-2 gap-1.5 max-h-[250px] overflow-y-auto w-[300px]" style={{ top: langMenuPos.top, left: Math.max(8, langMenuPos.left) }}>
                          {["English", "Turkish", "German", "French", "Spanish", "Italian", "Russian", "Chinese"].map((lang) => (
                            <button key={lang} onClick={(e) => { e.stopPropagation(); setLanguage(lang); setShowLanguageMenu(false); }} className={`px-3 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-center ${language === lang ? "bg-foreground text-background" : "text-white/40 hover:bg-white/5"}`}>{lang}</button>
                          ))}
                        </div>
                      </>,
                      document.body
                    )}
                  </div>
                </div>
              </div>

              {[
                { icon: <User className="w-5 h-5" />, title: t.accountSettings, page: "account" },
                { icon: <Bell className="w-5 h-5" />, title: t.notifications, page: "notifications" },
                { icon: <Shield className="w-5 h-5" />, title: t.privacySecurity, page: "privacy" },
                { icon: <LogOut className="w-5 h-5" />, title: t.logout, color: "bg-[var(--mp-red)] text-background", onClick: () => { setIsLoggedIn(false); } },
              ].map((item, i) => (
                <div key={i} onClick={item.onClick || (() => item.page && setProfilePage(item.page))} className="mp-glass-card rounded-[24px] p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color || "bg-white/5 text-[var(--mp-text-secondary)]"}`}>{item.icon}</div>
                    <span className={`font-bold text-[15px] ${item.color ? "text-[var(--mp-red)]" : "text-white/90"}`}>{item.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20" />
                </div>
              ))}
            </div>
          </motion.div>

        ) : profilePage === "comments" ? (
          <motion.div key="profile-comments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setProfilePage(null)} className="flex items-center gap-2 text-[var(--mp-text-secondary)] text-[12px] font-bold uppercase tracking-wider mb-6 hover:text-foreground transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Profile</button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl mp-gradient-badge-purple flex items-center justify-center"><MessageCircle className="w-5 h-5 text-background" /></div>
              <div><h3 className="text-xl font-black uppercase">{language === "Turkish" ? "Yorumlarım" : "My Comments"}</h3></div>
            </div>
            {userComments.length === 0 ? (
              <div className="text-center py-16"><MessageCircle className="w-10 h-10 text-white/10 mx-auto mb-3" /><p className="text-[13px] text-[var(--mp-text-secondary)]">{language === "Turkish" ? "Henüz yorum yazmadınız." : "No comments yet."}</p></div>
            ) : (
              <>
                <motion.div 
                  className="space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.08,
                      },
                    },
                  }}
                >
                  {userComments.map((uc: UserComment) => (
                    <motion.div key={uc.id} 
                      className="mp-glass-card rounded-2xl p-4"
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-foreground">{ASSETS.find((a) => a.id === uc.assetId)?.name || uc.assetId}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${uc.sentiment === "Positive" ? "bg-[var(--mp-green)] text-background" : uc.sentiment === "Negative" ? "bg-[#FF3131] text-foreground" : "bg-[var(--mp-cyan)] text-background"}`}>{uc.sentiment}</span>
                        </div>
                        <button onClick={() => deleteComment(uc.id)} className="p-1 hover:bg-white/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-[var(--mp-text-secondary)]" /></button>
                      </div>
                      <p className="text-[14px] text-white/80 leading-relaxed mb-2">{uc.text}</p>
                      <div className="flex items-center gap-3 text-[10px] text-white/20">
                        <span>${uc.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span>{uc.timeframe}</span>
                        <span>{new Date(uc.timestamp).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                <div className="flex justify-center gap-1.5 mt-6 pt-4 border-t border-white/5">
                  {Array.from({ length: Math.min(userComments.length, 5) }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < userComments.length ? "bg-[var(--mp-cyan)]" : "bg-white/10"}`} />
                  ))}
                </div>
              </>
            )}
          </motion.div>

        ) : profilePage === "account" ? (
          <motion.div key="profile-account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setProfilePage(null)} className="flex items-center gap-2 text-[var(--mp-text-secondary)] text-[12px] font-bold uppercase tracking-wider mb-6 hover:text-foreground transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Profile</button>
            <h3 className="text-xl font-black uppercase mb-6">{t.accountSettings}</h3>
            <div className="space-y-4">
              {[
                { label: language === "Turkish" ? "Kullanıcı Adı" : "Username", value: "Gökalp" },
                { label: "Email", value: "gokalp@example.com" },
                { label: language === "Turkish" ? "Üyelik" : "Membership", value: "Pro" },
                { label: language === "Turkish" ? "Katılım Tarihi" : "Joined", value: "2024" },
              ].map((field, i) => (
                <div key={i} className="mp-glass-card rounded-2xl p-4"><div className="text-[9px] font-bold text-[var(--mp-text-secondary)] uppercase tracking-widest mb-1">{field.label}</div><div className="text-[15px] font-bold text-foreground">{field.value}</div></div>
              ))}
              <button className="w-full py-4 bg-white/5 border border-white/[0.05] rounded-2xl text-[12px] font-black text-white/60 uppercase tracking-widest hover:bg-white/10 transition-colors">{language === "Turkish" ? "Profili Düzenle" : "Edit Profile"}</button>
            </div>
          </motion.div>

        ) : profilePage === "notifications" ? (
          <motion.div key="profile-notif" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setProfilePage(null)} className="flex items-center gap-2 text-[var(--mp-text-secondary)] text-[12px] font-bold uppercase tracking-wider mb-6 hover:text-foreground transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Profile</button>
            <h3 className="text-xl font-black uppercase mb-6">{t.notifications}</h3>
            <div className="space-y-2 mb-8">
              {[
                { icon: <TrendingUp className="w-4 h-4" />, color: "bg-[var(--mp-green)] text-background", user: "@CryptoKing", action: language === "Turkish" ? "yorumunu beğendi" : "liked your comment", asset: "BTC", time: "2m" },
                { icon: <MessageCircle className="w-4 h-4" />, color: "bg-[var(--mp-cyan)] text-background", user: "@WhaleWatch", action: language === "Turkish" ? "yorumuna yanıt verdi" : "replied to your comment", asset: "ETH", time: "15m" },
                { icon: <TrendingUp className="w-4 h-4" />, color: "bg-[var(--mp-green)] text-background", user: "@GoldBug", action: language === "Turkish" ? "yorumunu beğendi" : "liked your comment", asset: "GOLD", time: "1h" },
                { icon: <Heart className="w-4 h-4" />, color: "mp-gradient-badge-purple text-background", user: "@DayTrader", action: language === "Turkish" ? "yorumunu beğendi" : "liked your comment", asset: "AAPL", time: "2h" },
              ].map((notif, i) => (
                <div key={i} className="mp-glass-card rounded-2xl p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.color}`}>{notif.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-white/90 leading-snug"><span className="font-bold">{notif.user}</span> {notif.action}</div>
                    <div className="text-[10px] text-[var(--mp-text-secondary)] mt-0.5">{notif.asset} • {notif.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] font-black text-[var(--mp-text-secondary)] uppercase tracking-widest mb-3">{language === "Turkish" ? "Bildirim Ayarları" : "Notification Settings"}</div>
            <div className="space-y-3">
              {[
                { label: language === "Turkish" ? "Fiyat Uyarıları" : "Price Alerts", desc: language === "Turkish" ? "Fiyat hedefine ulaşıldığında" : "When price targets are hit", defaultOn: true },
                { label: language === "Turkish" ? "Yorum Yanıtları" : "Comment Replies", desc: language === "Turkish" ? "Yorumlarına yanıt geldiğinde" : "When someone replies", defaultOn: true },
                { label: language === "Turkish" ? "Beğeniler" : "Likes", desc: language === "Turkish" ? "Yorumların beğenildiğinde" : "When your comments are liked", defaultOn: true },
                { label: language === "Turkish" ? "Piyasa Haberleri" : "Market News", desc: language === "Turkish" ? "Önemli piyasa haberleri" : "Important market news", defaultOn: false },
              ].map((item, i) => <NotifToggle key={i} label={item.label} desc={item.desc} defaultOn={item.defaultOn} />)}
            </div>
          </motion.div>

        ) : profilePage === "privacy" ? (
          <motion.div key="profile-privacy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setProfilePage(null)} className="flex items-center gap-2 text-[var(--mp-text-secondary)] text-[12px] font-bold uppercase tracking-wider mb-6 hover:text-foreground transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Profile</button>
            <h3 className="text-xl font-black uppercase mb-6">{t.privacySecurity}</h3>
            <div className="space-y-3">
              {[
                { label: language === "Turkish" ? "Profil Gizliliği" : "Profile Visibility", desc: language === "Turkish" ? "Profilini kimler görebilir" : "Who can see your profile", defaultOn: true },
                { label: language === "Turkish" ? "Yorum Geçmişi" : "Comment History", desc: language === "Turkish" ? "Yorum geçmişini herkese göster" : "Show comment history publicly", defaultOn: false },
                { label: language === "Turkish" ? "Konum Verisi" : "Location Data", desc: language === "Turkish" ? "Konum bilgisi paylaşımı" : "Share location with comments", defaultOn: false },
                { label: language === "Turkish" ? "Analitik" : "Analytics", desc: language === "Turkish" ? "Kullanım verisi paylaşımı" : "Share usage data for improvements", defaultOn: true },
              ].map((item, i) => <NotifToggle key={i} label={item.label} desc={item.desc} defaultOn={item.defaultOn} />)}
              <div className="mt-6 space-y-3">
                <button className="w-full py-4 bg-white/5 border border-white/[0.05] rounded-2xl text-[12px] font-black text-white/60 uppercase tracking-widest hover:bg-white/10 transition-colors">{language === "Turkish" ? "Verileri Dışa Aktar" : "Export Data"}</button>
                <button className="w-full py-4 bg-[var(--mp-red)]/10 border border-[var(--mp-red)]/20 rounded-2xl text-[12px] font-black text-[var(--mp-red)] uppercase tracking-widest hover:bg-[var(--mp-red)]/20 transition-colors">{language === "Turkish" ? "Hesabı Sil" : "Delete Account"}</button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
