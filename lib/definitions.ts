import type {
    ComponentType,
    PropsByType
} from "./types";

export type Field = {
    name: string;
    label: string;
} & (
        | {
            kind: "text";
        }
        | {
            kind: "select";
            options: string[];
        }
        | {
            kind: "object";
            optional?: boolean;
            fields: Field[];
        }
        | {
            kind: "array";
            fields: Field[];
        }
    );

export type ComponentDefinition<Props> = {
    label: string;
    acceptsChildren: boolean;
    fields: Field[];
    defaultProps: Props;
};

type Definitions = {
    [Name in ComponentType]:
    ComponentDefinition<PropsByType[Name]>;
};

export const definitions: Definitions = {
    Section: {
        label: "Section",
        acceptsChildren: true,

        defaultProps: {
            layout: "full",
            background: "none"
        },

        fields: [
            {
                name: "layout",
                label: "Layout",
                kind: "select",
                options: ["full", "two-column", "three-column"]
            },
            {
                name: "background",
                label: "Background",
                kind: "select",
                options: ["none", "light", "brand"]
            }
        ]
    },

    CardGrid: {
        label: "Card Grid",
        acceptsChildren: false,

        defaultProps: {
            title: "Meet the Team",
            subtitle: "",
            cards: []
        },

        fields: [
            {
                name: "title",
                label: "Title",
                kind: "text"
            },
            {
                name: "subtitle",
                label: "Subtitle",
                kind: "text"
            },
            {
                name: "cards",
                label: "Cards",
                kind: "array",

                fields: [
                    {
                        name: "heading",
                        label: "Heading",
                        kind: "text"
                    },
                    {
                        name: "image",
                        label: "Image",
                        kind: "object",

                        fields: [
                            {
                                name: "url",
                                label: "Image URL",
                                kind: "text"
                            },
                            {
                                name: "alt",
                                label: "Alt Text",
                                kind: "text"
                            }
                        ]
                    },
                    {
                        name: "link",
                        label: "Link",
                        kind: "object",
                        optional: true,

                        fields: [
                            {
                                name: "label",
                                label: "Link Label",
                                kind: "text"
                            },
                            {
                                name: "href",
                                label: "Link URL",
                                kind: "text"
                            }
                        ]
                    }
                ]
            },
            {
                name: "footerLink",
                label: "Footer Link",
                kind: "object",
                optional: true,

                fields: [
                    {
                        name: "label",
                        label: "Link Label",
                        kind: "text"
                    },
                    {
                        name: "href",
                        label: "Link URL",
                        kind: "text"
                    }
                ]
            }
        ]
    }
};
