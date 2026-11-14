import type { ReactElement } from "react";
import type { Field } from "@/lib/definitions";

export type FormValues = Record<string, unknown>;

type GenericFormProps = {
    fields: Field[];
    values: FormValues;
    onChange: (values: FormValues) => void;
};

type FieldInputProps = {
    field: Field;
    value: unknown;
    onChange: (value: unknown) => void;
};

// Check whether a value is an object.

function isRecord(value: unknown): value is FormValues {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}

// Create initial values for a group of fields.

function createDefaults(fields: Field[]): FormValues {
    const values: FormValues = {};

    for (const field of fields) {
        switch (field.kind) {
            case "text":
                values[field.name] = "";
                break;

            case "select":
                values[field.name] = field.options[0] ?? "";
                break;

            case "array":
                values[field.name] = [];
                break;

            case "object":
                if (!field.optional) {
                    values[field.name] = createDefaults(field.fields);
                }
                break;
        }
    }

    return values;
}

// Render a single field based on its definition.

function FieldInput({
    field,
    value,
    onChange
}: FieldInputProps): ReactElement {
    switch (field.kind) {
        case "text":
            return (
                <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        {field.label}
                    </label>

                    <input
                        type="text"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs transition-all duration-150 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20"
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                        value={typeof value === "string" ? value : ""}
                        onChange={event => {
                            onChange(event.target.value);
                        }}
                    />
                </div>
            );

        case "select":
            return (
                <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        {field.label}
                    </label>

                    <div className="relative">
                        <select
                            className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 py-2 pr-10 text-sm text-slate-900 shadow-2xs transition-all duration-150 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 cursor-pointer"
                            value={
                                typeof value === "string"
                                    ? value
                                    : field.options[0] ?? ""
                            }
                            onChange={event => {
                                onChange(event.target.value);
                            }}
                        >
                            {field.options.map(option => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            );

        case "object": {
            const objectValue = isRecord(value) ? value : {};

            return (
                <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                            {field.label}
                        </span>

                        {field.optional && isRecord(value) && (
                            <button
                                type="button"
                                className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline transition-colors flex items-center gap-1"
                                onClick={() => onChange(undefined)}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Remove {field.label}</span>
                            </button>
                        )}
                    </div>

                    {field.optional && !isRecord(value) ? (
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-emerald-600/40 bg-emerald-50/60 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
                            onClick={() => {
                                onChange(createDefaults(field.fields));
                            }}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add {field.label}</span>
                        </button>
                    ) : (
                        <div className="bg-white rounded-lg p-3.5 border border-slate-200/70 shadow-2xs">
                            <GenericForm
                                fields={field.fields}
                                values={objectValue}
                                onChange={onChange}
                            />
                        </div>
                    )}
                </div>
            );
        }

        case "array": {
            const items: unknown[] =
                Array.isArray(value) ? value : [];

            return (
                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                {field.label}
                            </span>
                            <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-2xs font-semibold text-slate-700">
                                {items.length} {items.length === 1 ? "item" : "items"}
                            </span>
                        </div>
                    </div>

                    {items.length === 0 && (
                        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 bg-slate-50/50">
                            No {field.label.toLowerCase()} added yet. Click &quot;Add item&quot; below.
                        </div>
                    )}

                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3.5 transition-all duration-150 hover:border-slate-300"
                            >
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                    <span className="text-xs font-bold tracking-tight text-slate-700 flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-800 text-2xs font-bold flex items-center justify-center">
                                            {index + 1}
                                        </span>
                                        Item {index + 1}
                                    </span>

                                    <button
                                        type="button"
                                        className="text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                                        onClick={() => {
                                            onChange(
                                                items.filter(
                                                    (_, currentIndex) =>
                                                        currentIndex !== index
                                                )
                                            );
                                        }}
                                        title="Remove item"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>Remove item</span>
                                    </button>
                                </div>

                                <GenericForm
                                    fields={field.fields}
                                    values={isRecord(item) ? item : {}}
                                    onChange={updatedItem => {
                                        const updatedItems = items.map(
                                            (currentItem, currentIndex) =>
                                                currentIndex === index
                                                    ? updatedItem
                                                    : currentItem
                                        );

                                        onChange(updatedItems);
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-white py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-600 hover:border-emerald-600 hover:bg-emerald-50/30 hover:text-emerald-800 transition-all duration-150 flex items-center justify-center gap-2 shadow-2xs"
                        onClick={() => {
                            onChange([
                                ...items,
                                createDefaults(field.fields)
                            ]);
                        }}
                    >
                        <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add item</span>
                    </button>
                </div>
            );
        }
    }
}

// Render every field in a group.

export function GenericForm({
    fields,
    values,
    onChange
}: GenericFormProps): ReactElement {
    return (
        <div className="space-y-4">
            {fields.map(field => (
                <FieldInput
                    key={field.name}
                    field={field}
                    value={values[field.name]}
                    onChange={newValue => {
                        const updatedValues = {
                            ...values,
                            [field.name]: newValue
                        };

                        if (newValue === undefined) {
                            delete updatedValues[field.name];
                        }

                        onChange(updatedValues);
                    }}
                />
            ))}
        </div>
    );
}
