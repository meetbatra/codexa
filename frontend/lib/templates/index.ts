import { getPythonTemplate } from "./python";
import { getJavascriptTemplate } from "./javascript";
import { getCppTemplate } from "./cpp";
import { getJavaTemplate } from "./java";

export function getDefaultCode(language: string, title?: string): string {
  switch (language) {
    case "python":
      return getPythonTemplate(title);
    case "javascript":
      return getJavascriptTemplate(title);
    case "cpp":
      return getCppTemplate(title);
    case "java":
      return getJavaTemplate(title);
    default:
      return getPythonTemplate(title);
  }
}

export { getPythonTemplate, getJavascriptTemplate, getCppTemplate, getJavaTemplate };
