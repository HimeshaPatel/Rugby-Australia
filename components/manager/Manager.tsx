"use client";

import { useState } from "react";
import Link from "next/link";

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

    const currentSite = sites.find(s => s.slug === siteSlug) ?? sites[0];

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

    const publicUrl = draft
        ? `/sites/${draft.siteSlug}${draft.path === "/" ? "" : draft.path}`
        : null;

    const isSuccessMessage = message.includes("successfully") || message.includes("created");

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
            {/* TOP NAVIGATION / DASHBOARD HEADER */}
            <header className="sticky top-0 z-40 bg-emerald-950 text-white shadow-md border-b border-emerald-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-800 border border-emerald-700/60 flex items-center justify-center shadow-xs shrink-0">
                                <svg
                                    className="w-5 h-5 text-amber-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-tight">
                                    Rugby Australia Page Manager
                                </h1>
                                <p className="text-xs text-emerald-300/80 leading-normal">
                                    Manage multiple websites from a shared, schema-driven component library.
                                </p>
                            </div>
                        </div>

                        {/* ACTIVE SITE PILL & PRIMARY SAVE ACTION */}
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                            {currentSite && (
                                <div className="flex items-center gap-2 bg-emerald-900/90 border border-emerald-800 px-3 py-1.5 rounded-xl text-xs">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full shadow-xs shrink-0"
                                        style={{ backgroundColor: currentSite.theme.brand }}
                                    />
                                    <span className="text-slate-300 font-medium hidden sm:inline">Active Site:</span>
                                    <span className="font-bold text-white uppercase tracking-wider">
                                        {currentSite.name}
                                    </span>
                                </div>
                            )}

                            {draft && (
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={handleSave}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-150 shadow-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-emerald-950 ${
                                        saving
                                            ? "bg-emerald-700 text-emerald-200 cursor-not-allowed"
                                            : "bg-amber-400 text-emerald-950 hover:bg-amber-300 hover:shadow active:scale-98"
                                    }`}
                                >
                                    {saving ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-emerald-950" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Save page</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* STATUS NOTIFICATION BANNER */}
            {message && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                    <div
                        role="status"
                        className={`p-3.5 rounded-xl border flex items-center justify-between text-sm shadow-xs transition-all ${
                            isSuccessMessage
                                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                : "bg-rose-50 border-rose-200 text-rose-900"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            {isSuccessMessage ? (
                                <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            )}
                            <span className="font-semibold">{message}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setMessage("")}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 p-1"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <fieldset disabled={saving} className="space-y-6">
                    {/* CONTROLS BAR: SITE SELECTION, SAVED PAGES & CREATE PAGE */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* SELECTORS (SITE & SAVED PAGES) */}
                        <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    Website & Page Selector
                                </h2>
                                <span className="text-2xs text-slate-400">Auto-loads team theme</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className="block space-y-1.5">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Website
                                    </span>
                                    <div className="relative">
                                        <select
                                            value={siteSlug}
                                            onChange={event => selectSite(event.target.value)}
                                            className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm font-semibold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 cursor-pointer"
                                        >
                                            {sites.map(site => (
                                                <option key={site.slug} value={site.slug}>
                                                    {site.name} ({site.slug})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </label>

                                <label className="block space-y-1.5">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Saved pages
                                    </span>
                                    <div className="relative">
                                        <select
                                            value={isNew ? "" : draft?.path ?? ""}
                                            onChange={event => {
                                                const page = sitePages.find(
                                                    item => item.path === event.target.value
                                                );
                                                openPage(page ?? null);
                                            }}
                                            className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm font-semibold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 cursor-pointer"
                                        >
                                            <option value="">Select a saved page</option>
                                            {sitePages.map(page => (
                                                <option key={page.path} value={page.path}>
                                                    {page.title} ({page.path})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            <p className="text-2xs text-slate-400 pt-1">
                                Tip: Remember to save your changes before switching between pages or websites.
                            </p>
                        </section>

                        {/* CREATE A PAGE PANEL */}
                        <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-3.5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create a New Page
                                </h2>
                                <span className="text-2xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                                    in {currentSite.name}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label className="block space-y-1">
                                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-600">Page title</span>
                                    <input
                                        value={newTitle}
                                        onChange={event => setNewTitle(event.target.value)}
                                        placeholder="e.g. Wallabies Fixtures"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20"
                                    />
                                </label>

                                <label className="block space-y-1">
                                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-600">URL path</span>
                                    <input
                                        value={newPath}
                                        onChange={event => setNewPath(event.target.value)}
                                        placeholder="/fixtures"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20"
                                    />
                                </label>
                            </div>

                            <button
                                type="button"
                                disabled={!siteSlug}
                                onClick={createPage}
                                className="w-full rounded-xl bg-emerald-800 hover:bg-emerald-900 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-2xs transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Create page</span>
                            </button>
                        </section>
                    </div>

                    {draft && (
                        <>
                            {/* ACTIVE PAGE BANNER & TITLE EDIT */}
                            <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2.5">
                                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                                                {draft.title}
                                            </h2>
                                            {isNew && (
                                                <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                                    New Draft (Unsaved)
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 font-mono">
                                            {draft.siteSlug}: {draft.path}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {!isNew && publicUrl ? (
                                            <Link
                                                href={publicUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/70 transition-colors"
                                            >
                                                <span>View Live Page</span>
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </Link>
                                        ) : (
                                            <span className="text-2xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl">
                                                Save page to view live
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <label className="block space-y-1.5 max-w-xl">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Edit Page Title
                                    </span>
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
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 font-medium"
                                    />
                                </label>
                            </section>

                            {/* MAIN WORKSPACE: 2-COLUMN DASHBOARD (4 COLS TREE, 8 COLS INSPECTOR) */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                {/* LEFT PANEL: PAGE COMPONENT TREE (4 COLS) */}
                                <section className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                                                Page Components
                                            </h3>
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-2xs font-bold text-slate-600">
                                                {components.length} root
                                            </span>
                                        </div>
                                    </div>

                                    {/* ADD ROOT COMPONENT BAR */}
                                    <div className="space-y-1.5">
                                        <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
                                            + Add Root Component
                                        </span>
                                        <div className="grid grid-cols-2 gap-2">
                                            {componentTypes.map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => addComponent(type)}
                                                    className="rounded-xl border border-dashed border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/50 bg-white p-2.5 text-xs font-bold text-slate-700 hover:text-emerald-900 transition-all duration-150 flex items-center justify-center gap-1.5 shadow-2xs"
                                                >
                                                    <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    <span>{definitions[type].label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {components.length === 0 ? (
                                        <div className="py-10 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                                            <p className="text-xs font-semibold text-slate-600">
                                                No components on this page yet.
                                            </p>
                                            <p className="text-2xs text-slate-400">
                                                Click above to add a Section or Card Grid to your layout.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="pt-2">
                                            <PageTree
                                                nodes={components}
                                                selectedId={selectedId}
                                                onSelect={setSelectedId}
                                            />
                                        </div>
                                    )}
                                </section>

                                {/* RIGHT PANEL: SELECTED COMPONENT INSPECTOR (8 COLS FOR COMFORTABLE WIDTH) */}
                                <section className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
                                    {selectedNode ? (
                                        <>
                                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                                                    <h3 className="text-base font-extrabold tracking-tight text-slate-900">
                                                        Edit {definitions[selectedNode.type].label}
                                                    </h3>
                                                    <span className="text-2xs font-mono font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                                        {selectedNode.id}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={deleteSelected}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-rose-200 transition-colors"
                                                    title="Remove component and all nested children"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    <span>Delete</span>
                                                </button>
                                            </div>

                                            {/* SCHEMA DRIVEN FORM */}
                                            <GenericForm
                                                key={selectedNode.id}
                                                fields={definitions[selectedNode.type].fields}
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

                                            {/* ADD NESTED CHILDREN (IF SECTION) */}
                                            {definitions[selectedNode.type].acceptsChildren && (
                                                <div className="space-y-3 border-t border-slate-100 pt-5 mt-6">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                                            <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Add inside this {definitions[selectedNode.type].label}
                                                        </h4>
                                                        <span className="text-2xs text-slate-400">Nested slot</span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2.5">
                                                        {componentTypes.map(type => (
                                                            <button
                                                                key={type}
                                                                type="button"
                                                                className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-900 transition-colors flex items-center gap-1.5 shadow-2xs"
                                                                onClick={() =>
                                                                    addComponent(type, selectedNode.id)
                                                                }
                                                            >
                                                                <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                                                </svg>
                                                                <span>+ {definitions[type].label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="py-20 px-6 text-center space-y-3">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                                </svg>
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-700">
                                                No component selected
                                            </h4>
                                            <p className="text-xs text-slate-400 max-w-xs mx-auto">
                                                Select a component from the tree on the left to inspect and edit its properties.
                                            </p>
                                        </div>
                                    )}
                                </section>
                            </div>

                            {/* PORTABLE PAGE JSON ACCORDION / DISCLOSURE */}
                            <details className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition">
                                <summary className="flex cursor-pointer items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 focus:outline-hidden">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                        <span>Page JSON Representation (Portable Format)</span>
                                    </div>
                                    <span className="text-2xs font-mono text-slate-400 group-open:rotate-180 transition-transform">
                                        ▼
                                    </span>
                                </summary>
                                <div className="mt-4 pt-3 border-t border-slate-100">
                                    <pre className="max-h-96 overflow-auto rounded-xl bg-slate-900 p-4 text-xs font-mono text-emerald-300 leading-relaxed shadow-inner">
                                        {JSON.stringify(draft, null, 2)}
                                    </pre>
                                </div>
                            </details>
                        </>
                    )}
                </fieldset>
            </main>
        </div>
    );
}
