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

  const renderedChildren = (node.children || []).map(child => {
    return renderNode(child, theme);
  });

  if (!render) {
    return (
      <div key={node.id} className="p-4 border border-dashed border-amber-300 rounded-xl my-2">
        <span className="text-xs font-mono text-amber-700">Unknown component: {node.type}</span>
        {renderedChildren}
      </div>
    );
  }

  return render(
    node.props,
    renderedChildren,
    node.id,
    theme
  );
}
