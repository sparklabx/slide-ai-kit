// Nodus theme (https://github.com/sparklabx/nodus): navy + green, logo mark and wordmark.
// An example of a branded theme: logos are PNGs next to this file, colours come from the brand kit.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const logo = (file, aspect) => ({ path: join(HERE, "assets", file), aspect });

export default {
  name: "Nodus",
  footer: "Nodus — Sovereign data platform",
  colors: {
    ink: "16263D", paper: "FFFFFF", soft: "F4F8F5", panel: "E6F1E8",
    primary: "59B36D", primaryDeep: "2F7D45",
    accent: "89C869", accentDeep: "5E9E45",
    dark: "183A63",
    muted: "5B6B7F", line: "DDE5EC", white: "FFFFFF", softInk: "C9D6E3",
  },
  ramp: ["183A63", "59B36D"],
  fonts: { head: "Montserrat", body: "Arial" },
  logos: {
    word: logo("nodus-wordmark-light.png", 535 / 151),      // navy — light slides
    wordWhite: logo("nodus-wordmark-dark.png", 535 / 151),  // white — dark slides
    mark: logo("nodus-mark-light.png", 346 / 330),
    markWhite: logo("nodus-mark-dark.png", 346 / 330),
  },
  brand: { mark: true, sectionLogo: false },
};
