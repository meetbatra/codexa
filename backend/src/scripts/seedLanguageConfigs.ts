import { prisma } from "../lib/prisma";

// ── Shared C++ header with all parse/print utilities ──────────────
const CPP_HEADER = `#include <bits/stdc++.h>
using namespace std;

vector<int> parseIntVec(const string& s){
  vector<int> r; int st=s.find('['),en=s.rfind(']');
  if(st==string::npos||en==string::npos)return r;
  string in=s.substr(st+1,en-st-1); if(in.empty())return r;
  stringstream ss(in); string t;
  while(getline(ss,t,','))if(!t.empty())r.push_back(stoi(t));
  return r;
}
vector<vector<int>> parse2DIntVec(const string& s){
  vector<vector<int>> r; int dep=0; string cur;
  for(char c:s){if(c=='['){dep++;if(dep==2)cur="[";}
  else if(c==']'){if(dep==2){cur+="]";r.push_back(parseIntVec(cur));}dep--;}
  else if(dep>=2)cur+=c;} return r;
}
vector<string> parseStrVec(const string& s){
  vector<string> r; bool inq=false; string cur;
  for(char c:s){if(c=='"'){if(inq){r.push_back(cur);cur="";inq=false;}else inq=true;}else if(inq)cur+=c;}
  return r;
}
void printIntVec(const vector<int>& v){
  cout<<"[";for(size_t i=0;i<v.size();i++)cout<<v[i]<<(i+1<v.size()?",":"");cout<<"]"<<endl;
}
void print2DIntVec(const vector<vector<int>>& v){
  cout<<"[";for(size_t i=0;i<v.size();i++){cout<<"[";for(size_t j=0;j<v[i].size();j++)cout<<v[i][j]<<(j+1<v[i].size()?",":"");cout<<"]"<<(i+1<v.size()?",":"");}cout<<"]"<<endl;
}
void printStrVec(const vector<string>& v){
  cout<<"[";for(size_t i=0;i<v.size();i++)cout<<"\\""+v[i]+"\\""+string(i+1<v.size()?",":"");cout<<"]"<<endl;
}
void print2DStrVec(const vector<vector<string>>& v){
  cout<<"[";for(size_t i=0;i<v.size();i++){cout<<"[";for(size_t j=0;j<v[i].size();j++)cout<<"\\""+v[i][j]+"\\""+string(j+1<v[i].size()?",":"");cout<<"]"<<(i+1<v.size()?",":"");}cout<<"]"<<endl;
}
`;

// ── Shared Java helper methods string ─────────────────────────────
const JAVA_HELPERS = `import java.util.*;
import java.util.stream.*;

`;

function cppWrap(main: string): string {
  return `${CPP_HEADER}\n{USER_CODE}\n\nint main(){\n  string input;\n  getline(cin,input,'\\0');\n  if(input.empty())return 0;\n  ${main}\n  return 0;\n}\n`;
}

function javaWrap(main: string): string {
  return `${JAVA_HELPERS}
class Solution {
{USER_CODE}
}

public class Main {
  static int[] parseIntArr(String s){
    int a=s.indexOf('['),b=s.lastIndexOf(']');
    if(a<0||b<0)return new int[0];
    String in=s.substring(a+1,b).trim();
    if(in.isEmpty())return new int[0];
    return Arrays.stream(in.split(",")).map(String::trim).mapToInt(Integer::parseInt).toArray();
  }
  static int[][] parse2DIntArr(String s){
    List<int[]> r=new ArrayList<>();int dep=0;StringBuilder cur=new StringBuilder();
    for(char c:s.toCharArray()){if(c=='['){dep++;if(dep==2)cur=new StringBuilder("[");}
    else if(c==']'){if(dep==2){cur.append("]");r.add(parseIntArr(cur.toString()));}dep--;}else if(dep>=2)cur.append(c);}
    return r.toArray(new int[0][]);
  }
  static String[] parseStrArr(String s){
    int a=s.indexOf('['),b=s.lastIndexOf(']');
    if(a<0||b<0)return new String[0];
    String in=s.substring(a+1,b).trim();
    if(in.isEmpty())return new String[0];
    List<String> r=new ArrayList<>();boolean inq=false;StringBuilder cur=new StringBuilder();
    for(char c:in.toCharArray()){if(c=='"'){if(inq){r.add(cur.toString());cur=new StringBuilder();inq=false;}else inq=true;}else if(inq)cur.append(c);}
    return r.toArray(new String[0]);
  }
  static void printIntArr(int[] v){System.out.print("[");for(int i=0;i<v.length;i++)System.out.print(v[i]+(i+1<v.length?",":""));System.out.println("]");}
  static void print2DIntList(List<List<Integer>> v){
    System.out.print("[");for(int i=0;i<v.size();i++){System.out.print("[");List<Integer> row=v.get(i);for(int j=0;j<row.size();j++)System.out.print(row.get(j)+(j+1<row.size()?",":""));System.out.print("]"+(i+1<v.size()?",":""));}System.out.println("]");
  }
  static void printStrList(List<String> v){System.out.print("[");for(int i=0;i<v.size();i++)System.out.print("\\""+v.get(i)+"\\"" +(i+1<v.size()?",":""));System.out.println("]");}
  static void print2DStrList(List<List<String>> v){
    System.out.print("[");for(int i=0;i<v.size();i++){System.out.print("[");List<String> row=v.get(i);for(int j=0;j<row.size();j++)System.out.print("\\""+row.get(j)+"\\"" +(j+1<row.size()?",":""));System.out.print("]"+(i+1<v.size()?",":""));}System.out.println("]");
  }
  public static void main(String[] args){
    Scanner sc=new Scanner(System.in);
    if(!sc.hasNextLine())return;
    String input=sc.useDelimiter("\\\\A").next().trim();
    ${main}
  }
}`;
}

function pyWrap(main: string): string {
  return `import sys, json
{USER_CODE}
if __name__ == '__main__':
    input_str = sys.stdin.read().strip()
    if not input_str: sys.exit(0)
    ${main}
`;
}

function jsWrap(main: string): string {
  return `{USER_CODE}
const fs = require('fs');
const input_str = fs.readFileSync(0, 'utf-8').trim();
if (!input_str) process.exit(0);
${main}
`;
}

// ── Problem configs ───────────────────────────────────────────────
interface LangConfig { starter: string; cppMain: string; javaMain: string; pyMain: string; jsMain: string; }

const problems: { title: string; cfg: LangConfig }[] = [
  {
    title: "Two Sum",
    cfg: {
      starter: `def solve(nums, target):\n    # Return indices [i, j] such that nums[i] + nums[j] == target\n    pass`,
      cppMain: `vector<int> nums=parseIntVec(input.substr(0,input.rfind(',')));int target=stoi(input.substr(input.rfind(',')+1));vector<int> solve(vector<int>&,int);vector<int> r=solve(nums,target);printIntVec(r);`,
      javaMain: `int ci=input.lastIndexOf(',');int[] nums=parseIntArr(input.substring(0,ci));int target=Integer.parseInt(input.substring(ci+1).trim());int[] r=new Solution().solve(nums,target);printIntArr(r);`,
      pyMain: `args = json.loads('[' + input_str + ']'); result = solve(*args); print(json.dumps(result, separators=(',', ':')).replace(' ', ''))`,
      jsMain: `const args = JSON.parse('[' + input_str + ']'); const result = solve(...args); console.log(JSON.stringify(result));`,
    },
  },
  {
    title: "Valid Parentheses",
    cfg: {
      starter: `def solve(s):\n    # Return True if brackets are valid, False otherwise\n    pass`,
      cppMain: `string s=input;if(s.front()=='"')s=s.substr(1,s.size()-2);bool solve(string);cout<<(solve(s)?"true":"false")<<endl;`,
      javaMain: `String s=input.trim().replaceAll("\\"","");System.out.println(new Solution().solve(s)?"true":"false");`,
      pyMain: `args = json.loads('[' + input_str + ']'); result = solve(*args); print('true' if result else 'false')`,
      jsMain: `const args = JSON.parse('[' + input_str + ']'); const result = solve(...args); console.log(result ? 'true' : 'false');`,
    },
  },
  {
    title: "Merge Two Sorted Lists",
    cfg: {
      starter: `def solve(list1, list2):\n    # Merge two sorted arrays and return merged sorted array\n    pass`,
      cppMain: `int mid=input.find(']')+1;vector<int> l1=parseIntVec(input.substr(0,mid+1));vector<int> l2=parseIntVec(input.substr(input.rfind('[')));vector<int> solve(vector<int>&,vector<int>&);printIntVec(solve(l1,l2));`,
      javaMain: `int mid=input.indexOf(']')+1;int[] l1=parseIntArr(input.substring(0,mid));int[] l2=parseIntArr(input.substring(input.lastIndexOf('[')));printIntArr(new Solution().solve(l1,l2));`,
      pyMain: `mid = input_str.index(']') + 1\nl1 = json.loads(input_str[:mid])\nl2 = json.loads(input_str[input_str.rindex('['):])\nresult = solve(l1, l2)\nprint(json.dumps(result, separators=(',', ':')).replace(' ', ''))`,
      jsMain: `const mid = input_str.indexOf(']') + 1;\nconst l1 = JSON.parse(input_str.substring(0, mid));\nconst l2 = JSON.parse(input_str.substring(input_str.lastIndexOf('[')));\nconst result = solve(l1, l2);\nconsole.log(JSON.stringify(result));`,
    },
  },
  {
    title: "Climbing Stairs",
    cfg: {
      starter: `def solve(n):\n    # Return number of distinct ways to climb n stairs (1 or 2 steps at a time)\n    pass`,
      cppMain: `int n=stoi(input);int solve(int);cout<<solve(n)<<endl;`,
      javaMain: `int n=Integer.parseInt(input.trim());System.out.println(new Solution().solve(n));`,
      pyMain: `result = solve(int(input_str)); print(result)`,
      jsMain: `const result = solve(parseInt(input_str, 10)); console.log(result);`,
    },
  },
  {
    title: "Valid Anagram",
    cfg: {
      starter: `def solve(s, t):\n    # Return True if t is an anagram of s\n    pass`,
      cppMain: `size_t ci=input.find(',');string s=input.substr(0,ci),t=input.substr(ci+1);for(auto& x:{&s,&t}){x->erase(remove(x->begin(),x->end(),'"'),x->end());x->erase(remove(x->begin(),x->end(),' '),x->end());}bool solve(string,string);cout<<(solve(s,t)?"true":"false")<<endl;`,
      javaMain: `String[] p=input.split(",",2);String s=p[0].trim().replace("\\"",""),t=p[1].trim().replace("\\"","");System.out.println(new Solution().solve(s,t)?"true":"false");`,
      pyMain: `args = json.loads('[' + input_str + ']'); result = solve(*args); print('true' if result else 'false')`,
      jsMain: `const args = JSON.parse('[' + input_str + ']'); const result = solve(...args); console.log(result ? 'true' : 'false');`,
    },
  },
  {
    title: "Maximum Subarray Sum",
    cfg: {
      starter: `def solve(nums):\n    # Return the maximum subarray sum\n    pass`,
      cppMain: `vector<int> nums=parseIntVec(input);int solve(vector<int>&);cout<<solve(nums)<<endl;`,
      javaMain: `int[] nums=parseIntArr(input);System.out.println(new Solution().solve(nums));`,
      pyMain: `nums = json.loads(input_str); result = solve(nums); print(result)`,
      jsMain: `const nums = JSON.parse(input_str); const result = solve(nums); console.log(result);`,
    },
  },
  {
    title: "Container With Most Water",
    cfg: {
      starter: `def solve(height):\n    # Return the maximum water container area\n    pass`,
      cppMain: `vector<int> h=parseIntVec(input);int solve(vector<int>&);cout<<solve(h)<<endl;`,
      javaMain: `int[] h=parseIntArr(input);System.out.println(new Solution().solve(h));`,
      pyMain: `h = json.loads(input_str); result = solve(h); print(result)`,
      jsMain: `const h = JSON.parse(input_str); const result = solve(h); console.log(result);`,
    },
  },
  {
    title: "3Sum",
    cfg: {
      starter: `def solve(nums):\n    # Return all unique triplets that sum to zero\n    pass`,
      cppMain: `vector<int> nums=parseIntVec(input);vector<vector<int>> solve(vector<int>&);print2DIntVec(solve(nums));`,
      javaMain: `int[] nums=parseIntArr(input);List<List<Integer>> r=new Solution().solve(nums);print2DIntList(r);`,
      pyMain: `nums = json.loads(input_str); result = solve(nums); print(json.dumps(result, separators=(',', ':')).replace(' ', ''))`,
      jsMain: `const nums = JSON.parse(input_str); const result = solve(nums); console.log(JSON.stringify(result));`,
    },
  },
  {
    title: "Longest Substring Without Repeating Characters",
    cfg: {
      starter: `def solve(s):\n    # Return the length of the longest substring without repeating characters\n    pass`,
      cppMain: `string s=input;if(s.front()=='"')s=s.substr(1,s.size()-2);int solve(string);cout<<solve(s)<<endl;`,
      javaMain: `String s=input.trim().replaceAll("\\"","");System.out.println(new Solution().solve(s));`,
      pyMain: `s = json.loads(input_str) if input_str.startswith('"') else input_str\nresult = solve(s)\nprint(result)`,
      jsMain: `const s = input_str.startsWith('"') ? JSON.parse(input_str) : input_str;\nconst result = solve(s);\nconsole.log(result);`,
    },
  },
  {
    title: "Group Anagrams",
    cfg: {
      starter: `def solve(strs):\n    # Group anagrams together and return list of groups\n    pass`,
      cppMain: `vector<string> strs=parseStrVec(input);vector<vector<string>> solve(vector<string>&);print2DStrVec(solve(strs));`,
      javaMain: `String[] strs=parseStrArr(input);List<List<String>> r=new Solution().solve(strs);print2DStrList(r);`,
      pyMain: `strs = json.loads(input_str); result = solve(strs); print(json.dumps(result, separators=(',', ':')).replace(' ', ''))`,
      jsMain: `const strs = JSON.parse(input_str); const result = solve(strs); console.log(JSON.stringify(result));`,
    },
  },
  {
    title: "Product of Array Except Self",
    cfg: {
      starter: `def solve(nums):\n    # Return array where each element is product of all others\n    pass`,
      cppMain: `vector<int> nums=parseIntVec(input);vector<int> solve(vector<int>&);printIntVec(solve(nums));`,
      javaMain: `int[] nums=parseIntArr(input);printIntArr(new Solution().solve(nums));`,
      pyMain: `nums = json.loads(input_str); result = solve(nums); print(json.dumps(result, separators=(',', ':')).replace(' ', ''))`,
      jsMain: `const nums = JSON.parse(input_str); const result = solve(nums); console.log(JSON.stringify(result));`,
    },
  },
  {
    title: "Coin Change",
    cfg: {
      starter: `def solve(coins, amount):\n    # Return minimum coins needed to make amount, or -1 if impossible\n    pass`,
      cppMain: `int ci=input.rfind(',');vector<int> coins=parseIntVec(input.substr(0,ci));int amount=stoi(input.substr(ci+1));int solve(vector<int>&,int);cout<<solve(coins,amount)<<endl;`,
      javaMain: `int ci=input.lastIndexOf(',');int[] coins=parseIntArr(input.substring(0,ci));int amount=Integer.parseInt(input.substring(ci+1).trim());System.out.println(new Solution().solve(coins,amount));`,
      pyMain: `args = json.loads('[' + input_str + ']'); result = solve(*args); print(result)`,
      jsMain: `const args = JSON.parse('[' + input_str + ']'); const result = solve(...args); console.log(result);`,
    },
  },
  {
    title: "Trapping Rain Water",
    cfg: {
      starter: `def solve(height):\n    # Return total units of trapped rain water\n    pass`,
      cppMain: `vector<int> h=parseIntVec(input);int solve(vector<int>&);cout<<solve(h)<<endl;`,
      javaMain: `int[] h=parseIntArr(input);System.out.println(new Solution().solve(h));`,
      pyMain: `h = json.loads(input_str); result = solve(h); print(result)`,
      jsMain: `const h = JSON.parse(input_str); const result = solve(h); console.log(result);`,
    },
  },
  {
    title: "Median of Two Sorted Arrays",
    cfg: {
      starter: `def solve(nums1, nums2):\n    # Return the median of two sorted arrays\n    pass`,
      cppMain: `int mid=input.find(']')+1;vector<int> n1=parseIntVec(input.substr(0,mid+1));vector<int> n2=parseIntVec(input.substr(input.rfind('[')));double solve(vector<int>&,vector<int>&);cout<<fixed<<setprecision(5)<<solve(n1,n2)<<endl;`,
      javaMain: `int mid=input.indexOf(']')+1;int[] n1=parseIntArr(input.substring(0,mid));int[] n2=parseIntArr(input.substring(input.lastIndexOf('[')));System.out.printf("%.5f%n",new Solution().solve(n1,n2));`,
      pyMain: `mid = input_str.index(']') + 1\nl1 = json.loads(input_str[:mid])\nl2 = json.loads(input_str[input_str.rindex('['):])\nresult = solve(l1, l2)\nprint(f'{result:.5f}')`,
      jsMain: `const mid = input_str.indexOf(']') + 1;\nconst l1 = JSON.parse(input_str.substring(0, mid));\nconst l2 = JSON.parse(input_str.substring(input_str.lastIndexOf('[')));\nconst result = solve(l1, l2);\nconsole.log(result.toFixed(5));`,
    },
  },
  {
    title: "Merge k Sorted Lists",
    cfg: {
      starter: `def solve(lists):\n    # Merge k sorted arrays into one sorted array\n    pass`,
      cppMain: `vector<vector<int>> lists=parse2DIntVec(input);vector<int> solve(vector<vector<int>>&);printIntVec(solve(lists));`,
      javaMain: `int[][] lists=parse2DIntArr(input);printIntArr(new Solution().solve(lists));`,
      pyMain: `lists = json.loads(input_str); result = solve(lists); print(json.dumps(result, separators=(',', ':')).replace(' ', ''))`,
      jsMain: `const lists = JSON.parse(input_str); const result = solve(lists); console.log(JSON.stringify(result));`,
    },
  },
  {
    title: "Word Search II",
    cfg: {
      starter: `def solve(board, words):\n    # Return all words from the list that exist in the board\n    pass`,
      cppMain: `vector<vector<char>> board;vector<string> words;{auto rows=parse2DIntVec(input);for(auto& r:rows){vector<char> row;for(int v:r)row.push_back((char)v);board.push_back(row);}words=parseStrVec(input.substr(input.rfind(']')+1));}vector<string> solve(vector<vector<char>>&,vector<string>&);printStrVec(solve(board,words));`,
      javaMain: `int wIdx=input.lastIndexOf(']');String boardStr=input.substring(0,wIdx+1);String wordStr=input.substring(wIdx+1);int[][] bRaw=parse2DIntArr(boardStr);char[][] board=new char[bRaw.length][];for(int i=0;i<bRaw.length;i++){board[i]=new char[bRaw[i].length];for(int j=0;j<bRaw[i].length;j++)board[i][j]=(char)bRaw[i][j];}String[] words=parseStrArr(wordStr);printStrList(new Solution().solve(board,words));`,
      pyMain: `w_idx = input_str.rindex(']')\nboard_raw = json.loads(input_str[:w_idx+1])\nboard = [[chr(c) for c in row] for row in board_raw]\nwords = json.loads(input_str[w_idx+1:])\nresult = solve(board, words)\nprint(json.dumps(result, separators=(',', ':')).replace(' ', ''))`,
      jsMain: `const wIdx = input_str.lastIndexOf(']');\nconst boardRaw = JSON.parse(input_str.substring(0, wIdx + 1));\nconst board = boardRaw.map(row => row.map(c => String.fromCharCode(c)));\nconst words = JSON.parse(input_str.substring(wIdx + 1));\nconst result = solve(board, words);\nconsole.log(JSON.stringify(result));`,
    },
  },
  {
    title: "Regular Expression Matching",
    cfg: {
      starter: `def solve(s, p):\n    # Return True if s matches pattern p (. matches any char, * matches zero or more)\n    pass`,
      cppMain: `vector<string> parts=parseStrVec(input);string s=parts.size()>0?parts[0]:"",p=parts.size()>1?parts[1]:"";bool solve(string,string);cout<<(solve(s,p)?"true":"false")<<endl;`,
      javaMain: `String[] parts=parseStrArr(input);String s=parts.length>0?parts[0]:"",p=parts.length>1?parts[1]:"";System.out.println(new Solution().solve(s,p)?"true":"false");`,
      pyMain: `args = json.loads('[' + input_str + ']'); result = solve(*args); print('true' if result else 'false')`,
      jsMain: `const args = JSON.parse('[' + input_str + ']'); const result = solve(...args); console.log(result ? 'true' : 'false');`,
    },
  },
  {
    title: "Sum of Two Numbers",
    cfg: {
      starter: `def solve(a, b):\n    # Return the sum of two numbers\n    pass`,
      cppMain: `int ci=input.find(' ');int a=stoi(input.substr(0,ci)),b=stoi(input.substr(ci+1));int solve(int,int);cout<<solve(a,b)<<endl;`,
      javaMain: `String[] p=input.split(" ");int a=Integer.parseInt(p[0].trim()),b=Integer.parseInt(p[1].trim());System.out.println(new Solution().solve(a,b));`,
      pyMain: `a, b = map(int, input_str.split()); result = solve(a, b); print(result)`,
      jsMain: `const [a, b] = input_str.split(' ').map(Number); const result = solve(a, b); console.log(result);`,
    },
  },
  {
    title: "Reverse String",
    cfg: {
      starter: `def solve(s):\n    # Return the reversed string\n    pass`,
      cppMain: `string s=input;if(s.front()=='"')s=s.substr(1,s.size()-2);string solve(string);cout<<solve(s)<<endl;`,
      javaMain: `String s=input.trim().replaceAll("\\"","");System.out.println(new Solution().solve(s));`,
      pyMain: `s = json.loads(input_str) if input_str.startswith('"') else input_str\nresult = solve(s)\nprint(result)`,
      jsMain: `const s = input_str.startsWith('"') ? JSON.parse(input_str) : input_str;\nconst result = solve(s);\nconsole.log(result);`,
    },
  },
  {
    title: "Palindrome Number",
    cfg: {
      starter: `def solve(x):\n    # Return True if x is a palindrome integer\n    pass`,
      cppMain: `int x=stoi(input);bool solve(int);cout<<(solve(x)?"true":"false")<<endl;`,
      javaMain: `int x=Integer.parseInt(input.trim());System.out.println(new Solution().solve(x)?"true":"false");`,
      pyMain: `result = solve(int(input_str)); print('true' if result else 'false')`,
      jsMain: `const result = solve(parseInt(input_str, 10)); console.log(result ? 'true' : 'false');`,
    },
  },
];

// ── C++ starter template ──────────────────────────────────────────
function cppStarter(title: string, comment: string): string {
  const sig: Record<string, string> = {
    "Two Sum": "vector<int> solve(vector<int>& nums, int target)",
    "Valid Parentheses": "bool solve(string s)",
    "Merge Two Sorted Lists": "vector<int> solve(vector<int>& list1, vector<int>& list2)",
    "Climbing Stairs": "int solve(int n)",
    "Valid Anagram": "bool solve(string s, string t)",
    "Maximum Subarray Sum": "int solve(vector<int>& nums)",
    "Container With Most Water": "int solve(vector<int>& height)",
    "3Sum": "vector<vector<int>> solve(vector<int>& nums)",
    "Longest Substring Without Repeating Characters": "int solve(string s)",
    "Group Anagrams": "vector<vector<string>> solve(vector<string>& strs)",
    "Product of Array Except Self": "vector<int> solve(vector<int>& nums)",
    "Coin Change": "int solve(vector<int>& coins, int amount)",
    "Trapping Rain Water": "int solve(vector<int>& height)",
    "Median of Two Sorted Arrays": "double solve(vector<int>& nums1, vector<int>& nums2)",
    "Merge k Sorted Lists": "vector<int> solve(vector<vector<int>>& lists)",
    "Word Search II": "vector<string> solve(vector<vector<char>>& board, vector<string>& words)",
    "Regular Expression Matching": "bool solve(string s, string p)",
    "Sum of Two Numbers": "int solve(int a, int b)",
    "Reverse String": "string solve(string s)",
    "Palindrome Number": "bool solve(int x)",
  };
  return `${sig[title] || "auto solve(auto input)"} {\n    // ${comment}\n    // Write your solution here\n}\n`;
}

// ── Java starter template ─────────────────────────────────────────
function javaStarter(title: string, comment: string): string {
  const sig: Record<string, string> = {
    "Two Sum": "int[] solve(int[] nums, int target)",
    "Valid Parentheses": "boolean solve(String s)",
    "Merge Two Sorted Lists": "int[] solve(int[] list1, int[] list2)",
    "Climbing Stairs": "int solve(int n)",
    "Valid Anagram": "boolean solve(String s, String t)",
    "Maximum Subarray Sum": "int solve(int[] nums)",
    "Container With Most Water": "int solve(int[] height)",
    "3Sum": "List<List<Integer>> solve(int[] nums)",
    "Longest Substring Without Repeating Characters": "int solve(String s)",
    "Group Anagrams": "List<List<String>> solve(String[] strs)",
    "Product of Array Except Self": "int[] solve(int[] nums)",
    "Coin Change": "int solve(int[] coins, int amount)",
    "Trapping Rain Water": "int solve(int[] height)",
    "Median of Two Sorted Arrays": "double solve(int[] nums1, int[] nums2)",
    "Merge k Sorted Lists": "int[] solve(int[][] lists)",
    "Word Search II": "List<String> solve(char[][] board, String[] words)",
    "Regular Expression Matching": "boolean solve(String s, String p)",
    "Sum of Two Numbers": "int solve(int a, int b)",
    "Reverse String": "String solve(String s)",
    "Palindrome Number": "boolean solve(int x)",
  };
  return `public ${sig[title] || "Object solve(Object input)"} {\n    // ${comment}\n    // Write your solution here\n    return null;\n}\n`;
}

// ── Main seed function ────────────────────────────────────────────
async function seed() {
  const dbProblems = await prisma.problem.findMany({ select: { id: true, title: true } });
  const byTitle: Record<string, string> = {};
  for (const p of dbProblems) byTitle[p.title] = p.id;

  let ok = 0, skip = 0;
  for (const { title, cfg } of problems) {
    const problemId = byTitle[title];
    if (!problemId) { console.log(`⚠ Not found in DB: "${title}"`); skip++; continue; }

    const pyStarter = cfg.starter;
    const commentMatch = cfg.starter.match(/    # (.+)/);
    const commentStr = commentMatch ? commentMatch[1] : "Write your solution here";

    const jsStarter = cfg.starter
      .replace(/^def solve\(/, "function solve(")
      .replace(/\):\n/, ") {\n")
      .replace(/    # /g, "    // ")
      .replace(/    pass$/, "    // Write your solution here\n}");

    const langConfigs = [
      { language: "python",     starterCode: pyStarter,          wrapperCode: pyWrap(cfg.pyMain) },
      { language: "javascript", starterCode: jsStarter,          wrapperCode: jsWrap(cfg.jsMain) },
      { language: "cpp",        starterCode: cppStarter(title, commentStr),  wrapperCode: cppWrap(cfg.cppMain) },
      { language: "java",       starterCode: javaStarter(title, commentStr), wrapperCode: javaWrap(cfg.javaMain) },
    ];

    for (const lc of langConfigs) {
      await prisma.problemLanguageConfig.upsert({
        where: { problemId_language: { problemId, language: lc.language } },
        create: { problemId, language: lc.language, starterCode: lc.starterCode, wrapperCode: lc.wrapperCode },
        update: { starterCode: lc.starterCode, wrapperCode: lc.wrapperCode },
      });
    }
    console.log(`✓ ${title}`);
    ok++;
  }

  console.log(`\nDone: ${ok} seeded, ${skip} skipped.`);
  await prisma.$disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
