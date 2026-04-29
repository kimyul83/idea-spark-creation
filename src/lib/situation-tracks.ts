// 상황별 자연 사운드 매핑.
// 6개 상황 — 모든 파일은 단 하나의 상황에만 속함 (겹침 0).
// 각 상황은 5개 이상 (5개 뇌파 변주가 모두 다른 트랙 받도록).

export interface SituationTracks {
  music: string[];
  nature: string[];
}

export const SITUATION_TRACK_MAP: Record<string, SituationTracks> = {
  // 깊이 잠들기 — 밤 풀벌레 / 밤 바다 / 야행성 동물
  sleep: {
    music: [],
    nature: [
      "/sounds/ES_Ambience, Insect, Cricket, Night, Clean - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Insect, Cricket, Night, Meadow, Jungle 01 - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Insect, Cricket, Night, Meadow, Jungle 02 - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Tropical, Amazonas, Night Close, River Crickets, Frogs Bird Sometimes - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Tropical, Mysterious Night, Cricket - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Tropical, Rainforest, Night, Insects, Boobook, Middle Jarawa, Edge 02 - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Tropical, Rainforest, Night, Nocturnal Animals, Bees, Background, Little Andaman 02 - Epidemic Sound.mp3",
      "/sounds/ES_Water, Surf, Seaside, Night, Distant Rough Sea, Crickets, Middle Andaman - Epidemic Sound.mp3",
    ],
  },

  // 물소리 힐링 — 잔잔한 파도 / 호수 / 시냇물 (낮 시간 차분한 물소리)
  relax: {
    music: [],
    nature: [
      "/sounds/ES_Water, Lap, Gentle, On Rocks, Quiet, Peaceful, Calm Waves - Epidemic Sound.mp3",
      "/sounds/ES_Water, Lap, Gentle Waves, Splashing Against Rocks, Calm, Light Water Fizz - Epidemic Sound.mp3",
      "/sounds/ES_Water, Lap, Lake, Small Waves Lapping, Detailed, 1m, Loop 01 - Epidemic Sound.mp3",
      "/sounds/ES_Water, Lap, Waves, Lake, Small, Bright, Lapping, Close - Epidemic Sound.mp3",
      "/sounds/ES_Water, Lap, Waves, Small, Lapping, Calm To Intense 02 - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Waves Sweeping Over Rocks, Calm, Lapping, Scandinavian Archipelago - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Small Waves, Movements - Epidemic Sound.mp3",
      "/sounds/ES_Water, Flow, Creek, Light, Flowing, Foam Details, Calm Forest 01 - Epidemic Sound.mp3",
      "/sounds/ES_Water, Flow, Creek, Medium Stream, 2m - Epidemic Sound.mp3",
      "/sounds/ES_Water, Flow, River, Small, Soft, Burbling Between Stones - Epidemic Sound.mp3",
      "/sounds/ES_Water, Flow, Water Flowing, Small Stream 01 - Epidemic Sound.mp3",
      "/sounds/ES_Water, Movement, Small River, Continuous, Calm, Happy, Steady Stream 01 Schoeps (MS) - Epidemic Sound.mp3",
    ],
  },

  // 몰입하기 — 폭포 / 거센 비 (Pink Noise 마스킹, 집중 강화)
  focus: {
    music: [],
    nature: [
      "/sounds/ES_Water, Waterfall, Steady, Perspective - Epidemic Sound.mp3",
      "/sounds/ES_Water, Waterfall, Waterfall, Medium Flow 01 - Epidemic Sound.mp3",
      "/sounds/ES_Water, Waterfall, Small, Long Fall, Flowing, Trickle - Epidemic Sound.mp3",
      "/sounds/ES_Water, Flow, River, Small, Distant Waterfall 02 - Epidemic Sound.mp3",
      "/sounds/ES_Water, Turbulent, River, Medium Size, Close 01 - Epidemic Sound.mp3",
      "/sounds/ES_Rain, Vegetation, Rain, Daytime, Incoming Hard Rain, Baratang Island - Epidemic Sound.mp3",
      "/sounds/ES_Rain, Vegetation, Rain, Afternoon, Strong Rain, Baratang Island 02 - Epidemic Sound.mp3",
      "/sounds/ES_Rain, Vegetation, Rain, Daytime, Mid To Hard Rainfall, Havelock Island, Second 01 - Epidemic Sound.mp3",
      "/sounds/ES_Rain, Vegetation, Rain, Daytime, Mid To Hard Rainfall, Havelock Island, Second 02 - Epidemic Sound.mp3",
      "/sounds/ES_Rain, Vegetation, Rain, Daytime, Rain Drops Hitting Hard Palm Leaves, Havelock Island 02 - Epidemic Sound.mp3",
    ],
  },

  // 자연에 머물기 — 침엽수 숲 / 바람 / 야외 모닥불 (Forest Bathing)
  mountain: {
    music: [],
    nature: [
      "/sounds/ES_Ambience, Birdsong, Chaffinch, Blackbird, Black Woodpecker, Coniferous Forest, Summer, Afternoon - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Forest, Day, Wind In Trees, Birds Chirping, Calm, Baltic - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Forest, Ukraine, Morning, Birds, Nature, Trees, Calm, Breeze, Wildlife - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Forest, Wind, Daytime, Creaking Tree In Wind, Little Andaman - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Rural, Mountain Forest, Distant & Close River, Water Flow, Light Wind, Calm - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Rural, Mountain, Quiet, Distant River, Light Wind, Calm - Epidemic Sound.mp3",
      "/sounds/ES_Wind, Vegetation, Blowing Through Deciduous Trees, Leaves Rustling, Moderate Intensity, Winter, Afternoon - Epidemic Sound.mp3",
      "/sounds/ES_Wind, General, Gusts, Snow, Leaves, Howling - Epidemic Sound.mp3",
      "/sounds/ES_Wind, General, Gusts, Snow, Rustling, Howling 01 - Epidemic Sound.mp3",
      "/sounds/ES_Fire, Burning, Bonfire, Moderate Size, Close, Crackling - Epidemic Sound.mp3",
      "/sounds/ES_Fire, Burning, Burning Wood, Bonfire, Crispy, Soft Intensity, Loop - Epidemic Sound.mp3",
      "/sounds/ES_Fire, Burning, Wood, Crispy, Medium Intensity - Epidemic Sound.mp3",
    ],
  },

  // 풀밭에 누워 힐링 — 풀밭/들판 / 열대 새소리 (낮 시간 따뜻함)
  tropical: {
    music: [],
    nature: [
      "/sounds/ES_Ambience, Birdsong, Meadow, Summer, Birds Sing, Wind, Light Rustle In Trees - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Grassland, Bird Chirping Close, Insects, Flies 02 - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Grassland, Field, Outisde Small City, Fribourg, Switzerland - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Rural, Countryside, Field, Horses Eating Grass, Insects, Distant Loud Traffic, Cotui, Dominican Republic - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Rural, Spring Day, Italy, Nature Park, Birds, High Activity 02 - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Tropical, Slightly Raining, Forest - Epidemic Sound.mp3",
      "/sounds/ES_Birds, Songbird, Rainforest, Dawn, Pied, Imperial, Pigeon, Ambience, Havelock Island - Epidemic Sound.mp3",
      "/sounds/ES_Birds, Tropical, Rainforest, Afternoon, Singing Bird, Insects, Little Andaman 02 - Epidemic Sound.mp3",
      "/sounds/ES_Birds, Tropical, Rainforest, Morning, Cicadas, Singing Bird, Little Andaman 01 - Epidemic Sound.mp3",
      "/sounds/ES_Birds, Tropical, Rainforest, Morning, Rich, Bird, Drongo, Baratang Island 01 - Epidemic Sound.mp3",
    ],
  },

  // 조용히 책읽기 — 약한 비 / 카페 / 실내 모닥불 (cozy 분위기)
  reading: {
    music: [],
    nature: [
      "/sounds/ES_Rain, Vegetation, Medium Leaves, Drop, Tropical, Jungle - Epidemic Sound.mp3",
      "/sounds/ES_Rain, Vegetation, Rain, Afternoon, Gentle Rain, Birds, Baratang Island 02 - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Forest, Birds Chirping, Light Rain, Light Wind - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Forest, Singing Birds, Distant Traffic - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Restaurant & Bar, Coffee Shop, Spacious, Hum, Coffee Machines, Walla, Vancouver 01 - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Restaurant & Bar, Coffee Shop, Walla, By Counter, Cash Register - Epidemic Sound.mp3",
      "/sounds/ES_Fire, Burning, Fireplace, Glass Walls, Wood Burning Calm, Close Up - Epidemic Sound.mp3",
      "/sounds/ES_Fire, Burning, Fireplace, Outdoor, Seaside, Plank Firewood Burning Medium, Heavy Crackling, Seagulls, Birds In Background - Epidemic Sound.mp3",
      "/sounds/ES_Fire, Crackle, Fireplace, Indoor, Open, Crackling, Transient, Low Intensity - Epidemic Sound.mp3",
      "/sounds/ES_Fire, Crackle, Fireplace In Sauna, Small, Thin, Bright - Epidemic Sound.mp3",
    ],
  },
};

// 효과음 (랜덤)
export const SFX_GLASS: string[] = [
  "/sounds/ES_Glass, Break, Bottle, Smash x3 - Epidemic Sound.mp3",
  "/sounds/ES_Glass, Break, Glassware Breaking, Big Smash - Epidemic Sound.mp3",
  "/sounds/ES_Glass, Break, Window, Large, Smash - Epidemic Sound.mp3",
  "/sounds/ES_Glass, Break, Window, Smash - Epidemic Sound.mp3",
];

export const SFX_BREATH: string[] = [
  "/sounds/ES_Human, Breath, Breathing Mask, Close, Isolated, Heavy Breathing, Long Inhale & Exhale 01 - Epidemic Sound.mp3",
  "/sounds/ES_Human, Breath, Breathing Mask, Close, Isolated, Heavy Breathing, Long Inhale & Exhale 02 - Epidemic Sound.mp3",
  "/sounds/ES_Human, Breath, Female, Nose Breathing, Inhale, Exhale, Calm 01 - Epidemic Sound.mp3",
  "/sounds/ES_Human, Breath, Inhale, Exhale, Smoking Cigarette - Epidemic Sound.mp3",
];

export const pickRandom = <T>(arr: T[]): T | undefined =>
  arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : undefined;

const CDN_BASE = "https://cdn.jsdelivr.net/gh/kimyul83/idea-spark-creation@main/public";

export const toCdnUrl = (localPath: string): string => {
  if (localPath.startsWith("http")) return localPath;
  const clean = localPath.startsWith("/") ? localPath : `/${localPath}`;
  const encoded = clean.split("/").map((p, i) => i === 0 ? p : encodeURIComponent(p)).join("/");
  return `${CDN_BASE}${encoded}`;
};
