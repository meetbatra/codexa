const cppArgsMap: Record<string, string> = {
  "Reverse String": "string s",
  "Palindrome Number": "int x",
  "Two Sum": "vector<int>& nums, int target",
  "Valid Parentheses": "string s",
  "Merge Two Sorted Lists": "vector<int>& list1, vector<int>& list2",
  "Climbing Stairs": "int n",
  "Valid Anagram": "string s, string t",
  "Maximum Subarray Sum": "vector<int>& nums",
  "Container With Most Water": "vector<int>& height",
  "3Sum": "vector<int>& nums",
  "Longest Substring Without Repeating Characters": "string s",
  "Group Anagrams": "vector<string>& strs",
  "Product of Array Except Self": "vector<int>& nums",
  "Coin Change": "vector<int>& coins, int amount",
  "Trapping Rain Water": "vector<int>& height",
  "Median of Two Sorted Arrays": "vector<int>& nums1, vector<int>& nums2",
  "Merge k Sorted Lists": "vector<vector<int>>& lists",
  "Word Search II": "vector<vector<char>>& board, vector<string>& words",
  "Regular Expression Matching": "string s, string p",
  "Sum of Two Numbers": "int a, int b"
};

const cppRetMap: Record<string, string> = {
  "Reverse String": "string",
  "Palindrome Number": "bool",
  "Two Sum": "vector<int>",
  "Valid Parentheses": "bool",
  "Merge Two Sorted Lists": "vector<int>",
  "Climbing Stairs": "int",
  "Valid Anagram": "bool",
  "Maximum Subarray Sum": "int",
  "Container With Most Water": "int",
  "3Sum": "vector<vector<int>>",
  "Longest Substring Without Repeating Characters": "int",
  "Group Anagrams": "vector<vector<string>>",
  "Product of Array Except Self": "vector<int>",
  "Coin Change": "int",
  "Trapping Rain Water": "int",
  "Median of Two Sorted Arrays": "double",
  "Merge k Sorted Lists": "vector<int>",
  "Word Search II": "vector<string>",
  "Regular Expression Matching": "bool",
  "Sum of Two Numbers": "int"
};

export function getCppTemplate(title?: string): string {
  const cppArgs = title ? (cppArgsMap[title] || "string input") : "string input";
  const cppRet = title ? (cppRetMap[title] || "string") : "string";
  return `// Solution in C++ 17

// The input arguments are passed to the solve function.
// Return the result of your logic.
${cppRet} solve(${cppArgs}) {
    // Write your solution here
    
}
`;
}
