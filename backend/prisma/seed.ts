import { prisma } from "../src/lib/prisma";

const problems = [
  {
    title: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as a sequence of characters. Return the reversed string.",
    difficulty: "Easy",
    testCases: [
      { input: "hello", expectedOutput: "olleh" },
      { input: "Codexa", expectedOutput: "axedoC" },
      { input: "a", expectedOutput: "a" }
    ]
  },
  {
    title: "Palindrome Number",
    description: "Given an integer x, return true if x is a palindrome integer, and false otherwise. An integer is a palindrome when it reads the same backward as forward.",
    difficulty: "Easy",
    testCases: [
      { input: "121", expectedOutput: "true" },
      { input: "-121", expectedOutput: "false" },
      { input: "10", expectedOutput: "false" }
    ]
  },
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "Easy",
    testCases: [
      { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
      { input: "[3,2,4], 6", expectedOutput: "[1,2]" },
      { input: "[3,3], 6", expectedOutput: "[0,1]" }
    ]
  },
  {
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Open brackets must be closed by the same type of brackets.",
    difficulty: "Easy",
    testCases: [
      { input: "()", expectedOutput: "true" },
      { input: "()[]{}", expectedOutput: "true" },
      { input: "(]", expectedOutput: "false" }
    ]
  },
  {
    title: "Merge Two Sorted Lists",
    description: "You are given two sorted arrays list1 and list2. Merge the two lists into one sorted list and return it.",
    difficulty: "Easy",
    testCases: [
      { input: "[1,2,4], [1,3,4]", expectedOutput: "[1,1,2,3,4,4]" },
      { input: "[], []", expectedOutput: "[]" }
    ]
  },
  {
    title: "Climbing Stairs",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    difficulty: "Easy",
    testCases: [
      { input: "2", expectedOutput: "2" },
      { input: "3", expectedOutput: "3" },
      { input: "5", expectedOutput: "8" }
    ]
  },
  {
    title: "Valid Anagram",
    description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    difficulty: "Easy",
    testCases: [
      { input: "anagram, nagaram", expectedOutput: "true" },
      { input: "rat, car", expectedOutput: "false" }
    ]
  },
  {
    title: "Maximum Subarray Sum",
    description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    difficulty: "Medium",
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" },
      { input: "[1]", expectedOutput: "1" },
      { input: "[5,4,-1,7,8]", expectedOutput: "23" }
    ]
  },
  {
    title: "Container With Most Water",
    description: "You are given an integer array height of length n. Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
    difficulty: "Medium",
    testCases: [
      { input: "[1,8,6,2,5,4,8,3,7]", expectedOutput: "49" },
      { input: "[1,1]", expectedOutput: "1" }
    ]
  },
  {
    title: "3Sum",
    description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.",
    difficulty: "Medium",
    testCases: [
      { input: "[-1,0,1,2,-1,-4]", expectedOutput: "[[-1,-1,2],[-1,0,1]]" },
      { input: "[0,1,1]", expectedOutput: "[]" }
    ]
  },
  {
    title: "Longest Substring Without Repeating Characters",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    difficulty: "Medium",
    testCases: [
      { input: "abcabcbb", expectedOutput: "3" },
      { input: "bbbbb", expectedOutput: "1" },
      { input: "pwwkew", expectedOutput: "3" }
    ]
  },
  {
    title: "Group Anagrams",
    description: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
    difficulty: "Medium",
    testCases: [
      { input: "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", expectedOutput: "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]" }
    ]
  },
  {
    title: "Product of Array Except Self",
    description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. Must run in O(n) time without division operator.",
    difficulty: "Medium",
    testCases: [
      { input: "[1,2,3,4]", expectedOutput: "[24,12,8,6]" },
      { input: "[-1,1,0,-3,3]", expectedOutput: "[0,0,9,0,0]" }
    ]
  },
  {
    title: "Coin Change",
    description: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount.",
    difficulty: "Medium",
    testCases: [
      { input: "[1,2,5], 11", expectedOutput: "3" },
      { input: "[2], 3", expectedOutput: "-1" },
      { input: "[1], 0", expectedOutput: "0" }
    ]
  },
  {
    title: "Trapping Rain Water",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    difficulty: "Hard",
    testCases: [
      { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6" },
      { input: "[4,2,0,3,2,5]", expectedOutput: "9" }
    ]
  },
  {
    title: "Median of Two Sorted Arrays",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
    difficulty: "Hard",
    testCases: [
      { input: "[1,3], [2]", expectedOutput: "2.0" },
      { input: "[1,2], [3,4]", expectedOutput: "2.5" }
    ]
  },
  {
    title: "Merge k Sorted Lists",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    difficulty: "Hard",
    testCases: [
      { input: "[[1,4,5],[1,3,4],[2,6]]", expectedOutput: "[1,1,2,3,4,4,5,6]" },
      { input: "[]", expectedOutput: "[]" }
    ]
  },
  {
    title: "Word Search II",
    description: "Given an m x n board of characters and a list of strings words, return all words on the board. Each word must be constructed from letters of sequentially adjacent cells.",
    difficulty: "Hard",
    testCases: [
      { input: "board = [[\"o\",\"a\",\"a\",\"n\"],[\"e\",\"t\",\"a\",\"e\"]], words = [\"oath\",\"eat\"]", expectedOutput: "[\"eat\",\"oath\"]" }
    ]
  },
  {
    title: "Regular Expression Matching",
    description: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where '.' Matches any single character and '*' Matches zero or more of the preceding element.",
    difficulty: "Hard",
    testCases: [
      { input: "s = \"aa\", p = \"a*\"", expectedOutput: "true" },
      { input: "s = \"ab\", p = \".*\"", expectedOutput: "true" }
    ]
  }
];

async function main() {
  console.log("Seeding 19 new problems into database...");

  // Update existing "Sum of Two Numbers" problem to have Easy difficulty if it exists
  await prisma.problem.updateMany({
    where: { title: { contains: "Sum of Two Numbers", mode: "insensitive" } },
    data: { difficulty: "Easy" }
  });

  for (const prob of problems) {
    const existing = await prisma.problem.findFirst({
      where: { title: prob.title }
    });

    if (!existing) {
      await prisma.problem.create({
        data: prob
      });
      console.log(`Created: ${prob.title} [${prob.difficulty}]`);
    } else {
      await prisma.problem.update({
        where: { id: existing.id },
        data: { difficulty: prob.difficulty, description: prob.description, testCases: prob.testCases }
      });
      console.log(`Updated: ${prob.title} [${prob.difficulty}]`);
    }
  }

  const count = await prisma.problem.count();
  console.log(`Seeding complete. Total problems in database: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
