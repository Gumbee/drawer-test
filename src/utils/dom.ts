export function findAncestor(
  el: HTMLElement,
  predicateOrQuery: string | ((x: HTMLElement) => boolean)
): HTMLElement | null {
  let node: HTMLElement | null = el;

  while (node) {
    if (
      typeof predicateOrQuery === "string"
        ? node.matches(predicateOrQuery)
        : predicateOrQuery(node)
    ) {
      return node;
    }

    node = node.parentElement;
  }

  return null;
}
