
import { definitions } from "./definitions";
import type { ComponentType, PageNode } from "./types";

// Create a new component instance.

export function createNode(type: ComponentType): PageNode {
    return {
        id: crypto.randomUUID(),
        type,
        props: structuredClone(definitions[type].defaultProps),
        children: []
    } as PageNode;
}

// Find a component anywhere in the tree.

export function findNode(
    nodes: PageNode[],
    id: string
): PageNode | undefined {
    for (const node of nodes) {
        if (node.id === id) {
            return node;
        }

        const found = findNode(node.children, id);

        if (found) {
            return found;
        }
    }

    return undefined;
}

// Update a specific component anywhere in the tree.

export function updateNode(
    nodes: PageNode[],
    id: string,
    update: (node: PageNode) => PageNode
): PageNode[] {
    return nodes.map(node => {
        if (node.id === id) {
            return update(node);
        }

        return {
            ...node,
            children: updateNode(node.children, id, update)
        };
    });
}

// Remove a component and all its descendants.

export function removeNode(
    nodes: PageNode[],
    id: string
): PageNode[] {
    return nodes
        .filter(node => node.id !== id)
        .map(node => ({
            ...node,
            children: removeNode(node.children, id)
        }));
}

// Replace the props of a specific component.

export function updateNodeProps(
    nodes: PageNode[],
    id: string,
    values: Record<string, unknown>
): PageNode[] {
    return updateNode(nodes, id, node => ({
        ...node,
        props: values
    } as PageNode));
}
