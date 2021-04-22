type Node<T> = {
  edges: Record<string, Node<T>>;
  value: T | null;
};

export class Radix<T = any> implements Node<T> {
  edges = {};
  value = null;

  constructor(items: [string, T][] = []) {
    for (const [text, value] of items) {
      insert(text, value, this);
    }
  }
}

export function insert<T>(text: string, value: T, node: Node<T>): void {
  let length = text.length;

  while (length--) {
    const prefix = text.substr(0, length + 1);

    if (node.edges[prefix] /* traverse to the next node */) {
      const rest = text.substr(length + 1);

      if (rest === "" /* node already exists, update */) {
        node.edges[prefix].value = value;
        return;
      }

      return insert(rest, value, node.edges[prefix]);
    }
  }

  let similar = false;

  for (const sibling of Object.keys(node.edges)) {
    const [common, x, y] = leftCollision(text, sibling);

    if (common.length > 0) {
      similar = true;

      if (x === "" && y.length /* full match, not exhaustive */) {
        const {
          edges: {
            [sibling]: { edges },
          },
        } = node;

        // create two new nodes
        node.edges[common] = {
          edges: {
            [y]: { edges, value: null },
          },
          value,
        };
      } else {
        // create a new node using common prefix
        node.edges[common] = {
          edges: {},
          value: null,
        };

        insert(x, value, node.edges[common]);

        // move sibling into new node
        const {
          edges: {
            [sibling]: { value: existingValue },
          },
        } = node;

        insert(y, existingValue, node.edges[common]);
      }

      delete node.edges[sibling];

      break;
    }
  }

  if (!similar) {
    node.edges[text] = {
      edges: {},
      value,
    };
  }
}

export function leftCollision(x: string, y: string): [string, string, string] {
  let i = 0;

  while (i < x.length && x[i] === y[i]) {
    i++;
  }

  if (i > 0) {
    return [x.substr(0, i), x.substr(i), y.substr(i)];
  }

  return ["", x, y];
}

export function find<T>(text: string, node: Node<T>): T | null {
  const { length } = text;

  for (let i = 0; i < length; i++) {
    const prefix = text.substr(0, i + 1);

    const {
      edges: { [prefix]: next },
    } = node;

    if (next && i + 1 < length) {
      return find(text.substr(i + 1), node.edges[prefix]);
    }

    if (next) {
      const { value } = next;

      return value;
    }
  }

  return null;
}
