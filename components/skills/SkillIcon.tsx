"use client";

import { resolveImageUrl } from "@/lib/media";
import { SKILL_ICONS } from "@/lib/skill-icons";

type Props = {
  skill: any;
  /** Tile size in pixels. */
  size?: number;
  className?: string;
};

/**
 * Renders a skill icon: a custom image/logo link (Google Cloud / Drive / YouTube thumbnail),
 * or one of the built-in icons picked in the admin, or the skill's first letter.
 */
export default function SkillIcon({ skill, size = 40, className = "" }: Props) {
  const box = { width: size, height: size } as const;
  const inner = Math.round(size * 0.55);

  const image = resolveImageUrl(skill?.icon || "");
  if (image) {
    return (
      <span
        style={box}
        className={`shrink-0 rounded-xl bg-white/5 border border-[color:var(--border)] flex items-center justify-center overflow-hidden ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={skill?.name || "skill icon"} className="w-full h-full object-cover" />
      </span>
    );
  }

  const Icon = skill?.iconName ? SKILL_ICONS[skill.iconName as string] : null;
  if (Icon) {
    return (
      <span
        style={box}
        className={`shrink-0 rounded-xl bg-[color:var(--accent)]/15 border border-[color:var(--accent)]/30 text-[color:var(--accent-2)] flex items-center justify-center ${className}`}
      >
        <Icon size={inner} />
      </span>
    );
  }

  const letter = String(skill?.name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      style={{ ...box, fontSize: Math.round(size * 0.42) }}
      className={`shrink-0 rounded-xl bg-gradient-to-br from-[color:var(--accent)]/30 to-[color:var(--accent-2)]/20 border border-white/10 font-bold flex items-center justify-center ${className}`}
    >
      {letter}
    </span>
  );
}
