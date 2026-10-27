import type { FormInstance } from "antd";
import { apiErrorBody } from "./apiError";

/**
 * Puts a refusal that names its field (a 400 with `details.field`: INVALID_PAGE, INVALID_ISSUE, INVALID_VIDEO, …)
 * on that form field and scrolls to it. Returns the API's message for the caller to show too, since the field may not
 * be on the form; null when the error names no field. `fieldNames` maps API field names to the form's where they differ.
 */
export const showFieldError = (
  form: FormInstance,
  error: unknown,
  fieldNames: Record<string, string> = {},
): string | null => {
  const body = apiErrorBody(error);
  const field = body?.details?.field;
  if (!field) return null;
  const text = body.message || "Please check this field.";
  const name = fieldNames[field] ?? field;
  form.setFields([{ name, errors: [text] }]);
  form.scrollToField(name, { block: "center" });
  return text;
};
