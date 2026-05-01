import { X, Moon, Brain, Sparkles, Heart, AlertTriangle, Info } from "lucide-react";

/** 사운드 믹스 가이드 — 어떤 조합이 어떤 효과를 내는지 과학 기반 설명. */
export const MusicGuideSheet = ({ onClose }: { onClose: () => void }) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-md flex items-end sm:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="liquid-card w-full max-w-md p-5 my-4 max-h-[90vh] overflow-y-auto animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4 sticky top-0 bg-background/80 backdrop-blur-md -mx-5 px-5 py-2 rounded-t-2xl">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-primary" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <h2 className="text-[18px] font-bold text-foreground leading-tight">사운드 믹스 가이드</h2>
            <p className="text-[12px] text-foreground/60 mt-0.5">어떻게 섞으면 어떤 효과가 있는지</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/40 hover:text-foreground/70">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 기본 원리 */}
        <Section title="기본 원리" subtitle="자연 + 노이즈 + 뇌파의 3중 레이어">
          <p className="text-[12px] text-foreground/70 leading-relaxed">
            자연 사운드는 <b className="text-primary">감정 안정</b>, 노이즈는 <b className="text-primary">주변 잡음 차단</b>,
            특정 Hz 톤은 <b className="text-primary">뇌파 유도</b>. 셋을 같이 틀면 효과가 1+1+1 = 3 이 아니라
            5~7로 시너지 남.
          </p>
        </Section>

        {/* 수면 콤보 */}
        <Combo
          Icon={Moon}
          title="🥇 깊은 수면"
          tracks={["🌧️ 빗소리", "🟫 브라운 노이즈", "🌙 밤풀벌레"]}
          desc="멜라토닌 분비 트리플 자극. 빗소리(고주파 마스킹) + 브라운(저주파 채움) + 풀벌레(중주파 변화) → 전 주파수 균형."
        />

        {/* HRV 안정 */}
        <Combo
          Icon={Heart}
          title="🥈 자율신경 안정"
          tracks={["🌊 바다 파도", "🎵 528Hz", "🟫 브라운 노이즈"]}
          desc="0.5Hz 파도 = 코히어런트 호흡(분당 6회) 자연 유도. 528Hz 옥시토신 톤. 임상에서 HRV ↑ 검증됨."
        />

        {/* 빠른 잠 */}
        <Combo
          Icon={Sparkles}
          title="💧 빠른 진정"
          tracks={["💧 시냇물", "🟫 브라운 노이즈"]}
          desc="알파파 유도(시냇물) + 저주파 채움(브라운). 단순하지만 강력. 누우면 5~10분 안에 잠."
        />

        {/* 집중 */}
        <Combo
          Icon={Brain}
          title="🧠 깊은 집중 (낮)"
          tracks={["☕ 카페", "⚪ 화이트 노이즈", "🎵 40Hz"]}
          desc="감마파(40Hz) 자극 → 작업기억 ↑. MIT 임상에서 알츠하이머 인지 개선까지 보고. 카페 + 화이트는 외부 잡음 완벽 차단."
          badge="수면 ❌"
        />

        {/* 추천 안 함 */}
        <Section title="⚠️ 수면에 안 좋은 조합" subtitle="이건 피하세요">
          <ul className="space-y-1.5 text-[12px] text-foreground/70">
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
              <span><b>40Hz 감마파</b> — 각성 주파수, 잠 절대 안 옴</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
              <span><b>화이트 노이즈</b> — 베타파 자극, 너무 자극적</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
              <span><b>새소리</b> — 새벽 = 일어나란 신호로 뇌가 인식</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
              <span><b>카페 소음</b> — 사회적 자극, 잠보단 집중용</span>
            </li>
          </ul>
        </Section>

        {/* 볼륨 팁 */}
        <Section title="🔊 볼륨 균형 팁" subtitle="각 타일 길게 누르면 볼륨 조절">
          <p className="text-[12px] text-foreground/70 leading-relaxed">
            기본값은 <b>자연(45%) · 노이즈(13%) · 톤(9%)</b> — 자연이 메인, 나머지는 underlying 텍스처.
            너무 작으면 노이즈/톤 살짝 ↑, 너무 자극적이면 자연 ↓.
          </p>
        </Section>

        {/* 닫기 */}
        <button
          onClick={onClose}
          className="w-full mt-4 h-11 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform"
        >
          알겠어요
        </button>
      </div>
    </div>
  );
};

const Section = ({
  title, subtitle, children,
}: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <div className="mb-4 pt-1">
    <h3 className="text-[13px] font-bold text-foreground">{title}</h3>
    {subtitle && <p className="text-[10px] text-foreground/45 mb-1.5">{subtitle}</p>}
    {children}
  </div>
);

const Combo = ({
  Icon, title, tracks, desc, badge,
}: {
  Icon: any; title: string; tracks: string[]; desc: string; badge?: string;
}) => (
  <div className="liquid-card p-3.5 mb-2.5 bg-primary/5">
    <div className="flex items-start gap-2.5 mb-2">
      <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-primary" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-[13px] font-bold text-foreground">{title}</p>
          {badge && <span className="text-[9px] font-semibold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">{badge}</span>}
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {tracks.map((t) => (
            <span key={t} className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">{t}</span>
          ))}
        </div>
      </div>
    </div>
    <p className="text-[11px] text-foreground/65 leading-relaxed">{desc}</p>
  </div>
);
