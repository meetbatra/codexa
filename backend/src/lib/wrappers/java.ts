export const javaSignatures: Record<string, any> = {
  "Reverse String": {
    parse: "String s = input.trim();",
    call: "System.out.println(new Solution().solve(s));"
  },
  "Palindrome Number": {
    parse: "int x = Integer.parseInt(input.trim());",
    call: "System.out.println(new Solution().solve(x) ? \"true\" : \"false\");"
  },
  "Two Sum": {
    parse: "int[] nums = parseVectorInt(input.substring(0, input.indexOf(']'))); int target = Integer.parseInt(input.substring(input.lastIndexOf(',') + 1).trim());",
    call: "int[] result = new Solution().solve(nums, target); System.out.println(\"[\" + result[0] + \",\" + result[1] + \"]\");"
  },
  "Valid Parentheses": {
    parse: "String s = input.trim();",
    call: "System.out.println(new Solution().solve(s) ? \"true\" : \"false\");"
  },
  "Merge Two Sorted Lists": {
    parse: "int[] list1 = parseVectorInt(input.substring(0, input.indexOf(']'))); int[] list2 = parseVectorInt(input.substring(input.lastIndexOf('[')));",
    call: "printVectorInt(new Solution().solve(list1, list2));"
  },
  "Climbing Stairs": {
    parse: "int n = Integer.parseInt(input.trim());",
    call: "System.out.println(new Solution().solve(n));"
  },
  "Valid Anagram": {
    parse: "String[] parts = input.split(\",\"); String s = parts[0].trim(); String t = parts[1].trim();",
    call: "System.out.println(new Solution().solve(s, t) ? \"true\" : \"false\");"
  },
  "Maximum Subarray Sum": {
    parse: "int[] nums = parseVectorInt(input);",
    call: "System.out.println(new Solution().solve(nums));"
  },
  "Container With Most Water": {
    parse: "int[] height = parseVectorInt(input);",
    call: "int result = new Solution().solve(height); System.out.println(result);"
  },
  "3Sum": {
    parse: "int[] nums = parseVectorInt(input);",
    call: "print2DVectorInt(new Solution().solve(nums));"
  },
  "Longest Substring Without Repeating Characters": {
    parse: "String s = input.trim();",
    call: "System.out.println(new Solution().solve(s));"
  },
  "Group Anagrams": {
    parse: "String[] strs = parseVectorString(input);",
    call: `List<List<String>> result = new Solution().solve(strs);
        System.out.print("[");
        for (int i = 0; i < result.size(); i++) {
            System.out.print("[");
            for (int j = 0; j < result.get(i).size(); j++) {
                System.out.print("\\"" + result.get(i).get(j) + "\\"");
                if (j < result.get(i).size() - 1) System.out.print(",");
            }
            System.out.print("]");
            if (i < result.size() - 1) System.out.print(",");
        }
        System.out.println("]");`
  },
  "Product of Array Except Self": {
    parse: "int[] nums = parseVectorInt(input);",
    call: "printVectorInt(new Solution().solve(nums));"
  },
  "Coin Change": {
    parse: "int[] coins = parseVectorInt(input.substring(0, input.indexOf(']'))); int amount = Integer.parseInt(input.substring(input.lastIndexOf(',') + 1).trim());",
    call: "System.out.println(new Solution().solve(coins, amount));"
  },
  "Trapping Rain Water": {
    parse: "int[] height = parseVectorInt(input);",
    call: "System.out.println(new Solution().solve(height));"
  },
  "Median of Two Sorted Arrays": {
    parse: "int[] nums1 = parseVectorInt(input.substring(0, input.indexOf(']'))); int[] nums2 = parseVectorInt(input.substring(input.lastIndexOf('[')));",
    call: "System.out.println(new Solution().solve(nums1, nums2));"
  },
  "Merge k Sorted Lists": {
    parse: "int[][] lists = parse2DArrayInt(input);",
    call: "printVectorInt(new Solution().solve(lists));"
  },
  "Word Search II": {
    parse: "Object[] parsed = parseBoardAndWords(input); char[][] board = (char[][])parsed[0]; String[] words = (String[])parsed[1];",
    call: "printVectorString(new Solution().solve(board, words));"
  },
  "Regular Expression Matching": {
    parse: "String[] sp = parseTwoStrings(input); String s = sp[0]; String p = sp[1];",
    call: "System.out.println(new Solution().solve(s, p) ? \"true\" : \"false\");"
  },
  "Sum of Two Numbers": {
    parse: "String[] parts = input.split(\",\"); int a = Integer.parseInt(parts[0].trim()); int b = Integer.parseInt(parts[1].trim());",
    call: "System.out.println(new Solution().solve(a, b));"
  }
};

export function getJavaWrapper(code: string, title: string): string {
  const sig = javaSignatures[title];
  if (!sig) return code;

  return `
import java.util.*;

${code}

public class Main {
    public static int[] parseVectorInt(String s) {
        int start = s.indexOf('[');
        int end = s.lastIndexOf(']');
        if (start == -1 || end == -1) return new int[0];
        String inner = s.substring(start + 1, end).trim();
        if (inner.isEmpty()) return new int[0];
        String[] parts = inner.split(",");
        List<Integer> list = new ArrayList<>();
        for (String p : parts) {
            String trimmed = p.trim();
            if (!trimmed.isEmpty()) list.add(Integer.parseInt(trimmed));
        }
        int[] res = new int[list.size()];
        for (int i = 0; i < list.size(); i++) res[i] = list.get(i);
        return res;
    }

    public static int[][] parse2DArrayInt(String s) {
        int start = s.indexOf('[');
        int end = s.lastIndexOf(']');
        if (start == -1 || end == -1) return new int[0][0];
        String inner = s.substring(start + 1, end).trim();
        List<int[]> rows = new ArrayList<>();
        int depth = 0;
        StringBuilder current = new StringBuilder();
        for (char c : inner.toCharArray()) {
            if (c == '[') {
                depth++;
                current = new StringBuilder("[");
            } else if (c == ']') {
                current.append("]");
                depth--;
                if (depth == 0) {
                    rows.add(parseVectorInt(current.toString()));
                }
            } else if (depth > 0) {
                current.append(c);
            }
        }
        return rows.toArray(new int[0][]);
    }

    public static String[] parseVectorString(String s) {
        int start = s.indexOf('[');
        int end = s.lastIndexOf(']');
        if (start == -1 || end == -1) return new String[0];
        String inner = s.substring(start + 1, end).trim();
        if (inner.isEmpty()) return new String[0];
        List<String> list = new ArrayList<>();
        boolean inQuote = false;
        StringBuilder current = new StringBuilder();
        for (char c : inner.toCharArray()) {
            if (c == '"') {
                if (inQuote) {
                    list.add(current.toString());
                    current.setLength(0);
                    inQuote = false;
                } else {
                    inQuote = true;
                }
            } else if (inQuote) {
                current.append(c);
            }
        }
        return list.toArray(new String[0]);
    }

    public static Object[] parseBoardAndWords(String input) {
        int wordsIdx = input.indexOf("words");
        String boardStr = wordsIdx != -1 ? input.substring(0, wordsIdx) : input;
        String wordsStr = wordsIdx != -1 ? input.substring(wordsIdx) : input;

        List<char[]> boardList = new ArrayList<>();
        List<Character> row = new ArrayList<>();
        boolean inQuote = false;
        int depth = 0;
        for (char c : boardStr.toCharArray()) {
            if (c == '[') depth++;
            else if (c == ']') {
                if (depth == 2) {
                    char[] r = new char[row.size()];
                    for (int i = 0; i < row.size(); i++) r[i] = row.get(i);
                    boardList.add(r);
                    row.clear();
                }
                depth--;
            } else if (c == '"') {
                inQuote = !inQuote;
            } else if (inQuote) {
                row.add(c);
            }
        }
        char[][] board = boardList.toArray(new char[0][]);
        String[] words = parseVectorString(wordsStr);
        return new Object[]{ board, words };
    }

    public static String[] parseTwoStrings(String input) {
        String[] vec = parseVectorString(input);
        if (vec.length >= 2) return vec;
        String[] parts = input.split(",");
        String s = parts[0].replaceAll("[\"\\s]", "");
        String p = parts.length > 1 ? parts[1].replaceAll("[\"\\s]", "") : "";
        return new String[]{ s, p };
    }

    public static void printVectorInt(int[] v) {
        System.out.print("[");
        for (int i = 0; i < v.length; i++) {
            System.out.print(v[i] + (i + 1 < v.length ? "," : ""));
        }
        System.out.println("]");
    }

    public static void print2DVectorInt(List<List<Integer>> v) {
        System.out.print("[");
        for (int i = 0; i < v.size(); i++) {
            System.out.print("[");
            for (int j = 0; j < v.get(i).size(); j++) {
                System.out.print(v.get(i).get(j) + (j + 1 < v.get(i).size() ? "," : ""));
            }
            System.out.print("]" + (i + 1 < v.size() ? "," : ""));
        }
        System.out.println("]");
    }

    public static void printVectorString(List<String> v) {
        System.out.print("[");
        for (int i = 0; i < v.size(); i++) {
            System.out.print("\"" + v.get(i) + "\"" + (i + 1 < v.size() ? "," : ""));
        }
        System.out.println("]");
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextLine()) return;
        String input = scanner.nextLine();
        
        ${sig.parse}
        ${sig.call}
    }
}
`;
}
