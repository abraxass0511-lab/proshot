const TESTIMONIALS = [
  {
    quote:
      "\ub9c1\ud06c\ub4dc\uc778 \ud504\ub85c\ud544 \uc0ac\uc9c4\uc744 \ubc14\uafb8\uace0 \uc2f6\uc5c8\ub294\ub370, \uc2a4\ud29c\ub514\uc624 \uc608\uc57d\ud558\uae30 \uadc0\ucc2e\uc558\uac70\ub4e0\uc694. ProShot\uc73c\ub85c 3\ubd84 \ub9cc\uc5d0 \uc644\ubcbd\ud55c \ud5e4\ub4dc\uc0f7\uc744 \uc5bb\uc5c8\uc2b5\ub2c8\ub2e4!",
    name: "\uae40\uc9c0\uc218",
    role: "UX \ub514\uc790\uc774\ub108",
    gradient: "from-rose-400 to-pink-500",
  },
  {
    quote:
      "\uc7ac\ud0dd\uadfc\ubb34 \uc911\uc774\ub77c \uc2a4\ud29c\ub514\uc624\uc5d0 \uac08 \uc2dc\uac04\uc774 \uc5c6\uc5c8\ub294\ub370, \uc140\uce74 \ud55c \uc7a5\uc73c\ub85c \uc774\ub807\uac8c \ud504\ub85c\ud398\uc154\ub110\ud55c \uacb0\uacfc\ubb3c\uc774 \ub098\uc62c \uc904 \ubab0\ub790\uc5b4\uc694. \uac15\ub825 \ucd94\ucc9c\ud569\ub2c8\ub2e4.",
    name: "\ubc15\uc2b9\ud604",
    role: "\uc2a4\ud0c0\ud2b8\uc5c5 \ub300\ud45c",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    quote:
      "\uce5c\uad6c \ucd94\ucc9c\uc73c\ub85c \uc0ac\uc6a9\ud574\ubd24\ub294\ub370 \uc9c4\uc9dc \uc2a0\uae30\ud574\uc694. AI\uac00 \uc774\ub807\uac8c \uc790\uc5f0\uc2a4\ub7ec\uc6b4 \ud504\ub85c\ud544 \uc0ac\uc9c4\uc744 \ub9cc\ub4e4\uc5b4 \uc8fc\ub2e4\ub2c8, \uc8fc\ubcc0\uc5d0 \ub9ce\uc774 \uc54c\ub824\uc8fc\uace0 \uc788\uc5b4\uc694!",
    name: "\uc774\uc608\uc9c4",
    role: "\ub300\ud559\uc6d0\uc0dd",
    gradient: "from-sky-400 to-blue-500",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="px-6 pb-20 md:pb-32 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <span className="inline-block text-sm font-semibold text-indigo-600 tracking-wider uppercase mb-3">
          Testimonials
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          {"\uc0ac\uc6a9\uc790 \ud6c4\uae30"}
        </h2>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">
          {"\uc774\ubbf8 \ub9ce\uc740 \ubd84\ub4e4\uc774 ProShot\uc744 \uacbd\ud5d8\ud558\uace0 \uc788\uc2b5\ub2c8\ub2e4"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={i}
            className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/40 transition-all duration-300 hover:-translate-y-1 flex flex-col"
          >
            {/* Stars */}
            <div className="flex gap-1 mb-5" aria-label={"\ubcc4\uc810 5\uc810 \ub9cc\uc810\uc5d0 5\uc810"}>
              {Array.from({ length: 5 }).map((_, j) => (
                <svg key={j} width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-slate-600 leading-relaxed flex-1 mb-6">
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            {/* Author */}
            <figcaption className="flex items-center gap-3 pt-5 border-t border-slate-100">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-sm`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity="0.9">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-400">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
