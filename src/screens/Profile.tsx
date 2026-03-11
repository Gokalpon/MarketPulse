// @ts-nocheck
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe, MessageCircle, Bell, Shield, User, LogOut,
  ChevronRight, TrendingUp, TrendingDown, Newspaper,
  Heart, Edit3, Trash2, ChevronDown
} from "lucide-react";
import { ASSETS, APP_ASSETS } from "../data";
import { useApp } from "../context/AppContext";

const NotifToggle = ({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="bg-black/20 border border-white/[0.03] rounded-2xl p-4 flex items-center justify-between">
      <div className="flex-1 mr-4">
        <div className="font-bold text-[14px] text-white/90">{label}</div>
        <div className="text-[10px] text-[#7A7B8D] mt-0.5">{desc}</div>
      </div>
      <div onClick={() => setOn(!on)} className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors flex-shrink-0 ${on ? "bg-[#39FF14]" : "bg-white/10"}`}>
        <motion.div animate={{ x: on ? 20 : 0 }} className="w-4 h-4 rounded-full bg-white shadow-sm" />
      </div>
    </div>
  );
};

export function Profile() {
  const {
    profilePage, setProfilePage,
    profilePicture, handleProfilePicture,
    userComments, deleteComment,
    watchlistAssets, pinnedAssets,
    autoTranslate, setAutoTranslate,
    language, changeLanguage, showLanguageMenu, setShowLanguageMenu,
    setIsLoggedIn, setOnboardingStep,
    t,
  } = useApp();

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="px-6 pt-10 pb-24"
    >
      <AnimatePresence mode="wait">
        {!profilePage ? (
          <motion.div key="profile-main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
            {/* Header */}
            <div className="flex items-center gap-6 mb-8">
              <div className="relative group cursor-pointer" onClick={() => document.getElementById("profilePicInput")?.click()}>
                <div className="w-20 h-20 rounded-[32px] bg-gradient-to-tr from-[#00FFFF] to-[#39FF14] p-0.5">
                  <div className="w-full h-full bg-[#0D0E12] rounded-[30px] flex items-center justify-center overflow-hidden">
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <img src={APP_ASSETS.tabLogo} alt="Profile" className="w-10 h-10 object-contain opacity-40 grayscale" />
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 rounded-[32px] bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <input id="profilePicInput" type="file" accept="image/*" className="hidden" onChange={handleProfilePicture} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase">Gökalp</h2>
                <p className="text-sm text-[#7A7B8D]">{t.proMember} • {t.since} 2024</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label: language === "Turkish" ? "Yorum" : "Comments", value: userComments.length, color: "from-[#B24BF3] to-[#5B7FFF]" },
                { label: language === "Turkish" ? "İzleme" : "Watchlist", value: watchlistAssets.length, color: "from-[#00FFFF] to-[#39FF14]" },
                { label: language === "Turkish" ? "Sabitlenen" : "Pinned", value: pinnedAssets.length, color: "from-[#39FF14] to-[#00FFFF]" },
              ].map((stat, i) => (
                <div key={i} className="bg-black/20 border border-white/[0.03] rounded-2xl p-4 text-center">
                  <div className={`text-[22px] font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
                  <div className="text-[9px] font-bold text-[#7A7B8D] uppercase tracking-widest mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* My Comments shortcut */}
            <div onClick={() => setProfilePage("comments")} className="bg-gradient-to-r from-[#B24BF3]/10 to-[#5B7FFF]/10 border border-[#B24BF3]/20 rounded-[24px] p-5 mb-4 cursor-pointer hover:from-[#B24BF3]/15 hover:to-[#5B7FFF]/15 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#B24BF3] to-[#5B7FFF] flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <span className="font-bold text-[15px] text-white">{language === "Turkish" ? "Yorumlarım" : "My Comments"}</span>
                    <div className="text-[11px] text-[#7A7B8D]">{userComments.length} {language === "Turkish" ? "toplam yorum" : "total comments"}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#B24BF3]" />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-3">
              {/* Language + AutoTranslate */}
              <div className="bg-black/20 border border-white/[0.03] rounded-[24px] overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-white/[0.03]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#00FFFF]"><Globe className="w-4 h-4" /></div>
                    <div>
                      <div className="font-bold text-[14px] text-white/90">{t.autoTranslate}</div>
                      <div className="text-[10px] text-[#7A7B8D]">{t.translateComments}</div>
                    </div>
                  </div>
                  <div onClick={() => setAutoTranslate(!autoTranslate)} className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${autoTranslate ? "bg-[#39FF14]" : "bg-white/10"}`}>
                    <motion.div animate={{ x: autoTranslate ? 20 : 0 }} className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#39FF14]"><MessageCircle className="w-4 h-4" /></div>
                    <div>
                      <div className="font-bold text-[14px] text-white/90">{t.language}</div>
                      <div className="text-[10px] text-[#7A7B8D]">{t.targetLanguage}</div>
                    </div>
                  </div>
                  <div className="relative z-[60]">
                    <button onClick={(e) => { e.stopPropagation(); setShowLanguageMenu(!showLanguageMenu); }} className="w-full flex items-center justify-between bg-white/[0.03] border border-white/[0.08] px-4 py-3 rounded-xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">{language}</span>
                      <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${showLanguageMenu ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {showLanguageMenu && (
                        <>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { e.stopPropagation(); setShowLanguageMenu(false); }} className="fixed inset-0 z-[61]" />
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full mt-2 left-0 right-0 bg-[#0D0E14]/98 border border-white/[0.1] rounded-xl p-2.5 backdrop-blur-3xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] z-[62] grid grid-cols-2 gap-1.5">
                            {["English", "Turkish", "German", "French", "Spanish", "Italian", "Russian", "Chinese"].map(lang => (
                              <button key={lang} onClick={(e) => { e.stopPropagation(); changeLanguage(lang); }} className={`px-3 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-center ${language === lang ? "bg-white text-black" : "text-white/40 hover:bg-white/5"}`}>{lang}</button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {[
                { icon: <User className="w-5 h-5" />, title: t.accountSettings, page: "account" },
                { icon: <Bell className="w-5 h-5" />, title: t.notifications, page: "notifications" },
                { icon: <Shield className="w-5 h-5" />, title: t.privacySecurity, page: "privacy" },
                { icon: <LogOut className="w-5 h-5" />, title: t.logout, color: "text-[#E50000]", iconBg: "bg-[#E50000] text-black", onClick: () => { setIsLoggedIn(false); setOnboardingStep(0); } },
              ].map((item, i) => (
                <div key={i} onClick={item.onClick || (() => item.page && setProfilePage(item.page))} className="bg-black/20 border border-white/[0.03] rounded-[24px] p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.iconBg || "bg-white/5 text-[#7A7B8D]"}`}>{item.icon}</div>
                    <span className={`font-bold text-[15px] ${item.color || "text-white/90"}`}>{item.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20" />
                </div>
              ))}
            </div>
          </motion.div>

        ) : profilePage === "comments" ? (
          <motion.div key="profile-comments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setProfilePage(null)} className="flex items-center gap-2 text-[#7A7B8D] text-[12px] font-bold uppercase tracking-wider mb-6 hover:text-white transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Profile</button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B24BF3] to-[#5B7FFF] flex items-center justify-center"><MessageCircle className="w-5 h-5 text-black" /></div>
              <div>
                <h3 className="text-xl font-black uppercase">{language === "Turkish" ? "Yorumlarım" : "My Comments"}</h3>
                <p className="text-[11px] text-[#7A7B8D]">{userComments.length} {language === "Turkish" ? "toplam" : "total"}</p>
              </div>
            </div>
            {userComments.length === 0 ? (
              <div className="text-center py-16"><MessageCircle className="w-10 h-10 text-white/10 mx-auto mb-3" /><p className="text-[13px] text-[#7A7B8D]">{language === "Turkish" ? "Henüz yorum yazmadınız." : "No comments yet."}</p></div>
            ) : (
              <div className="space-y-3">
                {userComments.map((uc: any) => (
                  <div key={uc.id} className="bg-black/20 border border-white/[0.03] rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-white">{ASSETS.find(a => a.id === uc.assetId)?.name || uc.assetId}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${uc.sentiment === "Positive" ? "bg-[#39FF14] text-black" : uc.sentiment === "Negative" ? "bg-[#FF3131] text-white" : "bg-[#00FFFF] text-black"}`}>{uc.sentiment}</span>
                      </div>
                      <button onClick={() => deleteComment(uc.id)} className="p-1 hover:bg-white/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-[#7A7B8D]" /></button>
                    </div>
                    <p className="text-[14px] text-white/80 leading-relaxed mb-2">{uc.text}</p>
                    <div className="flex items-center gap-3 text-[10px] text-white/20">
                      <span>${uc.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span>{uc.timeframe}</span>
                      <span>{new Date(uc.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

        ) : profilePage === "account" ? (
          <motion.div key="profile-account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setProfilePage(null)} className="flex items-center gap-2 text-[#7A7B8D] text-[12px] font-bold uppercase tracking-wider mb-6 hover:text-white transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Profile</button>
            <h3 className="text-xl font-black uppercase mb-6">{t.accountSettings}</h3>
            <div className="space-y-4">
              {[
                { label: language === "Turkish" ? "Kullanıcı Adı" : "Username", value: "Gökalp" },
                { label: "Email", value: "gokalp@example.com" },
                { label: language === "Turkish" ? "Üyelik" : "Membership", value: "Pro" },
                { label: language === "Turkish" ? "Katılım Tarihi" : "Joined", value: "2024" },
              ].map((field, i) => (
                <div key={i} className="bg-black/20 border border-white/[0.03] rounded-2xl p-4">
                  <div className="text-[9px] font-bold text-[#7A7B8D] uppercase tracking-widest mb-1">{field.label}</div>
                  <div className="text-[15px] font-bold text-white">{field.value}</div>
                </div>
              ))}
              <button className="w-full py-4 bg-white/5 border border-white/[0.05] rounded-2xl text-[12px] font-black text-white/60 uppercase tracking-widest hover:bg-white/10 transition-colors">
                {language === "Turkish" ? "Profili Düzenle" : "Edit Profile"}
              </button>
            </div>
          </motion.div>

        ) : profilePage === "notifications" ? (
          <motion.div key="profile-notif" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setProfilePage(null)} className="flex items-center gap-2 text-[#7A7B8D] text-[12px] font-bold uppercase tracking-wider mb-6 hover:text-white transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Profile</button>
            <h3 className="text-xl font-black uppercase mb-6">{t.notifications}</h3>
            <div className="space-y-2 mb-8">
              {[
                { icon: <TrendingUp className="w-4 h-4" />, color: "bg-[#39FF14] text-black", user: "@CryptoKing", action: language === "Turkish" ? "yorumunu beğendi" : "liked your comment", asset: "BTC", time: "2m" },
                { icon: <MessageCircle className="w-4 h-4" />, color: "bg-[#00FFFF] text-black", user: "@WhaleWatch", action: language === "Turkish" ? "yorumuna yanıt verdi" : "replied to your comment", asset: "ETH", time: "15m" },
                { icon: <Heart className="w-4 h-4" />, color: "bg-gradient-to-r from-[#B24BF3] to-[#5B7FFF] text-black", user: "@DayTrader", action: language === "Turkish" ? "yorumunu beğendi" : "liked your comment", asset: "AAPL", time: "2h" },
                { icon: <TrendingDown className="w-4 h-4" />, color: "bg-[#FF3131] text-white", user: "@BearHunter", action: language === "Turkish" ? "yorumunu beğenmedi" : "downvoted your comment", asset: "TSLA", time: "5h" },
                { icon: <Newspaper className="w-4 h-4" />, color: "bg-white text-black", user: "Market Pulse", action: language === "Turkish" ? "BTC için önemli haber" : "Breaking news for BTC", asset: "BTC", time: "6h" },
              ].map((n, i) => (
                <div key={i} className="bg-black/20 border border-white/[0.03] rounded-2xl p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color}`}>{n.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-white/90 leading-snug"><span className="font-bold">{n.user}</span> {n.action}</div>
                    <div className="text-[10px] text-[#7A7B8D] mt-0.5">{n.asset} • {n.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] font-black text-[#7A7B8D] uppercase tracking-widest mb-3">{language === "Turkish" ? "Bildirim Ayarları" : "Notification Settings"}</div>
            <div className="space-y-3">
              <NotifToggle label={language === "Turkish" ? "Fiyat Uyarıları" : "Price Alerts"} desc={language === "Turkish" ? "Fiyat hedefine ulaşıldığında" : "When price targets are hit"} defaultOn={true} />
              <NotifToggle label={language === "Turkish" ? "Yorum Yanıtları" : "Comment Replies"} desc={language === "Turkish" ? "Yorumlarına yanıt geldiğinde" : "When someone replies"} defaultOn={true} />
              <NotifToggle label={language === "Turkish" ? "Beğeniler" : "Likes"} desc={language === "Turkish" ? "Yorumların beğenildiğinde" : "When your comments are liked"} defaultOn={true} />
              <NotifToggle label={language === "Turkish" ? "Piyasa Haberleri" : "Market News"} desc={language === "Turkish" ? "Önemli piyasa haberleri" : "Important market news"} defaultOn={false} />
            </div>
          </motion.div>

        ) : profilePage === "privacy" ? (
          <motion.div key="profile-privacy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setProfilePage(null)} className="flex items-center gap-2 text-[#7A7B8D] text-[12px] font-bold uppercase tracking-wider mb-6 hover:text-white transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Profile</button>
            <h3 className="text-xl font-black uppercase mb-6">{t.privacySecurity}</h3>
            <div className="space-y-3">
              <NotifToggle label={language === "Turkish" ? "Profil Gizliliği" : "Profile Visibility"} desc={language === "Turkish" ? "Profilini kimler görebilir" : "Who can see your profile"} defaultOn={true} />
              <NotifToggle label={language === "Turkish" ? "Yorum Geçmişi" : "Comment History"} desc={language === "Turkish" ? "Yorum geçmişini herkese göster" : "Show comment history publicly"} defaultOn={false} />
              <NotifToggle label={language === "Turkish" ? "Konum Verisi" : "Location Data"} desc={language === "Turkish" ? "Konum bilgisi paylaşımı" : "Share location with comments"} defaultOn={false} />
              <NotifToggle label={language === "Turkish" ? "Analitik" : "Analytics"} desc={language === "Turkish" ? "Kullanım verisi paylaşımı" : "Share usage data for improvements"} defaultOn={true} />
              <div className="mt-6 space-y-3">
                <button className="w-full py-4 bg-white/5 border border-white/[0.05] rounded-2xl text-[12px] font-black text-white/60 uppercase tracking-widest hover:bg-white/10 transition-colors">{language === "Turkish" ? "Verileri Dışa Aktar" : "Export Data"}</button>
                <button className="w-full py-4 bg-[#E50000]/10 border border-[#E50000]/20 rounded-2xl text-[12px] font-black text-[#E50000] uppercase tracking-widest hover:bg-[#E50000]/20 transition-colors">{language === "Turkish" ? "Hesabı Sil" : "Delete Account"}</button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
