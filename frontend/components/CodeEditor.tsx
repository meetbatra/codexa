"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { basicSetup, EditorView } from "codemirror";
import { EditorState } from "@codemirror/state";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: string;
};

function languageExtension(language: string) {
  switch (language) {
    case "javascript":
      return javascript();
    case "cpp":
      return cpp();
    case "java":
      return java();
    case "python":
    default:
      return python();
  }
}

function CodeEditorInner({ value, onChange, language }: CodeEditorProps) {
  const editorParent = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!editorParent.current) return;

    const state = EditorState.create({
      doc: valueRef.current,
      extensions: [
        basicSetup,
        oneDark,
        EditorView.theme({
          "&": { height: "100%" },
          ".cm-scroller": { overflow: "auto" },
        }),
        languageExtension(language),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent: editorParent.current });

    return () => view.destroy();
  }, [language]);

  return (
    <div
      ref={editorParent}
      className="h-full min-h-0 overflow-hidden rounded-lg border border-border font-mono text-sm"
    />
  );
}

const CodeEditor = dynamic(() => Promise.resolve(CodeEditorInner), {
  ssr: false,
});

export default CodeEditor;
