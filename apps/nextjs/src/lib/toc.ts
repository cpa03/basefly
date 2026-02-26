// @ts-nocheck
/**
 * Table of Contents Generator for Markdown Content
 *
 * This file uses @ts-nocheck due to complex MDAST (Markdown Abstract Syntax Tree)
 * type interactions between mdast-util-toc, unist-util-visit, and remark.
 *
 * The types for these libraries are either:
 * - Incomplete (mdast-util-toc Result.map returns List | undefined)
 * - Require extensive generic type parameters (unist-util-visit visitor callbacks)
 * - Have incompatible VFile data type expectations (remark plugin system)
 *
 * This is a known trade-off for type safety in this utility module.
 * The function is well-tested and the runtime behavior is correct.
 *
 * @see https://github.com/syntax-tree/mdast-util-toc
 * @see https://github.com/syntax-tree/unist-util-visit
 */
import { toc } from "mdast-util-toc";
import { remark } from "remark";
import { visit } from "unist-util-visit";

const textTypes = ["text", "emphasis", "strong", "inlineCode"];

function flattenNode(node: { type?: string; value?: string }): string {
  const p = [];
  visit(node, (node) => {
    if (!textTypes.includes(node.type)) return;
    p.push(node.value);
  });
  return p.join(``);
}

interface Item {
  title: string;
  url: string;
  items?: Item[];
}

interface Items {
  items?: Item[];
}

function getItems(node: unknown, current: Item = {}): Items {
  if (!node) {
    return {};
  }

  if (node.type === "paragraph") {
    visit(node, (item) => {
      if (item.type === "link") {
        current.url = item.url;
        current.title = flattenNode(node);
      }

      if (item.type === "text") {
        current.title = flattenNode(node);
      }
    });

    return current;
  }

  if (node.type === "list") {
    current.items = node.children.map((i) => getItems(i, {}));

    return current;
  } else if (node.type === "listItem") {
    const heading = getItems(node.children[0], {});

    if (node.children.length > 1) {
      getItems(node.children[1], heading);
    }

    return heading;
  }

  return {};
}

const getToc = () => (node, file) => {
  const table = toc(node);
  file.data = getItems(table.map, {});
};

export type TableOfContents = Items;

export async function getTableOfContents(
  content: string,
): Promise<TableOfContents> {
  const result = await remark().use(getToc).process(content);

  return result.data;
}
