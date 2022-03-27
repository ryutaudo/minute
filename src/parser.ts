import {
  genStrongElement,
  genTextElement,
  matchWithListRegxp,
  matchWithStrongRegxp,
} from "./lexer";
import { Token } from "./models/token";

const rootToken: Token = {
  id: 0,
  elmType: "root",
  content: "",
  parent: {} as Token,
};

export const parse = (markdownRow: string) => {
  if (matchWithListRegxp(markdownRow)) {
    return _tokenizeList(markdownRow);
  }
  return _tokenizeText(markdownRow);
};

const _tokenizeText = (
  textElement: string,
  initialId: number = 0,
  initialRoot: Token = rootToken
) => {
  let elements: Token[] = [];
  let parent: Token = initialRoot;

  let id = initialId;

  const _tokenize = (originalText: string, p: Token) => {
    let processingText = originalText;
    parent = p;

    // Loop until the given row become empty
    while (processingText.length !== 0) {
      const matchArray = matchWithStrongRegxp(
        processingText
      ) as RegExpMatchArray;

      // Create text token if it doens't match ****
      if (!matchArray) {
        id += 1;
        const onlyText = genTextElement(id, processingText, parent);
        processingText = "";
        elements.push(onlyText);
      } else {
        if (Number(matchArray.index) > 0) {
          // "aaa**bb**cc" -> TEXT Token + "**bb**cc" にする
          const text = processingText.substring(0, Number(matchArray.index));
          id += 1;
          const textElm = genTextElement(id, text, parent);
          elements.push(textElm);
          processingText = processingText.replace(text, "");
        }

        id += 1;
        const elm = genStrongElement(id, "", parent);

        // Set outer element to parent
        parent = elm;
        elements.push(elm);

        // Remove tokenized text from processing one
        processingText = processingText.replace(matchArray[0], "");

        // Recursive tokenize
        _tokenize(matchArray[1], parent);
        parent = p;
      }
    }
  };
  _tokenize(textElement, parent);
  return elements;
};

export const _tokenizeList = (listString: string) => {
  const UL = "ul";
  const LIST = "li";

  let id = 1;
  const rootUlToken: Token = {
    id,
    elmType: UL,
    content: "",
    parent: rootToken,
  };
  let parent = rootUlToken;
  let tokens: Token[] = [rootUlToken];
  listString
    .split(/\r\n|\r|\n/)
    .filter(Boolean)
    .forEach((l) => {
      const match = matchWithListRegxp(l) as RegExpMatchArray;

      id += 1;
      const listToken: Token = {
        id,
        elmType: LIST,
        content: "",
        parent,
      };
      tokens.push(listToken);
      const listText: Token[] = _tokenizeText(match[3], id, listToken);
      id += listText.length;
      tokens.push(...listText);
    });
  return tokens;
};
