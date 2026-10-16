import type { ThemeConfig } from "antd";

// antd and Chart.js need real colour values, not var(--…), so they read the
// tokens defined in src/index.css at run time. index.css stays the only place
// a colour is written down.

/** The value of a CSS custom property on :root, e.g. cssVar("--color-primary"). */
export const cssVar = (name: `--${string}`): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** `color` with the given opacity (0–1), for chart fills. Accepts #rgb, #rrggbb and rgb()/rgba(). */
export const withAlpha = (color: string, alpha: number): string => {
  const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const rgb = color.match(/^rgba?\(([^,]+),([^,]+),([^,)]+)/i);
  return rgb ? `rgba(${rgb[1].trim()}, ${rgb[2].trim()}, ${rgb[3].trim()}, ${alpha})` : color;
};

/** antd tokens taken from index.css. Missing values (e.g. in tests, where CSS isn't loaded) fall back to antd's defaults. */
export const antdTheme = (): ThemeConfig => {
  const tokens: Record<string, string> = {
    colorPrimary: cssVar("--color-primary"),
    colorLink: cssVar("--color-primary"),
    colorSuccess: cssVar("--color-success"),
    colorWarning: cssVar("--color-warning"),
    colorError: cssVar("--color-error"),
    colorInfo: cssVar("--color-info"),
    colorTextBase: cssVar("--color-text"),
    colorBgBase: cssVar("--color-surface"),
    colorBgLayout: cssVar("--color-bg"),
    colorBorder: cssVar("--color-border-strong"),
    colorBorderSecondary: cssVar("--color-border"),
    fontFamily: cssVar("--font-family"),
    // antd's preset colours, used as <Tag color="green"> and the like.
    green: cssVar("--color-success"),
    red: cssVar("--color-error"),
    volcano: cssVar("--color-accent-coral"),
    orange: cssVar("--color-warning"),
    gold: cssVar("--color-accent-amber"),
    yellow: cssVar("--color-rating"),
    lime: cssVar("--color-accent-green"),
    cyan: cssVar("--color-accent-teal"),
    blue: cssVar("--color-info"),
    geekblue: cssVar("--color-accent-blue"),
    purple: cssVar("--color-accent-purple"),
    magenta: cssVar("--color-accent-pink"),
    pink: cssVar("--color-accent-pink"),
  };
  const token = Object.fromEntries(Object.entries(tokens).filter(([, value]) => value));
  return {
    token,
    components: {
      Layout: { siderBg: cssVar("--color-surface-inverse") || undefined, headerBg: cssVar("--color-surface") || undefined },
      Menu: {
        darkItemBg: cssVar("--color-surface-inverse") || undefined,
        darkSubMenuItemBg: cssVar("--color-surface-inverse") || undefined,
        darkItemSelectedBg: cssVar("--color-primary") || undefined,
      },
    },
  };
};
