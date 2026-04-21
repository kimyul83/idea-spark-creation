import {
  Waves, Flame, Moon, Wind, CloudRain, Target,
  Sparkles, Crown, Heart, HeartHandshake, Leaf, Zap,
  Brain, Briefcase, BookOpen, Focus, Users,
  TreePine, Mountain, Droplets, Bird, Sun, Volume2,
  Keyboard, Coffee, Bell, type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  Waves, Flame, Moon, Wind, CloudRain, Target,
  Sparkles, Crown, Heart, HeartHandshake, Leaf, Zap,
  Brain, Briefcase, BookOpen, Focus, Users,
  TreePine, Mountain, Droplets, Bird, Sun, Volume2,
  Keyboard, Coffee, Bell,
};

export const getIcon = (name?: string | null): LucideIcon => {
  if (!name) return Sparkles;
  return iconMap[name] ?? Sparkles;
};
