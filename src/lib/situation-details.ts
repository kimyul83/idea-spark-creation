/**
 * 상황별 전문적 상세 정보.
 * "풀밭에 누워 힐링 · Alpha 8Hz · 심박 안정" 같은 임상·설명 텍스트.
 */

export interface SituationDetail {
  id: string;
  // 간결한 감정 태그
  mood: string;
  // 사용 장면 (시적·구체적)
  scene: string;
  // 기대 효과 (과학 근거 기반)
  effect: string;
  // 주파수 과학 설명
  frequencyLabel: string;
  frequencyScience: string;
  // 음악 장르 태그
  genreTags: string[];
}

export const SITUATION_DETAILS: Record<string, SituationDetail> = {
  relax: {
    id: "relax",
    mood: "나른해지기",
    scene: "푹신한 소파에 몸을 맡기고 눈을 감아요",
    effect: "심박 안정 · 긴장 완화 · 부교감신경 활성",
    frequencyLabel: "432 Hz",
    frequencyScience: "HRV(심박변이도) 개선 · 코르티솔 감소",
    genreTags: ["Ambient", "Piano", "Dreamy"],
  },
  meditate: {
    id: "meditate",
    mood: "비워내기",
    scene: "방석 위에 앉아 호흡만 느껴요",
    effect: "Theta파 유도 · 마음챙김 · 창의력 향상",
    frequencyLabel: "Theta 5 Hz",
    frequencyScience: "명상 뇌파 · 깊은 내면 탐색 · EEG 검증",
    genreTags: ["Meditation", "Tibetan", "Ethereal"],
  },
  focus: {
    id: "focus",
    mood: "몰입하기",
    scene: "책상 앞 한 가지 일에 집중해요",
    effect: "Gamma파 자극 · 작업 기억 향상 · 주의력 유지",
    frequencyLabel: "Gamma 40 Hz",
    frequencyScience: "MIT 알츠하이머 임상 · 신경 동조",
    genreTags: ["Lo-fi", "Minimal", "Ambient"],
  },
  nap: {
    id: "nap",
    mood: "살짝 눈 감기",
    scene: "15~20분, 오후의 짧은 회복",
    effect: "Alpha파 유도 · 각성 유지 · 인지 회복",
    frequencyLabel: "Alpha 10 Hz",
    frequencyScience: "NASA Power Nap 연구 · 얕은 수면 최적",
    genreTags: ["Soft Piano", "Rain", "Dreamy"],
  },
  wake: {
    id: "wake",
    mood: "부드럽게 깨기",
    scene: "햇살이 커튼을 스며드는 아침",
    effect: "Beta파 점진 · 코르티솔 자연 상승 · 각성",
    frequencyLabel: "Beta 15 Hz",
    frequencyScience: "Circadian rhythm · 자연 각성 유도",
    genreTags: ["Uplifting", "Birdsong", "Morning"],
  },
  sleep: {
    id: "sleep",
    mood: "깊이 잠들기",
    scene: "베개에 머리를 파묻고 온전히 내려놓기",
    effect: "Delta파 유도 · 수면 효율 +23%",
    frequencyLabel: "Delta 2 Hz",
    frequencyScience: "Northwestern 2017 임상 · Pink noise 검증",
    genreTags: ["Drone", "Sleep", "Deep Space"],
  },
  reading: {
    id: "reading",
    mood: "조용히 읽기",
    scene: "따뜻한 빛 아래 책장을 넘겨요",
    effect: "Alpha 상태 · 집중 · 편안한 각성",
    frequencyLabel: "Alpha 10 Hz",
    frequencyScience: "독서 최적 뇌파 · 카페 소음 masking",
    genreTags: ["Piano", "Café", "Soft"],
  },
  wine: {
    id: "wine",
    mood: "여유 즐기기",
    scene: "와인 잔을 기울이는 저녁",
    effect: "부교감 활성 · 이완 · 세련된 무드",
    frequencyLabel: "Alpha 8 Hz",
    frequencyScience: "HRV 안정 · 릴렉스 상태",
    genreTags: ["Jazz", "Lounge", "Bossa"],
  },
  date: {
    id: "date",
    mood: "설레기",
    scene: "둘만의 시간, 촛불 옆 대화",
    effect: "옥시토신 분비 유도 · 친밀감",
    frequencyLabel: "528 Hz",
    frequencyScience: "Solfeggio · 사랑 주파수 (Plasebo 포함)",
    genreTags: ["Jazz", "Bossa", "Romantic"],
  },
  candle: {
    id: "candle",
    mood: "몽환 빠지기",
    scene: "흔들리는 촛불이 마음을 녹여요",
    effect: "Theta 하강 · 깊은 이완 · 명상 진입",
    frequencyLabel: "Theta 6 Hz",
    frequencyScience: "깊은 이완 · 창의·상상 활성",
    genreTags: ["Ambient", "Dreamy", "Drone"],
  },
  tropical: {
    id: "tropical",
    mood: "풀밭에 누워 힐링",
    scene: "야자수 그늘·파도·뜨거운 모래",
    effect: "세로토닌 상승 · 휴양지 심리 효과",
    frequencyLabel: "Alpha 8 Hz",
    frequencyScience: "Beach Therapy · 스트레스 -50%",
    genreTags: ["Bossa", "Tropical", "Beach"],
  },
  resort: {
    id: "resort",
    mood: "리조트 즐기기",
    scene: "풀사이드·칵테일·선베드",
    effect: "도파민 상승 · 보상 시스템 활성",
    frequencyLabel: "Alpha 10 Hz",
    frequencyScience: "Vacation mindset · 행복감",
    genreTags: ["Chill", "Tropical", "Upbeat"],
  },
  sunset: {
    id: "sunset",
    mood: "노을에 잠기기",
    scene: "해가 바다에 녹아드는 순간",
    effect: "세로토닌·멜라토닌 전환 · 심리 안정",
    frequencyLabel: "528 Hz",
    frequencyScience: "로맨틱 무드 · 따뜻함",
    genreTags: ["Jazz", "Saxophone", "Smooth"],
  },
  mountain: {
    id: "mountain",
    mood: "자연에 머물기",
    scene: "벽난로·침엽수·뜨거운 차 한 잔",
    effect: "Forest Bathing 효과 · 코르티솔 -50%",
    frequencyLabel: "7.83 Hz",
    frequencyScience: "Schumann 지구 공명 · 자연 동조",
    genreTags: ["Acoustic", "Forest", "Piano"],
  },
  tokyo: {
    id: "tokyo",
    mood: "도시의 밤 걷기",
    scene: "네온 사인·시티팝·혼자만의 산책",
    effect: "각성·향수·감정 정돈",
    frequencyLabel: "Alpha 10 Hz",
    frequencyScience: "도시 고요 · 개인화된 공간감",
    genreTags: ["City Pop", "Lo-fi", "Jazz"],
  },
};

export const getSituationDetail = (id: string): SituationDetail | undefined =>
  SITUATION_DETAILS[id];
