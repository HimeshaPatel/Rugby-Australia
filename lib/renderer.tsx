
import type { ReactNode } from "react";
import type {
  PageNode,
  ComponentType,
  Theme
} from "@/lib/types";

import { registry } from "@/lib/registry";

export function renderNode<K extends ComponentType>(
  node: PageNode<K>,
  theme: Theme
): ReactNode {
  const render = registry[node.type];

  const renderedChildren = node.children.map(child => {
    return renderNode(child, theme);
  });

  return render(
    node.props,
    renderedChildren,
    node.id,
    theme
  );
}
