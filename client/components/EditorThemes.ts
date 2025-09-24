import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// Premium Dark Theme
export const premiumDark = EditorView.theme({
  "&": {
    color: "#e4e6ea",
    backgroundColor: "#0d1117",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontSize: "14px"
  },
  ".cm-content": {
    padding: "16px",
    caretColor: "#58a6ff"
  },
  ".cm-focused .cm-cursor": {
    borderLeftColor: "#58a6ff",
    borderLeftWidth: "2px"
  },
  ".cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "#264f78"
  },
  ".cm-gutters": {
    backgroundColor: "#161b22",
    color: "#8b949e",
    border: "none",
    borderRight: "1px solid #21262d"
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#21262d",
    color: "#f0f6fc"
  },
  ".cm-activeLine": {
    backgroundColor: "#161b2240"
  },
  ".cm-lineNumbers": {
    color: "#6e7681"
  }
}, { dark: true });

export const premiumDarkHighlight = HighlightStyle.define([
  { tag: t.keyword, color: "#ff7b72" },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: "#7ee787" },
  { tag: [t.function(t.variableName), t.labelName], color: "#d2a8ff" },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: "#79c0ff" },
  { tag: [t.definition(t.name), t.separator], color: "#ffa657" },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: "#ffa657" },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: "#a5a5a5" },
  { tag: [t.meta, t.comment], color: "#8b949e", fontStyle: "italic" },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: "#58a6ff", textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: "#58a6ff" },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: "#79c0ff" },
  { tag: [t.processingInstruction, t.string, t.inserted], color: "#a5c261" },
  { tag: t.invalid, color: "#f85149" }
]);

// Premium Light Theme
export const premiumLight = EditorView.theme({
  "&": {
    color: "#24292f",
    backgroundColor: "#ffffff",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontSize: "14px"
  },
  ".cm-content": {
    padding: "16px",
    caretColor: "#0969da"
  },
  ".cm-focused .cm-cursor": {
    borderLeftColor: "#0969da",
    borderLeftWidth: "2px"
  },
  ".cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "#0969da20"
  },
  ".cm-gutters": {
    backgroundColor: "#f6f8fa",
    color: "#656d76",
    border: "none",
    borderRight: "1px solid #d0d7de"
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#f6f8fa",
    color: "#24292f"
  },
  ".cm-activeLine": {
    backgroundColor: "#f6f8fa40"
  },
  ".cm-lineNumbers": {
    color: "#656d76"
  }
}, { dark: false });

export const premiumLightHighlight = HighlightStyle.define([
  { tag: t.keyword, color: "#cf222e" },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: "#116329" },
  { tag: [t.function(t.variableName), t.labelName], color: "#8250df" },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: "#0969da" },
  { tag: [t.definition(t.name), t.separator], color: "#953800" },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: "#953800" },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: "#24292f" },
  { tag: [t.meta, t.comment], color: "#6e7781", fontStyle: "italic" },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: "#0969da", textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: "#0969da" },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: "#0969da" },
  { tag: [t.processingInstruction, t.string, t.inserted], color: "#0a3069" },
  { tag: t.invalid, color: "#cf222e" }
]);

export const premiumDarkTheme = [premiumDark, syntaxHighlighting(premiumDarkHighlight)];
export const premiumLightTheme = [premiumLight, syntaxHighlighting(premiumLightHighlight)];