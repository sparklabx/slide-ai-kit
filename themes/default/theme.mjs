// Neutral starter theme: slate + blue, no logo (the brand name is drawn as text).
// Copy this folder to make your own theme; see README "Make a theme".
export default {
  name: "Your Brand",
  footer: "Your Brand — Confidential",
  colors: {
    ink: "1F2937",        // body text
    paper: "FFFFFF",      // content slide background
    soft: "F5F7FA",       // card / panel fill
    panel: "E8EDF3",      // header cells, subtle fills
    primary: "2563EB",    // main accent (bars, rules)
    primaryDeep: "1D4ED8",// accent text on light backgrounds
    accent: "14B8A6",     // second accent (kickers, highlights)
    accentDeep: "0F766E",
    dark: "111827",       // cover / section / closing background
    muted: "6B7280",      // captions, footers
    line: "E5E7EB",       // borders, rules
    white: "FFFFFF",
    softInk: "D1D5DB",    // secondary text on dark slides
  },
  ramp: ["111827", "2563EB"],   // colours cards/steps cycle through (must read with white text)
  fonts: { head: "Arial", body: "Arial" },
  logos: {},                     // { word, wordWhite, mark, markWhite }: { path, aspect }
  brand: { mark: false, sectionLogo: true },
};
