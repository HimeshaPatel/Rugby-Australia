import type { PageNode } from "@/lib/types";
import { definitions } from "@/lib/definitions";

type PageTreeProps = {
    nodes: PageNode[];
    selectedId: string | null;
    onSelect: (id: string) => void;
};

function ComponentIcon({ type, isSelected }: { type: string; isSelected: boolean }) {
    if (type === "Section") {
        return (
            <svg
                className={`w-4 h-4 shrink-0 ${isSelected ? "text-amber-300" : "text-emerald-700"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 12h16M12 12v8"
                />
            </svg>
        );
    }

    return (
        <svg
            className={`w-4 h-4 shrink-0 ${isSelected ? "text-amber-300" : "text-emerald-700"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
        </svg>
    );
}

export function PageTree({
    nodes,
    selectedId,
    onSelect
}: PageTreeProps) {
    return (
        <ul className="space-y-2">
            {nodes.map(node => {
                const isSelected = selectedId === node.id;
                const def = definitions[node.type as keyof typeof definitions];
                const label = def?.label ?? node.type;

                const cardGridTitle =
                    node.type === "CardGrid"
                        ? (node.props as { title?: string })?.title
                        : undefined;

                return (
                    <li key={node.id} className="relative">
                        <button
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => onSelect(node.id)}
                            className={`w-full group rounded-xl p-3 text-left transition-all duration-150 flex items-center justify-between gap-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 ${
                                isSelected
                                    ? "bg-emerald-900 text-white shadow-sm ring-1 ring-emerald-800"
                                    : "bg-white border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs"
                            }`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                    className={`p-1.5 rounded-lg shrink-0 ${
                                        isSelected ? "bg-emerald-800/80" : "bg-emerald-50"
                                    }`}
                                >
                                    <ComponentIcon type={node.type} isSelected={isSelected} />
                                </span>
                                <div className="truncate text-left min-w-0">
                                    <span className="font-semibold tracking-tight block truncate">
                                        {label}
                                    </span>
                                    {cardGridTitle && (
                                        <span
                                            className={`text-2xs block truncate font-normal ${
                                                isSelected ? "text-emerald-200" : "text-slate-500"
                                            }`}
                                        >
                                            &ldquo;{cardGridTitle}&rdquo;
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                {node.type === "Section" && (
                                    <span
                                        className={`text-2xs font-medium px-2 py-0.5 rounded-md ${
                                            isSelected
                                                ? "bg-emerald-800 text-emerald-100"
                                                : "bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        {(node.props as { layout?: string })?.layout ?? "full"}
                                    </span>
                                )}

                                {node.type === "CardGrid" && (
                                    <span
                                        className={`text-2xs font-medium px-2 py-0.5 rounded-md ${
                                            isSelected
                                                ? "bg-emerald-800 text-emerald-100"
                                                : "bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        {((node.props as { cards?: unknown[] })?.cards ?? []).length} cards
                                    </span>
                                )}

                                {node.children && node.children.length > 0 && (
                                    <span
                                        className={`text-2xs font-medium px-1.5 py-0.5 rounded-full ${
                                            isSelected
                                                ? "bg-amber-400 text-emerald-950 font-bold"
                                                : "bg-emerald-100 text-emerald-800 font-semibold"
                                        }`}
                                    >
                                        {node.children.length}
                                    </span>
                                )}
                            </div>
                        </button>

                        {node.children && node.children.length > 0 && (
                            <div className="ml-4 mt-2 border-l-2 border-slate-200 pl-3 space-y-2">
                                <PageTree
                                    nodes={node.children}
                                    selectedId={selectedId}
                                    onSelect={onSelect}
                                />
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
