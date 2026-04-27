// 상황별 자연 사운드 매핑.
// 음악(앰비언트 곡) 제거 — 자연 소리만 사용. 사용자가 일관되지 않은 음악 재생을 거절.

export interface SituationTracks {
  /** 호환을 위해 남김. 항상 빈 배열. */
  music: string[];
  /** 자연 소리 — 상황 진입 시 이 풀에서 variant 매칭. */
  nature: string[];
}

export const SITUATION_TRACK_MAP: Record<string, SituationTracks> = {
  wake: {
    music: [],
    nature: [
      "/sounds/ES_Ambience, Birdsong, Chaffinch, Blackbird, Black Woodpecker, Coniferous Forest, Summer, Afternoon - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Birdsong, Meadow, Summer, Birds Sing, Wind, Light Rustle In Trees - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Forest, Singing Birds, Distant Traffic - Epidemic Sound.mp3",
      "/sounds/ES_Birds, Songbird, Rainforest, Dawn, Pied, Imperial, Pigeon, Ambience, Havelock Island - Epidemic Sound.mp3",
      "/sounds/ES_Birds, Tropical, Rainforest, Morning, Rich, Bird, Drongo, Baratang Island 01 - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Swamp, Mangroves, Morning, Mangrove Whistler, Middle Andaman - Epidemic Sound.mp3",
    ],
  },
  relax: {
    music: [],
    nature: [
      "/sounds/ES_Water, Lap, Gentle Waves, Splashing Against Rocks, Calm, Light Water Fizz - Epidemic Sound.mp3",
      "/sounds/ES_Water, Lap, Gentle, On Rocks, Quiet, Peaceful, Calm Waves - Epidemic Sound.mp3",
      "/sounds/ES_Water, Lap, Lake, Small Waves Lapping, Detailed, 1m, Loop 01 - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Ocean, Beach Waves, Small, Lapping - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Seaside, Waves, Inside, Mangroves, South Andaman - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Small Waves Close, Bigger Distant Waves, 5 Meters From Ocean, Halmstad, Sweden - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Waves Sweeping Over Rocks, Calm, Lapping, Scandinavian Archipelago - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Underground, Cave, Water, Dripping, Flowing 02 - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Underground, Cave, Water, Dripping, Flowing 03 - Epidemic Sound.mp3",
      "/sounds/ES_Water, Flow, Creek, Light, Flowing, Foam Details, Calm Forest 01 - Epidemic Sound.mp3",
      "/sounds/ES_Water, Flow, River, Small, Soft, Burbling Between Stones - Epidemic Sound.mp3",
      "/sounds/ES_Water, Movement, Small River, Continuous, Calm, Happy, Steady Stream 01 Schoeps (MS) - Epidemic Sound.mp3",
      "/sounds/ES_Water, Waterfall, Steady, Perspective - Epidemic Sound.mp3",
      "/sounds/ES_Water, Waterfall, Waterfall, Medium Flow 01 - Epidemic Sound.mp3",
    ],
  },
  meditate: {
    music: [],
    nature: [
      "/sounds/ES_Ambience, Birdsong, Chaffinch, Blackbird, Black Woodpecker, Coniferous Forest, Summer, Afternoon - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Birdsong, Meadow, Summer, Birds Sing, Wind, Light Rustle In Trees - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Forest, Singing Birds, Distant Traffic - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Forest, Wind, Daytime, Creaking Tree In Wind, Little Andaman - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Swamp, Mangroves, Morning, Mangrove Whistler, Middle Andaman - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Underground, Cave, Magic, Deep, Bubbling - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Underground, Cave, Magic, Deep, Wind, Howling 02 - Epidemic Sound.mp3",
      "/sounds/ES_Wind, Vegetation, Blowing Through Deciduous Trees, Leaves Rustling, Moderate Intensity, Winter, Afternoon - Epidemic Sound.mp3",
    ],
  },
  focus: {
    music: [],
    nature: [
      "/sounds/ES_Rain, Vegetation, Medium Leaves, Drop, Tropical, Jungle - Epidemic Sound.mp3",
      "/sounds/ES_Rain, Vegetation, Rain, Daytime, Incoming Hard Rain, Baratang Island - Epidemic Sound.mp3",
      "/sounds/ES_Water, Waterfall, Steady, Perspective - Epidemic Sound.mp3",
      "/sounds/ES_Water, Waterfall, Waterfall, Medium Flow 01 - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Forest, Birds Chirping, Light Rain, Light Wind - Epidemic Sound.mp3",
    ],
  },
  sleep: {
    music: [],
    nature: [
      "/sounds/ES_Water, Lap, Gentle Waves, Splashing Against Rocks, Calm, Light Water Fizz - Epidemic Sound.mp3",
      "/sounds/ES_Water, Lap, Gentle, On Rocks, Quiet, Peaceful, Calm Waves - Epidemic Sound.mp3",
      "/sounds/ES_Water, Lap, Lake, Small Waves Lapping, Detailed, 1m, Loop 01 - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Ocean, Beach Waves, Small, Lapping - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Waves Sweeping Over Rocks, Calm, Lapping, Scandinavian Archipelago - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Insect, Cricket, Night, Clean - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Insect, Cricket, Night, Meadow, Jungle 01 - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Insect, Cricket, Night, Meadow, Jungle 02 - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Tropical, Amazonas, Night Close, River Crickets, Frogs Bird Sometimes - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Tropical, Mysterious Night, Cricket - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Tropical, Rainforest, Night, Insects, Boobook, Middle Jarawa, Edge 02 - Epidemic Sound.mp3",
      "/sounds/ES_Rain, Vegetation, Rain, Daytime, Incoming Hard Rain, Baratang Island - Epidemic Sound.mp3",
    ],
  },
  reading: {
    music: [],
    nature: [
      "/sounds/ES_Ambience, Forest, Birds Chirping, Light Rain, Light Wind - Epidemic Sound.mp3",
      "/sounds/ES_Birds, Songbird, Rainforest, Dawn, Pied, Imperial, Pigeon, Ambience, Havelock Island - Epidemic Sound.mp3",
      "/sounds/ES_Birds, Tropical, Rainforest, Afternoon, Singing Bird, Insects, Little Andaman 02 - Epidemic Sound.mp3",
      "/sounds/ES_Rain, Vegetation, Medium Leaves, Drop, Tropical, Jungle - Epidemic Sound.mp3",
      "/sounds/ES_Rain, Vegetation, Rain, Daytime, Incoming Hard Rain, Baratang Island - Epidemic Sound.mp3",
      "/sounds/ES_Fire, Burning, Bonfire, Moderate Size, Close, Crackling - Epidemic Sound.mp3",
      "/sounds/ES_Fire, Burning, Burning Wood, Bonfire, Crispy, Soft Intensity, Loop - Epidemic Sound.mp3",
    ],
  },
  wine: {
    music: [],
    nature: [
      "/sounds/ES_Fire, Burning, Bonfire, Moderate Size, Close, Crackling - Epidemic Sound.mp3",
      "/sounds/ES_Fire, Burning, Burning Wood, Bonfire, Crispy, Soft Intensity, Loop - Epidemic Sound.mp3",
      "/sounds/ES_Fire, Burning, Wood, Crispy, Medium Intensity - Epidemic Sound.mp3",
    ],
  },
  date: {
    music: [],
    nature: [
      "/sounds/ES_Fire, Burning, Bonfire, Moderate Size, Close, Crackling - Epidemic Sound.mp3",
      "/sounds/ES_Fire, Burning, Burning Wood, Bonfire, Crispy, Soft Intensity, Loop - Epidemic Sound.mp3",
      "/sounds/ES_Fire, Burning, Wood, Crispy, Medium Intensity - Epidemic Sound.mp3",
    ],
  },
  tropical: {
    music: [],
    nature: [
      "/sounds/ES_Water, Lap, Gentle Waves, Splashing Against Rocks, Calm, Light Water Fizz - Epidemic Sound.mp3",
      "/sounds/ES_Water, Lap, Gentle, On Rocks, Quiet, Peaceful, Calm Waves - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Ocean, Beach Waves, Small, Lapping - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Seaside, Waves, Inside, Mangroves, South Andaman - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Small Waves Close, Bigger Distant Waves, 5 Meters From Ocean, Halmstad, Sweden - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Waves Sweeping Over Rocks, Calm, Lapping, Scandinavian Archipelago - Epidemic Sound.mp3",
      "/sounds/ES_Birds, Tropical, Rainforest, Afternoon, Singing Bird, Insects, Little Andaman 02 - Epidemic Sound.mp3",
      "/sounds/ES_Birds, Tropical, Rainforest, Morning, Rich, Bird, Drongo, Baratang Island 01 - Epidemic Sound.mp3",
    ],
  },
  resort: {
    music: [],
    nature: [
      "/sounds/ES_Water, Lap, Gentle Waves, Splashing Against Rocks, Calm, Light Water Fizz - Epidemic Sound.mp3",
      "/sounds/ES_Water, Lap, Gentle, On Rocks, Quiet, Peaceful, Calm Waves - Epidemic Sound.mp3",
      "/sounds/ES_Water, Lap, Lake, Small Waves Lapping, Detailed, 1m, Loop 01 - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Ocean, Beach Waves, Small, Lapping - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Seaside, Waves, Inside, Mangroves, South Andaman - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Small Waves Close, Bigger Distant Waves, 5 Meters From Ocean, Halmstad, Sweden - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Waves Sweeping Over Rocks, Calm, Lapping, Scandinavian Archipelago - Epidemic Sound.mp3",
    ],
  },
  sunset: {
    music: [],
    nature: [
      "/sounds/ES_Water, Lap, Gentle Waves, Splashing Against Rocks, Calm, Light Water Fizz - Epidemic Sound.mp3",
      "/sounds/ES_Water, Lap, Gentle, On Rocks, Quiet, Peaceful, Calm Waves - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Ocean, Beach Waves, Small, Lapping - Epidemic Sound.mp3",
      "/sounds/ES_Water, Wave, Seaside, Waves, Inside, Mangroves, South Andaman - Epidemic Sound.mp3",
      "/sounds/ES_Wind, Vegetation, Blowing Through Deciduous Trees, Leaves Rustling, Moderate Intensity, Winter, Afternoon - Epidemic Sound.mp3",
    ],
  },
  mountain: {
    music: [],
    nature: [
      "/sounds/ES_Ambience, Birdsong, Chaffinch, Blackbird, Black Woodpecker, Coniferous Forest, Summer, Afternoon - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Birdsong, Meadow, Summer, Birds Sing, Wind, Light Rustle In Trees - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Forest, Singing Birds, Distant Traffic - Epidemic Sound.mp3",
      "/sounds/ES_Ambience, Forest, Wind, Daytime, Creaking Tree In Wind, Little Andaman - Epidemic Sound.mp3",
      "/sounds/ES_Weather, Storm, Snow Storm, Cold, Freezing, Heavy Wind, Whistling - Epidemic Sound.mp3",
      "/sounds/ES_Wind, Gust, Mountain Wind, Very Strong, Cold Wind, Heavy Gusts, Jotunheimen, Norway 01 - Epidemic Sound.mp3",
      "/sounds/ES_Wind, Vegetation, Blowing Through Deciduous Trees, Leaves Rustling, Moderate Intensity, Winter, Afternoon - Epidemic Sound.mp3",
      "/sounds/ES_Wind, Vegetation, Blowing Through Defoliated Deciduous Trees, Moderate Intensity, Crow Flying By, Winter, Evening - Epidemic Sound.mp3",
      "/sounds/ES_Fire, Burning, Bonfire, Moderate Size, Close, Crackling - Epidemic Sound.mp3",
      "/sounds/ES_Fire, Burning, Burning Wood, Bonfire, Crispy, Soft Intensity, Loop - Epidemic Sound.mp3",
    ],
  },
  tokyo: {
    music: [],
    nature: [
      "/sounds/ES_Ambience, Forest, Birds Chirping, Light Rain, Light Wind - Epidemic Sound.mp3",
      "/sounds/ES_Birds, Songbird, Rainforest, Dawn, Pied, Imperial, Pigeon, Ambience, Havelock Island - Epidemic Sound.mp3",
      "/sounds/ES_Rain, Vegetation, Medium Leaves, Drop, Tropical, Jungle - Epidemic Sound.mp3",
      "/sounds/ES_Rain, Vegetation, Rain, Daytime, Incoming Hard Rain, Baratang Island - Epidemic Sound.mp3",
    ],
  },
};

// 효과음 (랜덤 재생용)
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

export const SFX_FIRE: string[] = [
  "/sounds/ES_Fire, Burning, Bonfire, Moderate Size, Close, Crackling - Epidemic Sound.mp3",
  "/sounds/ES_Fire, Burning, Burning Wood, Bonfire, Crispy, Soft Intensity, Loop - Epidemic Sound.mp3",
  "/sounds/ES_Fire, Burning, Wood, Crispy, Medium Intensity - Epidemic Sound.mp3",
];

export const pickRandom = <T>(arr: T[]): T | undefined =>
  arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : undefined;

/**
 * /sounds/xxx.mp3 → jsDelivr CDN URL 변환.
 * Lovable 배포가 대용량 mp3 서빙 못 해서 CDN 우회.
 */
const CDN_BASE = "https://cdn.jsdelivr.net/gh/kimyul83/idea-spark-creation@main/public";

export const toCdnUrl = (localPath: string): string => {
  if (localPath.startsWith("http")) return localPath;
  const clean = localPath.startsWith("/") ? localPath : `/${localPath}`;
  // 공백·쉼표 URL 인코딩
  const encoded = clean.split("/").map((p, i) => i === 0 ? p : encodeURIComponent(p)).join("/");
  return `${CDN_BASE}${encoded}`;
};
