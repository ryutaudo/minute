import { Token } from "./models/token";
import { MergedToken } from "./models/merged_token";

const isAllElmParentRoot = (tokens: Array<Token | MergedToken>) => {
  return tokens.map((t) => t.parent?.elmType).every((val) => val === "root");
};

const _generateHtmlString = (tokens: Array<Token | MergedToken>) => {
  return tokens
    .map((t) => t.content)
    .reverse()
    .join("");
};

const _getInsertPosition = (content: string) => {
  let state = 0;
  const closeTagParentheses = ["<", ">"];
  let position = 0;
  content.split("").some((c, i) => {
    if (state === 1 && c === closeTagParentheses[state]) {
      position = i;
      return true;
    } else if (state === 0 && c === closeTagParentheses[state]) {
      state++;
    }
  });
  return position + 1;
};

const _createMergedContent = (
  currentToken: Token | MergedToken,
  parentToken: Token | MergedToken
) => {
  let content = "";
  switch (parentToken.elmType) {
    case "li":
      content = `<li>${currentToken.content}</li>`;
      break;
    case "ul":
      content = `<ul>${currentToken.content}</ul>`;
      break;
    case "strong":
      content = `<strong>${currentToken.content}</strong>`;
      break;
    case "merged":
      const position = _getInsertPosition(parentToken.content);

      content = `${parentToken.content.slice(0, position)}${
        currentToken.content
      }${parentToken.content.slice(position)}`;
  }
  return content;
};

const generate = (asts: Token[][]) => {
  const htmlStrings = asts.map((lineTokens) => {
    let rearrangedAst: Array<Token | MergedToken> = lineTokens.reverse();

    // Keep merging until all the token are positioned under root
    while (!isAllElmParentRoot(rearrangedAst)) {
      let index = 0;
      while (index < rearrangedAst.length) {
        if (rearrangedAst[index].parent?.elmType === "root") {
          // Do nothing if its parent is root
          index++;
        } else {
          const currentToken = rearrangedAst[index];
          // Remove currenet Token
          rearrangedAst = rearrangedAst.filter((_, t) => t !== index);

          const parentIndex = rearrangedAst.findIndex(
            (t) => t.id === currentToken.parent.id
          );
          const parentToken = rearrangedAst[parentIndex];
          const mergedToken: MergedToken = {
            id: parentToken.id,
            elmType: "merged",
            content: _createMergedContent(currentToken, parentToken),
            parent: parentToken.parent,
          };
          rearrangedAst.splice(parentIndex, 1, mergedToken);
        }
      }
    }
    return _generateHtmlString(rearrangedAst);
  });
  return htmlStrings.join("");
};

export { generate };
