import UploadCard from "@/app/components/UploadCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="animate-float absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-100/60 to-violet-100/40 blur-3xl" />
        <div className="animate-float-delayed absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-sky-100/50 to-blue-100/30 blur-3xl" />
        <div className="animate-float-slow absolute bottom-20 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-purple-100/40 to-pink-100/30 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          {/* Logo icon */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200/50">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Pro<span className="text-indigo-600">Shot</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
          <a
            href="#features"
            className="hover:text-indigo-600 transition-colors duration-200"
          >
            기능
          </a>
          <a
            href="#how-it-works"
            className="hover:text-indigo-600 transition-colors duration-200"
          >
            사용방법
          </a>
          <a
            href="#"
            className="px-5 py-2.5 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-all duration-200 hover:shadow-lg hover:shadow-slate-300/30"
          >
            시작하기
          </a>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-20 md:pt-24 md:pb-32 lg:pt-32 lg:pb-40 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-sm font-medium text-indigo-700">
              AI 기반 프로필 사진 생성
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] text-balance mb-6">
            셀카 한 장으로
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
              AI 프로필 사진
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed mb-10 text-balance">
            스튜디오 방문 없이, 셀카 한 장이면 충분합니다.
            <br className="hidden sm:block" />
            AI가 몇 분 안에 전문적인 헤드샷을 만들어 드립니다.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            <button className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-lg font-bold shadow-xl shadow-indigo-300/40 hover:shadow-2xl hover:shadow-indigo-300/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 animate-pulse-glow flex items-center gap-2.5">
              내 헤드샷 만들기
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:translate-x-1 transition-transform duration-200"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
            <button className="px-8 py-4 bg-white text-slate-700 rounded-2xl text-lg font-semibold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-lg transition-all duration-200">
              샘플 보기
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex -space-x-3">
              {["bg-gradient-to-br from-rose-400 to-pink-500", "bg-gradient-to-br from-amber-400 to-orange-500", "bg-gradient-to-br from-emerald-400 to-teal-500", "bg-gradient-to-br from-sky-400 to-blue-500", "bg-gradient-to-br from-violet-400 to-purple-500"].map(
                (gradient, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full ${gradient} border-[3px] border-white shadow-sm flex items-center justify-center`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="white"
                      opacity="0.9"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )
              )}
            </div>
            <p className="text-sm text-slate-400 font-medium">
              <span className="text-slate-700 font-bold">12,000+</span>명이
              이미 사용 중
            </p>
          </div>
        </section>

        {/* Upload Section */}
        <section id="upload" className="px-6 pb-20 md:pb-32 max-w-5xl mx-auto">
          <UploadCard />
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 pb-20 md:pb-32 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              왜 ProShot인가요?
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              간편하고 빠르게, 전문적인 결과물을 만들어 보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature Card 1 */}
            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                5분이면 완성
              </h3>
              <p className="text-slate-500 leading-relaxed">
                셀카를 업로드하면 AI가 즉시 분석을 시작합니다. 단 5분이면
                스튜디오급 프로필 사진을 받아보실 수 있습니다.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-100 hover:border-violet-100 hover:shadow-xl hover:shadow-violet-50/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                다양한 스타일
              </h3>
              <p className="text-slate-500 leading-relaxed">
                비즈니스, 크리에이티브, 캐주얼 등 다양한 프로필 스타일을 선택할 수
                있습니다. 용도에 맞는 완벽한 사진을 만들어 보세요.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-100 hover:border-purple-100 hover:shadow-xl hover:shadow-purple-50/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 12 15 16 10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                안전한 데이터
              </h3>
              <p className="text-slate-500 leading-relaxed">
                업로드한 사진은 처리 후 즉시 삭제됩니다. 개인정보 보호를 최우선으로
                생각하며, 데이터는 안전하게 관리됩니다.
              </p>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="px-6 pb-20 md:pb-32 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              간단한 3단계
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              복잡한 과정 없이 누구나 쉽게 사용할 수 있어요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "셀카 업로드",
                desc: "스마트폰으로 찍은 셀카 한 장을 업로드하세요",
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
                title: "스타일 선택",
                desc: "원하는 프로필 스타일과 배경을 선택하세요",
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
                title: "결과 다운로드",
                desc: "AI가 생성한 고품질 프로필 사진을 저장하세요",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step number */}
                <span className="text-6xl font-black text-indigo-50 absolute -top-4 select-none">
                  {item.step}
                </span>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-indigo-200/50">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 pb-20 md:pb-32 max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-10 md:p-16 text-center text-white overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                지금 바로 시작하세요
              </h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-lg mx-auto">
                셀카 한 장이면 전문적인 프로필 사진이 완성됩니다.
                <br className="hidden sm:block" />
                더 이상 비싼 스튜디오 촬영은 필요 없어요.
              </p>
              <button className="px-8 py-4 bg-white text-indigo-700 rounded-2xl text-lg font-bold hover:bg-indigo-50 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-xl">
                내 헤드샷 만들기 →
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8 md:px-12 lg:px-20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-600 tracking-wide">
              ProShot — AI CITY BUILDERS
            </span>
          </div>
          <p className="text-xs text-slate-400">
            © 2026 ProShot. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
