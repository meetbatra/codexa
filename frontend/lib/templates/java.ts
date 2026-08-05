const javaArgsMap: Record<string, string> = {
  "Reverse String": "String s",
  "Palindrome Number": "int x",
  "Two Sum": "int[] nums, int target",
  "Valid Parentheses": "String s",
  "Merge Two Sorted Lists": "int[] list1, int[] list2",
  "Climbing Stairs": "int n",
  "Valid Anagram": "String s, String t",
  "Maximum Subarray Sum": "int[] nums",
  "Container With Most Water": "int[] height",
  "3Sum": "int[] nums",
  "Longest Substring Without Repeating Characters": "String s",
  "Group Anagrams": "String[] strs",
  "Product of Array Except Self": "int[] nums",
  "Coin Change": "int[] coins, int amount",
  "Trapping Rain Water": "int[] height",
  "Median of Two Sorted Arrays": "int[] nums1, int[] nums2",
  "Merge k Sorted Lists": "int[][] lists",
  "Word Search II": "char[][] board, String[] words",
  "Regular Expression Matching": "String s, String p",
  "Sum of Two Numbers": "int a, int b"
};

const javaRetMap: Record<string, string> = {
  "Reverse String": "String",
  "Palindrome Number": "boolean",
  "Two Sum": "int[]",
  "Valid Parentheses": "boolean",
  "Merge Two Sorted Lists": "int[]",
  "Climbing Stairs": "int",
  "Valid Anagram": "boolean",
  "Maximum Subarray Sum": "int",
  "Container With Most Water": "int",
  "3Sum": "List<List<Integer>>",
  "Longest Substring Without Repeating Characters": "int",
  "Group Anagrams": "List<List<String>>",
  "Product of Array Except Self": "int[]",
  "Coin Change": "int",
  "Trapping Rain Water": "int",
  "Median of Two Sorted Arrays": "double",
  "Merge k Sorted Lists": "int[]",
  "Word Search II": "List<String>",
  "Regular Expression Matching": "boolean",
  "Sum of Two Numbers": "int"
};

export function getJavaTemplate(title?: string): string {
  const javaArgs = title ? (javaArgsMap[title] || "String input") : "String input";
  const javaRet = title ? (javaRetMap[title] || "String") : "String";
  return `// Solution in Java 17

// The input arguments are passed to the solve method.
// Return the result of your logic.
class Solution {
    public ${javaRet} solve(${javaArgs}) {
        // Write your solution here
        
    }
}
`;
}
