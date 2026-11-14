
import {
    definitions,
    type Field
} from "./definitions";

import type {
    ComponentType,
    Page
} from "./types";

function isRecord(
    value: unknown
): value is Record<string, unknown> {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}

function hasOwn(
    object: object,
    key: string
): boolean {
    return Object.prototype.hasOwnProperty.call(
        object,
        key
    );
}

// Validate props using the field definitions.

function validateFields(
    fields: Field[],
    value: unknown
): boolean {
    if (!isRecord(value)) {
        return false;
    }

    // Reject properties that are not in the schema.

    if (
        Object.keys(value).some(
            key => !fields.some(field => field.name === key)
        )
    ) {
        return false;
    }

    return fields.every(field => {
        if (!hasOwn(value, field.name)) {
            return (
                field.kind === "object" &&
                field.optional === true
            );
        }

        const fieldValue = value[field.name];

        switch (field.kind) {
            case "text":
                return typeof fieldValue === "string";

            case "select":
                return (
                    typeof fieldValue === "string" &&
                    field.options.includes(fieldValue)
                );

            case "object":
                return validateFields(
                    field.fields,
                    fieldValue
                );

            case "array":
                return (
                    Array.isArray(fieldValue) &&
                    fieldValue.every(item =>
                        validateFields(field.fields, item)
                    )
                );
        }
    });
}

// Validate a component instance and its descendants.

function validateNode(
    value: unknown,
    seenIds: Set<string>,
    depth = 0
): boolean {
    if (!isRecord(value) || depth > 30) {
        return false;
    }

    if (
        typeof value.id !== "string" ||
        !value.id.trim() ||
        seenIds.has(value.id)
    ) {
        return false;
    }

    if (
        typeof value.type !== "string" ||
        !hasOwn(definitions, value.type)
    ) {
        return false;
    }

    if (
        !Array.isArray(value.children) ||
        Object.keys(value).some(
            key =>
                !["id", "type", "props", "children"].includes(key)
        )
    ) {
        return false;
    }

    const definition =
        definitions[value.type as ComponentType];

    if (
        !definition.acceptsChildren &&
        value.children.length > 0
    ) {
        return false;
    }

    if (
        !validateFields(
            definition.fields,
            value.props
        )
    ) {
        return false;
    }

    seenIds.add(value.id);

    return value.children.every(child =>
        validateNode(child, seenIds, depth + 1)
    );
}

// Validate a complete page before saving.

export function isValidPage(
    value: unknown
): value is Page {
    if (!isRecord(value)) {
        return false;
    }

    if (
        typeof value.siteSlug !== "string" ||
        !value.siteSlug.trim() ||
        typeof value.title !== "string" ||
        !value.title.trim() ||
        typeof value.path !== "string" ||
        !Array.isArray(value.components)
    ) {
        return false;
    }

    // Allow "/" or lowercase paths such as "/about".

    const validPath =
        /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/;

    if (!validPath.test(value.path)) {
        return false;
    }

    const seenIds = new Set<string>();

    return value.components.every(node =>
        validateNode(node, seenIds)
    );
}
