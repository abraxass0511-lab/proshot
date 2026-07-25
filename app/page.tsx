import UploadCard from "@/app/components/UploadCard";
import { Testimonials } from "@/app/components/Testimonials";
import { FAQ } from "@/app/components/FAQ";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/80 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="animate-float absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-100/60 to-violet-100/40 blur-3xl" />
        <div className="animate-float-delayed absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-sky-100/50 to-blue-100/30 blur-3xl" />
        <div className="animate-float-slow absolute bottom-20 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-purple-100/40 to-pink-100/30 blur-3xl" />
      </div>

      {/* ═══════════ Navigation ═══════════ */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <a href="#" className="flex items-center gap-2.5 focus-visible:outline-none" aria-label="ProShot \ud648">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200/50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Pro<span className="text-indigo-600">Shot</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
          <a href="#features" className="hover:text-indigo-600 transition-colors duration-200">
            {"\uae30\ub2a5"}
          </a>
          <a href="#how-it-works" className="hover:text-indigo-600 transition-colors duration-200">
            {"\uc0ac\uc6a9\ubc29\ubc95"}
          </a>
          <a href="#testimonials" className="hover:text-indigo-600 transition-colors duration-200">
            {"\ud6c4\uae30"}
          </a>
          <a href="#faq" className="hover:text-indigo-600 transition-colors duration-200">
            FAQ
          </a>
          <a
            href="#upload"
            className="px-5 py-2.5 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-all duration-200 hover:shadow-lg hover:shadow-slate-300/30 active:scale-[0.97]"
          >
            {"\uc2dc\uc791\ud558\uae30"}
          </a>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors" aria-label={"\uba54\ub274 \uc5f4\uae30"}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </nav>

      {/* ═══════════ Hero Section ═══════════ */}
      <main className="relative z-10">
        <section className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-20 md:pt-24 md:pb-32 lg:pt-32 lg:pb-40 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-sm font-medium text-indigo-700">
              {"AI \uae30\ubc18 \ud504\ub85c\ud544 \uc0ac\uc9c4 \uc0dd\uc131"}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] text-balance mb-6 animate-fade-in-up stagger-1">
            {"\uc140\uce74 \ud55c \uc7a5\uc73c\ub85c"}
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
              {"AI \ud504\ub85c\ud544 \uc0ac\uc9c4"}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed mb-10 text-balance animate-fade-in-up stagger-2">
            {"\uc2a4\ud29c\ub514\uc624 \ubc29\ubb38 \uc5c6\uc774, \uc140\uce74 \ud55c \uc7a5\uc774\uba74 \ucda9\ubd84\ud569\ub2c8\ub2e4."}
            <br className="hidden sm:block" />
            {"AI\uac00 \uba87 \ubd84 \uc548\uc5d0 \uc804\ubb38\uc801\uc778 \ud5e4\ub4dc\uc0f7\uc744 \ub9cc\ub4e4\uc5b4 \ub4dc\ub9bd\ub2c8\ub2e4."}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 animate-fade-in-up stagger-3">
            <a
              href="#upload"
              className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-lg font-bold shadow-xl shadow-indigo-300/40 hover:shadow-2xl hover:shadow-indigo-300/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 animate-pulse-glow flex items-center gap-2.5"
            >
              {"\ub0b4 \ud5e4\ub4dc\uc0f7 \ub9cc\ub4e4\uae30"}
              <svg
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="group-hover:translate-x-1 transition-transform duration-200"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-white text-slate-700 rounded-2xl text-lg font-semibold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
            >
              {"\uc0ac\uc6a9\ubc29\ubc95 \ubcf4\uae30"}
            </a>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col items-center gap-3 animate-fade-in-up stagger-3">
            <div className="flex -space-x-3">
              {["bg-gradient-to-br from-rose-400 to-pink-500", "bg-gradient-to-br from-amber-400 to-orange-500", "bg-gradient-to-br from-emerald-400 to-teal-500", "bg-gradient-to-br from-sky-400 to-blue-500", "bg-gradient-to-br from-violet-400 to-purple-500"].map(
                (gradient, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full ${gradient} border-[3px] border-white shadow-sm flex items-center justify-center`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity="0.9">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )
              )}
            </div>
            <p className="text-sm text-slate-400 font-medium">
              <span className="text-slate-700 font-bold">12,000+</span>{"\uba85\uc774 \uc774\ubbf8 \uc0ac\uc6a9 \uc911"}
            </p>
          </div>
        </section>

        {/* ═══════════ Upload Section ═══════════ */}
        <section id="upload" className="px-6 pb-20 md:pb-32 max-w-5xl mx-auto">
          <UploadCard />
        </section>

        {/* ═══════════ Features Section ═══════════ */}
        <section id="features" className="px-6 pb-20 md:pb-32 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-indigo-600 tracking-wider uppercase mb-3">Features</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              {"\uc65c ProShot\uc778\uac00\uc694?"}
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              {"\uac04\ud3b8\ud558\uace0 \ube60\ub974\uac8c, \uc804\ubb38\uc801\uc778 \uacb0\uacfc\ubb3c\uc744 \ub9cc\ub4e4\uc5b4 \ubcf4\uc138\uc694"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: "5\ubd84\uc774\uba74 \uc644\uc131",
                desc: "\uc140\uce74\ub97c \uc5c5\ub85c\ub4dc\ud558\uba74 AI\uac00 \uc989\uc2dc \ubd84\uc11d\uc744 \uc2dc\uc791\ud569\ub2c8\ub2e4. \ub2e8 5\ubd84\uc774\uba74 \uc2a4\ud29c\ub514\uc624\uae09 \ud504\ub85c\ud544 \uc0ac\uc9c4\uc744 \ubc1b\uc544\ubcf4\uc2e4 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
                stroke: "#6366f1",
                gradient: "from-indigo-50 to-indigo-100",
                hoverBorder: "hover:border-indigo-200",
                hoverShadow: "hover:shadow-indigo-50/50",
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                ),
              },
              {
                title: "\ub2e4\uc591\ud55c \uc2a4\ud0c0\uc77c",
                desc: "\ube44\uc988\ub2c8\uc2a4, \ud06c\ub9ac\uc5d0\uc774\ud2f0\ube0c, \uce90\uc8fc\uc5bc \ub4f1 \ub2e4\uc591\ud55c \ud504\ub85c\ud544 \uc2a4\ud0c0\uc77c\uc744 \uc120\ud0dd\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4. \uc6a9\ub3c4\uc5d0 \ub9de\ub294 \uc644\ubcbd\ud55c \uc0ac\uc9c4\uc744 \ub9cc\ub4e4\uc5b4 \ubcf4\uc138\uc694.",
                stroke: "#8b5cf6",
                gradient: "from-violet-50 to-violet-100",
                hoverBorder: "hover:border-violet-200",
                hoverShadow: "hover:shadow-violet-50/50",
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                ),
              },
              {
                title: "\uc548\uc804\ud55c \ub370\uc774\ud130",
                desc: "\uc5c5\ub85c\ub4dc\ud55c \uc0ac\uc9c4\uc740 \ucc98\ub9ac \ud6c4 \uc989\uc2dc \uc0ad\uc81c\ub429\ub2c8\ub2e4. \uac1c\uc778\uc815\ubcf4 \ubcf4\ud638\ub97c \ucd5c\uc6b0\uc120\uc73c\ub85c \uc0dd\uac01\ud558\uba70, \ub370\uc774\ud130\ub294 \uc548\uc804\ud558\uac8c \uad00\ub9ac\ub429\ub2c8\ub2e4.",
                stroke: "#a855f7",
                gradient: "from-purple-50 to-purple-100",
                hoverBorder: "hover:border-purple-200",
                hoverShadow: "hover:shadow-purple-50/50",
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 12 15 16 10" />
                  </svg>
                ),
              },
            ].map((feat, i) => (
              <div
                key={i}
                className={`group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-100 ${feat.hoverBorder} hover:shadow-xl ${feat.hoverShadow} transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ How it Works ═══════════ */}
        <section id="how-it-works" className="px-6 pb-20 md:pb-32 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-indigo-600 tracking-wider uppercase mb-3">How it works</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              {"\uac04\ub2e8\ud55c 3\ub2e8\uacc4"}
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              {"\ubcf5\uc7a1\ud55c \uacfc\uc815 \uc5c6\uc774 \ub204\uad6c\ub098 \uc27d\uac8c \uc0ac\uc6a9\ud560 \uc218 \uc788\uc5b4\uc694"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "\uc140\uce74 \uc5c5\ub85c\ub4dc",
                desc: "\uc2a4\ub9c8\ud2b8\ud3f0\uc73c\ub85c \ucc0d\uc740 \uc140\uce74 \ud55c \uc7a5\uc744 \uc5c5\ub85c\ub4dc\ud558\uc138\uc694",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "\uc2a4\ud0c0\uc77c \uc120\ud0dd",
                desc: "\uc6d0\ud558\ub294 \ud504\ub85c\ud544 \uc2a4\ud0c0\uc77c\uacfc \ubc30\uacbd\uc744 \uc120\ud0dd\ud558\uc138\uc694",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="13.5" cy="6.5" r="2.5" />
                    <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z" />
                    <path d="M5.5 22C7 15 10 12 14 12c2 0 3.5 1 5 3" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "\uacb0\uacfc \ub2e4\uc6b4\ub85c\ub4dc",
                desc: "AI\uac00 \uc0dd\uc131\ud55c \uace0\ud488\uc9c8 \ud504\ub85c\ud544 \uc0ac\uc9c4\uc744 \uc800\uc7a5\ud558\uc138\uc694",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center group">
                <span className="text-6xl font-black text-indigo-50 absolute -top-4 select-none" aria-hidden="true">
                  {item.step}
                </span>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-indigo-200/50 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ Testimonials ═══════════ */}
        <Testimonials />

        {/* ═══════════ FAQ ═══════════ */}
        <FAQ />

        {/* ═══════════ CTA Section ═══════════ */}
        <section className="px-6 pb-20 md:pb-32 max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-10 md:p-16 text-center text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" aria-hidden="true" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                {"\uc9c0\uae08 \ubc14\ub85c \uc2dc\uc791\ud558\uc138\uc694"}
              </h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-lg mx-auto">
                {"\uc140\uce74 \ud55c \uc7a5\uc774\uba74 \uc804\ubb38\uc801\uc778 \ud504\ub85c\ud544 \uc0ac\uc9c4\uc774 \uc644\uc131\ub429\ub2c8\ub2e4."}
                <br className="hidden sm:block" />
                {"\ub354 \uc774\uc0c1 \ube44\uc2fc \uc2a4\ud29c\ub514\uc624 \ucd2c\uc601\uc740 \ud544\uc694 \uc5c6\uc5b4\uc694."}
              </p>
              <a
                href="#upload"
                className="inline-block px-8 py-4 bg-white text-indigo-700 rounded-2xl text-lg font-bold hover:bg-indigo-50 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-xl"
              >
                {"\ub0b4 \ud5e4\ub4dc\uc0f7 \ub9cc\ub4e4\uae30 \u2192"}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════ Footer ═══════════ */}
      <footer className="relative z-10 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8 md:px-12 lg:px-20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-600 tracking-wide">
              ProShot &mdash; AI CITY BUILDERS
            </span>
          </div>
          <p className="text-xs text-slate-400">
            &copy; 2026 ProShot. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
