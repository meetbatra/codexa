import { getCppWrapper, cppSignatures } from "./cpp";
import { getJavaWrapper, javaSignatures } from "./java";
import { getPythonWrapper } from "./python";
import { getJavascriptWrapper } from "./javascript";

export { getCppWrapper, getJavaWrapper, getPythonWrapper, getJavascriptWrapper, cppSignatures, javaSignatures };

export const problemSignatures: Record<string, any> = {
  // Merged view if needed externally
};
for (const title of Object.keys(cppSignatures)) {
  problemSignatures[title] = {
    cpp: cppSignatures[title],
    java: javaSignatures[title]
  };
}
