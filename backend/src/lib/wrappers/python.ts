export function getPythonWrapper(code: string): string {
  return `
import sys
import json

${code}

if __name__ == '__main__':
    input_str = sys.stdin.read().strip()
    if not input_str:
        sys.exit(0)
    try:
        args = json.loads('[' + input_str + ']')
    except Exception:
        args = [input_str]
    
    result = solve(*args)
    
    if isinstance(result, str):
        print(result)
    elif result is not None:
        print(json.dumps(result, separators=(',', ':')).replace(" ", ""))
`;
}
