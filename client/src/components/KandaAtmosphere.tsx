import React from "react";

const atmosphereByKanda: Record<number, { label: string; accent: string }> = {
  1: { label: "Bala", accent: "bala" },
  2: { label: "Ayodhya", accent: "ayodhya" },
  3: { label: "Aranya", accent: "aranya" },
  4: { label: "Kishkindha", accent: "kishkindha" },
  5: { label: "Sundara", accent: "sundara" },
  6: { label: "Yuddha", accent: "yuddha" },
  7: { label: "Uttara", accent: "uttara" },
};

export function KandaAtmosphere({ kandaNumber }: { kandaNumber: number }) {
  const atmosphere = atmosphereByKanda[kandaNumber] ?? atmosphereByKanda[1];
  return (
    <div className={`rv-kanda-atmosphere rv-kanda-atmosphere--${atmosphere.accent}`} aria-hidden="true">
      <span className="rv-kanda-atmosphere__halo" />
      <span className="rv-kanda-atmosphere__arc rv-kanda-atmosphere__arc--one" />
      <span className="rv-kanda-atmosphere__arc rv-kanda-atmosphere__arc--two" />
      <span className="rv-kanda-atmosphere__label">{atmosphere.label}</span>
    </div>
  );
}
