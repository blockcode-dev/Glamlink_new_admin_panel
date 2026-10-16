import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { antdTheme, cssVar, withAlpha } from "./config/theme";

// Every colour is a token in src/index.css. Anything else that needs a literal
// (data saved with a record, not panel styling) marks the line "color-literal-ok".
// Read from disk: Vite hands CSS modules to tests as class maps, not text. Tests run from the repo root.
const SRC = join(process.cwd(), "src");
const sources: Record<string, string> = Object.fromEntries(
  (readdirSync(SRC, { recursive: true }) as string[])
    .map((f) => f.split("\\").join("/"))
    .filter((f) => /\.(tsx?|s?css)$/.test(f) && !/\.test\./.test(f) && f !== "index.css")
    .map((f) => [relative(process.cwd(), join(SRC, f)).split("\\").join("/"), readFileSync(join(SRC, f), "utf8")]),
);

const HEX = /(?<![\w&$])#[0-9a-fA-F]{3,8}\b/;
const FUNC = /\b(?:rgba?|hsla?)\(\s*\d/;
const CSS_NAMES = "white|black|red|green|blue|gray|grey|darkgray|darkgrey|lightgray|lightgrey|orange|yellow|purple|gold|goldenrod|silver|navy|crimson|teal|pink|magenta|cyan";
// In stylesheets any named colour value counts.
const STYLE_NAMED = new RegExp(`:[^;{]*(?<![\\w-])(?:${CSS_NAMES})(?![\\w-])`, "i");
// In TS/TSX, antd preset names ("green", "purple", …) are allowed for Tag/Badge colours,
// because config/theme.ts maps that palette to the tokens. Other names, and any
// named colour inside an inline style, are not.
const TSX_NAMED = /\b(?:color|background(?:Color)?|border\w*|fill|stroke|outline\w*)\s*:\s*["'`](?:white|black|gray|grey|darkgray|darkgrey|lightgray|silver|navy|crimson|goldenrod)["'`]/;
const INLINE_STYLE_NAMED = new RegExp(`style=\\{\\{[^}]*:\\s*["'](?:${CSS_NAMES})["']`);

const offences = () =>
  Object.entries(sources).flatMap(([file, text]) =>
    text.split(/\r?\n/).flatMap((line, i) => {
      const code = line.replace(/\/\/.*$|\/\*.*?\*\//g, "");
      if (/color-literal-ok/.test(line) || !code.trim()) return [];
      const style = /\.s?css$/.test(file);
      const bad =
        HEX.test(code) ||
        FUNC.test(code) ||
        (style ? STYLE_NAMED.test(code) : TSX_NAMED.test(code) || INLINE_STYLE_NAMED.test(code));
      return bad ? [`${file}:${i + 1}: ${line.trim()}`] : [];
    }),
  );

describe("colour tokens", () => {
  it("has no colour literals outside src/index.css", () => {
    expect(offences()).toEqual([]);
  });
});

describe("theme helpers", () => {
  afterEach(() => document.documentElement.removeAttribute("style"));

  it("reads tokens from :root", () => {
    document.documentElement.style.setProperty("--color-primary", " #226168 ");
    expect(cssVar("--color-primary")).toBe("#226168");
    expect(antdTheme().token?.colorPrimary).toBe("#226168");
  });

  it("leaves antd's defaults when the stylesheet isn't loaded", () => {
    expect(antdTheme().token).toEqual({});
  });

  it("adds opacity to hex and rgb colours", () => {
    expect(withAlpha("#226168", 0.6)).toBe("rgba(34, 97, 104, 0.6)");
    expect(withAlpha("#fff", 0.5)).toBe("rgba(255, 255, 255, 0.5)");
    expect(withAlpha("rgb(1, 2, 3)", 0.2)).toBe("rgba(1, 2, 3, 0.2)");
  });
});
