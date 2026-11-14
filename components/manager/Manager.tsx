
"use client";

import { useState } from "react";

import { definitions } from "@/lib/definitions";

import type {
    Site,
    Page,
    PageNode,
    ComponentType
} from "@/lib/types";

import {
    createNode,
    findNode,
    updateNode,
    removeNode,
    updateNodeProps
} from "@/lib/tree";

import { savePage } from "@/app/manager/actions";

import { GenericForm } from "./GenericForm";
import { PageTree } from "./PageTree";

type ManagerProps = {
    sites: Site[];
    initialPages: Page[];
};

export function Manager({
    sites,
    initialPages
}: ManagerProps) {
    const [pages, setPages] =
        useState<Page[]>(initialPages);

    const [siteSlug, setSiteSlug] =
        useState(sites[0]?.slug ?? "");

    const [draft, setDraft] =
        useState<Page | null>(() => {
            const firstPage = initialPages.find(
                page => page.siteSlug === sites[0]?.slug
            );

            return firstPage
                ? structuredClone(firstPage)
                : null;
        });

    const [selectedId, setSelectedId] =
        useState<string | null>(null);

    const [newTitle, setNewTitle] = useState("");
    const [newPath, setNewPath] = useState("");

    const [isNew, setIsNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const sitePages = pages.filter(
        page => page.siteSlug === siteSlug
    );

    const components = draft?.components ?? [];

    const selectedNode = selectedId
        ? findNode(components, selectedId)
        : undefined;

    const componentTypes =
        Object.keys(definitions) as ComponentType[];

    // Open a saved page.

    function openPage(page: Page | null) {
        setDraft(
            page ? structuredClone(page) : null
        );

        setSelectedId(null);
        setIsNew(false);
        setMessage("");
    }

    // Change the selected website.

    function selectSite(slug: string) {
        setSiteSlug(slug);

        const firstPage = pages.find(
            page => page.siteSlug === slug
        );

        openPage(firstPage ?? null);
    }

    // Prepare a new page in React state.

    function createPage() {
        const title = newTitle.trim();
        const path = newPath.trim();

        if (!siteSlug || !title || !path) {
            setMessage("Enter a title and path.");
            return;
        }

        const validPath =
            /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/;

        if (!validPath.test(path)) {
            setMessage(
                "Use a path such as /about or /latest-news."
            );
            return;
        }

        if (
            pages.some(
                page =>
                    page.siteSlug === siteSlug &&
                    page.path === path
            )
        ) {
            setMessage("This page path already exists.");
            return;
        }

        setDraft({
            siteSlug,
            title,
            path,
            components: []
        });

        setIsNew(true);
        setSelectedId(null);
        setNewTitle("");
        setNewPath("");
        setMessage("New page created. Save when ready.");
    }

    // Update the component tree inside the draft.

    function changeComponents(
        update: (nodes: PageNode[]) => PageNode[]
    ) {
        setDraft(current =>
            current
                ? {
                    ...current,
                    components: update(current.components)
                }
                : current
        );
    }

    // Add a root or nested component.

    function addComponent(
        type: ComponentType,
        parentId?: string
    ) {
        if (!draft) return;

        if (parentId) {
            const parent = findNode(
                components,
                parentId
            );

            if (
                !parent ||
                !definitions[parent.type].acceptsChildren
            ) {
                return;
            }
        }

        const newNode = createNode(type);

        changeComponents(current => {
            if (!parentId) {
                return [...current, newNode];
            }

            return updateNode(
                current,
                parentId,
                node => ({
                    ...node,
                    children: [...node.children, newNode]
                })
            );
        });

        setSelectedId(newNode.id);
    }

    // Remove the selected component.

    function deleteSelected() {
        if (!selectedNode) return;

        if (
            !window.confirm(
                "Remove this component and its children?"
            )
        ) {
            return;
        }

        changeComponents(current =>
            removeNode(current, selectedNode.id)
        );

        setSelectedId(null);
    }

    // Save the complete draft to MongoDB.

    async function handleSave() {
        if (!draft || saving) return;

        setSaving(true);
        setMessage("");

        try {
            const result = await savePage(
                draft,
                isNew ? "create" : "update"
            );

            if (!result.ok) {
                setMessage(result.error);
                return;
            }

            setPages(current => {
                const exists = current.some(
                    page =>
                        page.siteSlug === draft.siteSlug &&
                        page.path === draft.path
                );

                if (!exists) {
                    return [...current, draft];
                }

                return current.map(page =>
                    page.siteSlug === draft.siteSlug &&
                        page.path === draft.path
                        ? draft
                        : page
                );
            });

            setIsNew(false);
            setMessage("Page saved successfully.");
        } catch {
            setMessage("Unable to connect to the server.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="mx-auto max-w-6xl space-y-6 bg-white p-6 text-slate-900">
            <h1 className="text-3xl font-bold">
                Rugby Australia Page Manager
            </h1>

            <fieldset
                disabled={saving}
                className="space-y-6"
            >
                {/* WEBSITE AND PAGE SELECTION */}

                <section className="space-y-4 rounded border p-4">
                    <label className="block space-y-1">
                        <span className="font-medium">
                            Website
                        </span>

                        <select
                            value={siteSlug}
                            onChange={event =>
                                selectSite(event.target.value)
                            }
                            className="w-full rounded border p-2"
                        >
                            {sites.map(site => (
                                <option
                                    key={site.slug}
                                    value={site.slug}
                                >
                                    {site.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block space-y-1">
                        <span className="font-medium">
                            Saved pages
                        </span>

                        <select
                            value={isNew ? "" : draft?.path ?? ""}
                            onChange={event => {
                                const page = sitePages.find(
                                    item => item.path === event.target.value
                                );

                                openPage(page ?? null);
                            }}
                            className="w-full rounded border p-2"
                        >
                            <option value="">
                                Select a saved page
                            </option>

                            {sitePages.map(page => (
                                <option
                                    key={page.path}
                                    value={page.path}
                                >
                                    {page.title} ({page.path})
                                </option>
                            ))}
                        </select>
                    </label>

                    <p className="text-sm text-slate-500">
                        Save your changes before switching pages.
                    </p>
                </section>

                {/* CREATE PAGE */}

                <section className="space-y-3 rounded border p-4">
                    <h2 className="text-xl font-semibold">
                        Create a page
                    </h2>

                    <label className="block space-y-1">
                        <span>Page title</span>
                        <input
                            value={newTitle}
                            onChange={event =>
                                setNewTitle(event.target.value)
                            }
                            placeholder="About Us"
                            className="w-full rounded border p-2"
                        />
                    </label>

                    <label className="block space-y-1">
                        <span>URL path</span>
                        <input
                            value={newPath}
                            onChange={event =>
                                setNewPath(event.target.value)
                            }
                            placeholder="/about"
                            className="w-full rounded border p-2"
                        />
                    </label>

                    <button
                        type="button"
                        disabled={!siteSlug}
                        onClick={createPage}
                        className="rounded bg-blue-600 px-4 py-2 text-white"
                    >
                        Create page
                    </button>
                </section>

                {draft && (
                    <>
                        {/* CURRENT PAGE */}

                        <section className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-2xl font-semibold">
                                        {draft.title}
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        {draft.siteSlug}: {draft.path}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="rounded bg-green-700 px-4 py-2 text-white"
                                >
                                    {saving ? "Saving..." : "Save page"}
                                </button>
                            </div>

                            <label className="block space-y-1">
                                <span>Page title</span>
                                <input
                                    value={draft.title}
                                    onChange={event => {
                                        const title = event.target.value;

                                        setDraft(current =>
                                            current
                                                ? { ...current, title }
                                                : current
                                        );
                                    }}
                                    className="w-full rounded border p-2"
                                />
                            </label>
                        </section>

                        <div className="grid gap-6 md:grid-cols-2">

                            {/* COMPONENT TREE */}

                            <section className="space-y-4 rounded border p-4">
                                <h2 className="text-xl font-semibold">
                                    Page components
                                </h2>

                                <div className="flex flex-wrap gap-2">
                                    {componentTypes.map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() =>
                                                addComponent(type)
                                            }
                                            className="rounded border px-3 py-2"
                                        >
                                            + {definitions[type].label}
                                        </button>
                                    ))}
                                </div>

                                {components.length === 0 && (
                                    <p className="text-slate-500">
                                        Add your first component.
                                    </p>
                                )}

                                <PageTree
                                    nodes={components}
                                    selectedId={selectedId}
                                    onSelect={setSelectedId}
                                />
                            </section>

                            {/* COMPONENT EDITOR */}

                            <section className="space-y-4 rounded border p-4">
                                {selectedNode ? (
                                    <>
                                        <h2 className="text-xl font-semibold">
                                            Edit {
                                                definitions[selectedNode.type].label
                                            }
                                        </h2>

                                        <GenericForm
                                            key={selectedNode.id}
                                            fields={
                                                definitions[selectedNode.type].fields
                                            }
                                            values={selectedNode.props}
                                            onChange={values => {
                                                changeComponents(current =>
                                                    updateNodeProps(
                                                        current,
                                                        selectedNode.id,
                                                        values
                                                    )
                                                );
                                            }}
                                        />

                                        {definitions[selectedNode.type]
                                            .acceptsChildren && (
                                                <div className="space-y-2 border-t pt-4">
                                                    <h3 className="font-semibold">
                                                        Add inside this component
                                                    </h3>

                                                    <div className="flex flex-wrap gap-2">
                                                        {componentTypes.map(type => (
                                                            <button
                                                                key={type}
                                                                type="button"
                                                                className="rounded border px-3 py-2"
                                                                onClick={() =>
                                                                    addComponent(
                                                                        type,
                                                                        selectedNode.id
                                                                    )
                                                                }
                                                            >
                                                                + {definitions[type].label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                        <button
                                            type="button"
                                            onClick={deleteSelected}
                                            className="rounded bg-red-600 px-4 py-2 text-white"
                                        >
                                            Delete component
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-slate-500">
                                        Select a component to edit it.
                                    </p>
                                )}
                            </section>
                        </div>

                        {/* PAGE JSON */}

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold">
                                Page JSON
                            </h2>

                            <pre className="overflow-auto rounded bg-slate-100 p-4 text-sm">
                                {JSON.stringify(draft, null, 2)}
                            </pre>
                        </section>
                    </>
                )}
            </fieldset>

            {message && (
                <p
                    role="status"
                    className="rounded border p-3"
                >
                    {message}
                </p>
            )}
        </main>
    );
}
