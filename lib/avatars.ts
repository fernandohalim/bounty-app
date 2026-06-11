export const AVATAR_EMOJI: Record<string, string> = {
  rookie_fox: "🦊",
  sleepy_cat: "😺",
  bean_sprout: "🌱",
  coin_goblin: "👺",
  disco_duck: "🦆",
  neon_shark: "🦈",
  pixel_dragon: "🐲",
  galaxy_cat: "🐱",
  golden_whale: "🐋",
  arcade_ghost: "👻",
};

export const avatarIcon = (id?: string | null) =>
  id && AVATAR_EMOJI[id] ? `avatars/${id}` : "avatars/default";

// unlock_level = 1 in the seed → the only avatars pickable at onboarding
export const STARTER_AVATARS = ["rookie_fox", "sleepy_cat", "bean_sprout"];