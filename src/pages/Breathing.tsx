import { Wind } from "lucide-react";

const Breathing = () => (
  <div className="px-5 pt-16 flex flex-col items-center text-center">
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-mint blur-3xl opacity-50 rounded-full animate-breathe" />
      <div className="relative w-32 h-32 rounded-full bg-gradient-mint shadow-glow flex items-center justify-center animate-breathe">
        <Wind className="w-12 h-12 text-white" strokeWidth={1.5} />
      </div>
    </div>
    <h1 className="text-2xl font-bold text-navy mt-10">호흡 가이드</h1>
    <p className="text-navy-soft/70 mt-3 leading-relaxed">
      4-7-8 · 박스 호흡 · 8-2-8 등<br />
      마음을 차분하게 다스리는 호흡법을<br />
      곧 만나보실 수 있어요.
    </p>
    <span className="mt-8 px-4 py-2 rounded-full bg-mint/30 text-mint-deep text-sm font-semibold">
      준비 중 🌿
    </span>
  </div>
);

export default Breathing;
