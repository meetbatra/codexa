"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { basicSetup, EditorView } from "codemirror";
import { EditorState } from "@codemirror/state";
import { indentUnit } from "@codemirror/language";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { vscodeDarkInit } from "@uiw/codemirror-theme-vscode";

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
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: value }
      });
    }
  }, [value]);

  useEffect(() => {
    if (!editorParent.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        indentUnit.of("    "),
        vscodeDarkInit({
          settings: {
            background: "#0c0c10", // slightly brighter than the #050508 background
            gutterBackground: "#0c0c10",
            lineHighlight: "rgba(255, 255, 255, 0.03)",
            selection: "rgba(251, 146, 60, 0.2)",
            caret: "#fb923c", // orange cursor
          }
        }),
        EditorView.theme({
          "&": { height: "100%" },
          ".cm-scroller": { overflow: "auto" },
          ".cm-gutters": { borderRight: "1px solid rgba(255, 255, 255, 0.05)" }
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
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language]);

  return (
    <div
      ref={editorParent}
      className="h-full min-h-0 overflow-hidden font-mono text-sm"
    />
  );
}

const CodeEditor = dynamic(() => Promise.resolve(CodeEditorInner), {
  ssr: false,
});

export default CodeEditor;
