// Content pages. The key is also the address: index.html#services/dentures, #tips/dry-mouth, #privacy …
// Titles reuse the dictionary keys already shown on the home page cards, so card and page always match.
// The page text itself lives in 35–37-docs-*.js (one file per language; missing text falls back to English).
const DOC_META = {
  "services/checkups":       { kind: "service", titleKey: "svc1_t", icon: "i-sparkle" },
  "services/fillings-crowns": { kind: "service", titleKey: "svc2_t", icon: "i-crown" },
  "services/dentures":       { kind: "service", titleKey: "svc3_t", icon: "i-denture" },
  "services/implants":       { kind: "service", titleKey: "svc4_t", icon: "i-implant" },
  "services/gum-care":       { kind: "service", titleKey: "svc5_t", icon: "i-drop" },
  "services/emergency":      { kind: "service", titleKey: "svc6_t", icon: "i-bolt" },
  "about":                   { kind: "about",   titleKey: "doctor_name" },
  "tips/denture-care":       { kind: "tip",     titleKey: "art1_t", chipKey: "art1_c" },
  "tips/dry-mouth":          { kind: "tip",     titleKey: "art2_t", chipKey: "art2_c" },
  "tips/implants-guide":     { kind: "tip",     titleKey: "art3_t", chipKey: "art3_c" },
  "privacy":                 { kind: "legal",   titleKey: "f_privacy" },
  "privacy-practices":       { kind: "legal",   titleKey: "f_npp" },
  "accessibility":           { kind: "legal",   titleKey: "f_access" },
  "nondiscrimination":       { kind: "legal",   titleKey: "f_nondisc" }
};
const DOCS = {};
