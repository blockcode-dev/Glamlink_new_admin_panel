// dayjs plugins used across the app. Imported once from index.js.
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Needed for dayjs(value, "YYYY-MM-DD", true) style parsing.
dayjs.extend(customParseFormat);
