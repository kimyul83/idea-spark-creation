/**
 * 상황별 전문적 상세 정보.
 * 6개 상황만 운영. 음악 트랙 제거 — 자연 사운드만 사용.
 */

export interface SituationDetail {
  id: string;
  mood: string;
  scene: string;
  effect: string;
  frequencyLabel: string;
  frequencyScience: string;
  genreTags: string[];
}

export const SITUATION_DETAILS: Record<string, SituationDetail> = {
  sleep: {
    id: "sleep",
    mood: "깊이 잠들기",
    scene: "베개에 머리를 파묻고 온전히 내려놓기",
    effect: "Delta파 유도 · 수면 효율 +23%",
    frequencyLabel: "Delta 2 Hz",
    frequencyScience: "Northwestern 2017 임상 · Pink noise 검증",
    genreTags: ["Cricket Night", "Calm Ocean"],
  },
  relax: {
    id: "relax",
    mood: "물소리 힐링",
    scene: "흐르는 물·시냇물·잔잔한 파도에 마음을 흘려보내요",
    effect: "심박 안정 · 부교감신경 활성",
    frequencyLabel: "432 Hz",
    frequencyScience: "HRV(심박변이도) 개선 · 코르티솔 감소",
    genreTags: ["Stream", "Waves", "Waterfall"],
  },
  focus: {
    id: "focus",
    mood: "몰입하기",
    scene: "책상 앞 한 가지 일에 집중해요",
    effect: "Gamma파 자극 · 작업 기억 향상 · 주의력 유지",
    frequencyLabel: "Gamma 40 Hz",
    frequencyScience: "MIT 알츠하이머 임상 · 신경 동조",
    genreTags: ["Rain", "Waterfall", "Pink Noise"],
  },
  mountain: {
    id: "mountain",
    mood: "자연에 머물기",
    scene: "숲의 새소리·바람·따뜻한 모닥불",
    effect: "Forest Bathing · 코르티솔 -50%",
    frequencyLabel: "7.83 Hz",
    frequencyScience: "Schumann 지구 공명 · 자연 동조",
    genreTags: ["Forest", "Wind", "Bonfire"],
  },
  tropical: {
    id: "tropical",
    mood: "풀밭에 누워 힐링",
    scene: "여름 풀밭의 새소리·잎사귀·따뜻한 햇살",
    effect: "세로토닌 상승 · 스트레스 -50%",
    frequencyLabel: "Alpha 8 Hz",
    frequencyScience: "Beach Therapy · 산림욕 효과",
    genreTags: ["Meadow", "Birdsong", "Grassland"],
  },
  reading: {
    id: "reading",
    mood: "조용히 책읽기",
    scene: "따뜻한 빛 아래 책장을 넘겨요",
    effect: "Alpha 상태 · 편안한 집중",
    frequencyLabel: "Alpha 10 Hz",
    frequencyScience: "독서 최적 뇌파 · 카페 masking",
    genreTags: ["Light Rain", "Soft Birds"],
  },
};

export const getSituationDetail = (id: string): SituationDetail | undefined =>
  SITUATION_DETAILS[id];
