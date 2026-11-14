
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
                <label className="block space-y-1">
                    <span className="font-medium">
                        {field.label}
                    </span>

                    <input
                        type="text"
                        className="w-full rounded border p-2"
                        value={typeof value === "string" ? value : ""}
                        onChange={event => {
                            onChange(event.target.value);
                        }}
                    />
                </label>
            );

        case "select":
            return (
                <label className="block space-y-1">
                    <span className="font-medium">
                        {field.label}
                    </span>

                    <select
                        className="w-full rounded border p-2"
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
                </label>
            );

        case "object": {
            const objectValue = isRecord(value) ? value : {};

            return (
                <fieldset className="space-y-3 rounded border p-3">
                    <legend className="font-semibold">
                        {field.label}
                    </legend>

                    {field.optional && !isRecord(value) ? (
                        <button
                            type="button"
                            className="rounded border px-3 py-2"
                            onClick={() => {
                                onChange(createDefaults(field.fields));
                            }}
                        >
                            Add {field.label}
                        </button>
                    ) : (
                        <>
                            <GenericForm
                                fields={field.fields}
                                values={objectValue}
                                onChange={onChange}
                            />

                            {field.optional && (
                                <button
                                    type="button"
                                    className="text-red-600"
                                    onClick={() => onChange(undefined)}
                                >
                                    Remove {field.label}
                                </button>
                            )}
                        </>
                    )}
                </fieldset>
            );
        }

        case "array": {
            const items: unknown[] =
                Array.isArray(value) ? value : [];

            return (
                <fieldset className="space-y-3 rounded border p-3">
                    <legend className="font-semibold">
                        {field.label}
                    </legend>

                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="space-y-3 rounded border p-3"
                        >
                            <h3 className="font-semibold">
                                Item {index + 1}
                            </h3>

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

                            <button
                                type="button"
                                className="text-red-600"
                                onClick={() => {
                                    onChange(
                                        items.filter(
                                            (_, currentIndex) =>
                                                currentIndex !== index
                                        )
                                    );
                                }}
                            >
                                Remove item
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        className="rounded bg-blue-600 px-4 py-2 text-white"
                        onClick={() => {
                            onChange([
                                ...items,
                                createDefaults(field.fields)
                            ]);
                        }}
                    >
                        Add item
                    </button>
                </fieldset>
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
