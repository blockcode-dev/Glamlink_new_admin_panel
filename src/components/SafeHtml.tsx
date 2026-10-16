import React, { useMemo } from "react";
import { sanitizeHtml } from "../utils/sanitizeHtml";

type SafeHtmlProps = Omit<React.HTMLAttributes<HTMLElement>, "children" | "dangerouslySetInnerHTML"> & {
  html: string | null | undefined;
  /** Use "span" inside inline content such as a table cell. */
  as?: "div" | "span";
};

/** Renders stored HTML after sanitizing it. Use this instead of `dangerouslySetInnerHTML`. */
const SafeHtml = ({ html, as: Tag = "div", ...rest }: SafeHtmlProps) => {
  const clean = useMemo(() => sanitizeHtml(html), [html]);
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: clean }} />;
};

export default SafeHtml;
