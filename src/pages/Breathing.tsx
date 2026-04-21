import { Wind } from "lucide-react";

const Breathing = () => (
  <div className="px-5 pt-16 flex flex-col items-center text-center relative">
    <div className="blob w-[300px] h-[300px] top-10 opacity-30 bg-sage -z-10" />

    <p className="text-[11px] tracking-[0.3em] uppercase text-sage-deep font-serif">Breathing</p>
    <h1 className="text-[28px] font-bold text-charcoal mt-1">호흡 가이드</h1>

    <div className="relative mt-12">
      <div className="absolute inset-0 bg-sage blur-3xl opacity-40 rounded-full animate-breathe" />
      <div className="relative w-32 h-32 rounded-full bg-sage-deep shadow-soft flex items-center justify-center animate-breathe">
        <Wind className="w-12 h-12 text-cream" strokeWidth={1.5} />
      </div>
    </div>

    <p className="text-charcoal/60 mt-12 leading-relaxed">
      4-7-8 · 박스 호흡 · 8-2-8 등<br />
      마음을 차분하게 다스리는 호흡법을<br />
      곧 만나보실 수 있어요.
    </p>
    <span className="mt-8 px-4 py-2 rounded-full bg-sage/40 text-sage-deep text-sm font-semibold">
      준비 중 🌿
    </span>
  </div>
);

export default Breathing;
