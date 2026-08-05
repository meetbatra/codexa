const problemArgsMap: Record<string, string> = {
  "Reverse String": "s",
  "Palindrome Number": "x",
  "Two Sum": "nums, target",
  "Valid Parentheses": "s",
  "Merge Two Sorted Lists": "list1, list2",
  "Climbing Stairs": "n",
  "Valid Anagram": "s, t",
  "Maximum Subarray Sum": "nums",
  "Container With Most Water": "height",
  "3Sum": "nums",
  "Longest Substring Without Repeating Characters": "s",
  "Group Anagrams": "strs",
  "Product of Array Except Self": "nums",
  "Coin Change": "coins, amount",
  "Trapping Rain Water": "height",
  "Median of Two Sorted Arrays": "nums1, nums2",
  "Merge k Sorted Lists": "lists",
  "Word Search II": "board, words",
  "Regular Expression Matching": "s, p",
  "Sum of Two Numbers": "a, b"
};

export function getPythonTemplate(title?: string): string {
  const args = title ? (problemArgsMap[title] || "input") : "input";
  return `# Solution in Python 3
# The input arguments are passed to the solve function.
# Return the result of your logic.
def solve(${args}):
    # Write your solution here
    pass
`;
}
