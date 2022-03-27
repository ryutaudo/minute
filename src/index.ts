import { generate } from "./generator";
import { analyze } from "./lexer";
import { parse } from "./parser";

export const convertToHTMLString = (markdown: string) => {
  const mdArray = analyze(markdown);
  const asts = mdArray.map((md) => parse(md));
  const htmlString = generate(asts);
  return htmlString;
};
