import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const parse = (hex) => [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
const blend = (foreground, background, alpha = 1) => foreground.map((channel, index) => Math.round(channel * alpha + background[index] * (1 - alpha)));
const luminance = (rgb) => rgb.map((channel) => channel / 255).map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
const ratio = (foreground, background) => {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return Number(((light + 0.05) / (dark + 0.05)).toFixed(2));
};
const navy = parse("#0b101b");
const pairs = [
  { token: "primary-ivory", foreground: "#f3e9d2", background: "#0b101b", minimum: 4.5 },
  { token: "ayodhya-gold", foreground: "#d4af37", background: "#0b101b", minimum: 4.5 },
  { token: "muted-ivory-65", foreground: "#f3e9d2 @ 65%", background: "#0b101b", minimum: 3, effectiveForeground: blend(parse("#f3e9d2"), navy, 0.65) },
  { token: "sky-source-readiness", foreground: "#e0f2fe", background: "#0b101b", minimum: 4.5 },
];
const results = pairs.map((pair) => {
  const foreground = pair.effectiveForeground ?? parse(pair.foreground);
  const contrastRatio = ratio(foreground, navy);
  return { token: pair.token, foreground: pair.foreground, background: pair.background, contrastRatio, minimum: pair.minimum, passes: contrastRatio >= pair.minimum };
});
const report = { generatedAt: new Date().toISOString(), method: "WCAG relative luminance ratio against Deep Temple Navy #0b101b", results, allPass: results.every((result) => result.passes) };
fs.writeFileSync(path.join(root, "ACCESSIBILITY_CONTRAST_AUDIT.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
