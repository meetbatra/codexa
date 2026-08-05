export const cppSignatures: Record<string, any> = {
  "Reverse String": {
    parse: "string s = input;",
    call: "cout << solve(s) << endl;"
  },
  "Palindrome Number": {
    parse: "int x = stoi(input);",
    call: "cout << (solve(x) ? \"true\" : \"false\") << endl;"
  },
  "Two Sum": {
    parse: "vector<int> nums = parseVectorInt(input.substr(0, input.find(']'))); int target = stoi(input.substr(input.find_last_of(',') + 1));",
    call: "vector<int> result = solve(nums, target); cout << \"[\" << result[0] << \",\" << result[1] << \"]\" << endl;"
  },
  "Valid Parentheses": {
    parse: "string s = input;",
    call: "cout << (solve(s) ? \"true\" : \"false\") << endl;"
  },
  "Merge Two Sorted Lists": {
    parse: "vector<int> list1 = parseVectorInt(input.substr(0, input.find(']'))); vector<int> list2 = parseVectorInt(input.substr(input.find_last_of('[')));",
    call: "printVectorInt(solve(list1, list2));"
  },
  "Climbing Stairs": {
    parse: "int n = stoi(input);",
    call: "cout << solve(n) << endl;"
  },
  "Valid Anagram": {
    parse: "size_t comma = input.find(','); string s = input.substr(0, comma); string t = input.substr(comma + 1); s.erase(remove(s.begin(), s.end(), ' '), s.end()); t.erase(remove(t.begin(), t.end(), ' '), t.end());",
    call: "cout << (solve(s, t) ? \"true\" : \"false\") << endl;"
  },
  "Maximum Subarray Sum": {
    parse: "vector<int> nums = parseVectorInt(input);",
    call: "cout << solve(nums) << endl;"
  },
  "Container With Most Water": {
    parse: "vector<int> height = parseVectorInt(input);",
    call: "int result = solve(height); cout << result << endl;"
  },
  "3Sum": {
    parse: "vector<int> nums = parseVectorInt(input);",
    call: "print2DVectorInt(solve(nums));"
  },
  "Longest Substring Without Repeating Characters": {
    parse: "string s = input;",
    call: "cout << solve(s) << endl;"
  },
  "Group Anagrams": {
    parse: "vector<string> strs = parseVectorString(input);",
    call: `vector<vector<string>> result = solve(strs);
    cout << "[";
    for (size_t i = 0; i < result.size(); i++) {
        cout << "[";
        for (size_t j = 0; j < result[i].size(); j++) {
            cout << "\\"" << result[i][j] << "\\"";
            if (j < result[i].size() - 1) cout << ",";
        }
        cout << "]";
        if (i < result.size() - 1) cout << ",";
    }
    cout << "]" << endl;`
  },
  "Product of Array Except Self": {
    parse: "vector<int> nums = parseVectorInt(input);",
    call: "printVectorInt(solve(nums));"
  },
  "Coin Change": {
    parse: "vector<int> coins = parseVectorInt(input.substr(0, input.find(']'))); int amount = stoi(input.substr(input.find_last_of(',') + 1));",
    call: "cout << solve(coins, amount) << endl;"
  },
  "Trapping Rain Water": {
    parse: "vector<int> height = parseVectorInt(input);",
    call: "cout << solve(height) << endl;"
  },
  "Median of Two Sorted Arrays": {
    parse: "vector<int> nums1 = parseVectorInt(input.substr(0, input.find(']'))); vector<int> nums2 = parseVectorInt(input.substr(input.find_last_of('[')));",
    call: "cout << solve(nums1, nums2) << endl;"
  },
  "Merge k Sorted Lists": {
    parse: "vector<vector<int>> lists = parse2DVectorInt(input);",
    call: "printVectorInt(solve(lists));"
  },
  "Word Search II": {
    parse: "vector<vector<char>> board; vector<string> words; parseBoardAndWords(input, board, words);",
    call: "printVectorString(solve(board, words));"
  },
  "Regular Expression Matching": {
    parse: "string s, p; parseTwoStrings(input, s, p);",
    call: "cout << (solve(s, p) ? \"true\" : \"false\") << endl;"
  },
  "Sum of Two Numbers": {
    parse: "size_t comma = input.find(','); int a = stoi(input.substr(0, comma)); int b = stoi(input.substr(comma + 1));",
    call: "cout << solve(a, b) << endl;"
  }
};

export function getCppWrapper(code: string, title: string): string {
  const sig = cppSignatures[title];
  if (!sig) return code;

  return `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <unordered_map>
#include <map>
#include <set>
#include <queue>
#include <cmath>

using namespace std;

vector<int> parseVectorInt(string s) {
    vector<int> res;
    int start = s.find('[');
    int end = s.find_last_of(']');
    if (start == string::npos || end == string::npos) return res;
    string inner = s.substr(start + 1, end - start - 1);
    if(inner.empty()) return res;
    stringstream ss(inner);
    string item;
    while (getline(ss, item, ',')) {
        if(!item.empty()) res.push_back(stoi(item));
    }
    return res;
}

vector<vector<int>> parse2DVectorInt(string s) {
    vector<vector<int>> res;
    int start = s.find('[');
    int end = s.find_last_of(']');
    if (start == string::npos || end == string::npos) return res;
    string inner = s.substr(start + 1, end - start - 1);
    
    int depth = 0;
    string current = "";
    for (char c : inner) {
        if (c == '[') {
            depth++;
            current = "[";
        } else if (c == ']') {
            current += "]";
            depth--;
            if (depth == 0) {
                res.push_back(parseVectorInt(current));
                current = "";
            }
        } else if (depth > 0) {
            current += c;
        }
    }
    return res;
}

vector<string> parseVectorString(string s) {
    vector<string> res;
    int start = s.find('[');
    int end = s.find_last_of(']');
    if (start == string::npos || end == string::npos) return res;
    string inner = s.substr(start + 1, end - start - 1);
    
    bool in_quote = false;
    string current = "";
    for (char c : inner) {
        if (c == '"') {
            if (in_quote) {
                res.push_back(current);
                current = "";
                in_quote = false;
            } else {
                in_quote = true;
            }
        } else if (in_quote) {
            current += c;
        }
    }
    return res;
}

void parseBoardAndWords(string input, vector<vector<char>>& board, vector<string>& words) {
    size_t wordsIdx = input.find("words");
    string boardStr = input;
    string wordsStr = "";
    if(wordsIdx != string::npos) {
        boardStr = input.substr(0, wordsIdx);
        wordsStr = input.substr(wordsIdx);
    }
    int depth = 0;
    vector<char> currentRow;
    bool inQuote = false;
    for(size_t i=0; i<boardStr.size(); i++) {
        char c = boardStr[i];
        if(c == '[') depth++;
        else if(c == ']') {
            if(depth == 2) {
                board.push_back(currentRow);
                currentRow.clear();
            }
            depth--;
        } else if(c == '"') {
            inQuote = !inQuote;
        } else if(inQuote) {
            currentRow.push_back(c);
        }
    }
    words = parseVectorString(wordsStr.empty() ? input : wordsStr);
}

void parseTwoStrings(string input, string& s, string& p) {
    vector<string> vec = parseVectorString(input);
    if(vec.size() >= 2) {
        s = vec[0];
        p = vec[1];
        return;
    }
    size_t comma = input.find(',');
    if(comma != string::npos) {
        s = input.substr(0, comma);
        p = input.substr(comma + 1);
    } else {
        s = input; p = "";
    }
    if(s.find('"') != string::npos) {
        s = s.substr(s.find('"') + 1);
        if(s.find('"') != string::npos) s = s.substr(0, s.find('"'));
    }
    if(p.find('"') != string::npos) {
        p = p.substr(p.find('"') + 1);
        if(p.find('"') != string::npos) p = p.substr(0, p.find('"'));
    }
    s.erase(remove(s.begin(), s.end(), ' '), s.end());
    p.erase(remove(p.begin(), p.end(), ' '), p.end());
}

void printVectorInt(const vector<int>& v) {
    cout << "[";
    for(size_t i = 0; i < v.size(); i++) {
        cout << v[i] << (i + 1 < v.size() ? "," : "");
    }
    cout << "]" << endl;
}

void print2DVectorInt(const vector<vector<int>>& v) {
    cout << "[";
    for(size_t i = 0; i < v.size(); i++) {
        cout << "[";
        for(size_t j = 0; j < v[i].size(); j++) {
            cout << v[i][j] << (j + 1 < v[i].size() ? "," : "");
        }
        cout << "]" << (i + 1 < v.size() ? "," : "");
    }
    cout << "]" << endl;
}

void printVectorString(const vector<string>& v) {
    cout << "[";
    for(size_t i = 0; i < v.size(); i++) {
        cout << "\"" << v[i] << "\"" << (i + 1 < v.size() ? "," : "");
    }
    cout << "]" << endl;
}

${code}

int main() {
    string input;
    getline(cin, input, '\\0');
    if(input.empty()) return 0;
    
    ${sig.parse}
    ${sig.call}
    
    return 0;
}
`;
}
