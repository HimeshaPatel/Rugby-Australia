
import type { PageNode } from "@/lib/types";
import { definitions } from "@/lib/definitions";

type PageTreeProps = {
    nodes: PageNode[];
    selectedId: string | null;
    onSelect: (id: string) => void;
};

export function PageTree({
    nodes,
    selectedId,
    onSelect
}: PageTreeProps) {
    return (
        <ul className="space-y-2">
            {nodes.map(node => (
                <li key={node.id}>
                    <button
                        type="button"
                        aria-pressed={selectedId === node.id}
                        onClick={() => onSelect(node.id)}
                        className={
                            selectedId === node.id
                                ? "w-full rounded bg-blue-600 p-3 text-left text-white"
                                : "w-full rounded border p-3 text-left hover:bg-slate-100"
                        }
                    >
                        {definitions[node.type].label}
                    </button>

                    {node.children.length > 0 && (
                        <div className="ml-4 mt-2 border-l pl-3">
                            <PageTree
                                nodes={node.children}
                                selectedId={selectedId}
                                onSelect={onSelect}
                            />
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}
