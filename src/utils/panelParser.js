/**
 * Generic parser factory for FormData that encodes a nested tree via
 * underscore-suffixed indices, e.g.:
 *
 *   {prefix}_{leafIdx}_..._{rootIdx}
 *
 * where the number of index segments tells you how deep a field lives
 * (root fields have 1 index, their children 2, grandchildren 3, ...),
 * and the indices themselves are ordered innermost -> outermost.
 *
 * This doesn't hardcode field names or depth — you describe your form's
 * shape once with a `schema`, and get back a `parse(form)` function.
 *
 * ---- schema shape ----
 * {
 *   // Property name, on each level's node, holding that level's children.
 *   // Length = number of non-leaf levels. E.g. 3 entries here means
 *   // 4 total levels (0..3), where level 3 is a leaf (no children prop).
 *   children: ["interfaces", "methods", "params"],
 *
 *   // Optional: property name to store the raw FormData key on a node.
 *   // Set to null/false to skip capturing it. Defaults to "path".
 *   pathProp: "path",
 *
 *   // Maps each FormData key prefix to where its value goes.
 *   fields: {
 *     [prefix]: {
 *       level: number,  // 0 = root level, 1 = children of root, ...
 *       prop: string,   // property on the node to assign the value to
 *       capturesPath:   // optional. Controls whether/how this field's raw
 *         true |        //   key gets captured into node[pathProp]:
 *         string |      //   - true: node[pathProp] is set directly to the key
 *                       //     (use when this is the only field at its level
 *                       //     that needs its path captured)
 *                       //   - "someKey": node[pathProp] becomes an object, and
 *                       //     the key is stored at node[pathProp]["someKey"]
 *                       //     — use this on EVERY field at a level when more
 *                       //     than one field there needs its path captured,
 *                       //     so they all land together under the same
 *                       //     node[pathProp] object instead of overwriting
 *                       //     each other
 *                       //   - omitted/false: don't capture a path for this field
 *     },
 *     ...
 *   },
 * }
 *
 * Unknown key prefixes are ignored, so a form can carry extra fields your
 * schema doesn't care about.
 */
function createFormTreeParser({ fields, children, pathProp = "path" }) {
    const maxLevel = children.length;

    const makeNode = (level) => {
        const node = {};
        if (level < maxLevel) node[children[level]] = new Map();
        return node;
    };

    const toArray = (map, level) =>
        Array.from(map.entries())
            .sort(([a], [b]) => a - b)
            .map(([, node]) => {
                if (level >= maxLevel) return node;
                const childProp = children[level];
                return { ...node, [childProp]: toArray(node[childProp], level + 1) };
            });

    // Accepts several shapes so callers don't have to remember exactly how
    // to unwrap their data source:
    //   - a plain array of [key, value] pairs
    //   - a FormData instance (or anything else with an `.entries()` method,
    //     like a Map) — `.entries()` is called for you
    //   - an iterable of [key, value] pairs (e.g. `formData.entries()` itself)
    return function parse(source) {
        const entries = Array.isArray(source)
            ? source
            : typeof source?.entries === "function"
                ? source.entries()
                : source;

        const roots = new Map();

        for (const [key, value] of entries) {
            const [prefix, ...rawIndices] = key.split("_");
            const fieldDef = fields[prefix];
            if (!fieldDef) continue; // not part of this schema, skip

            const { level, prop, capturesPath } = fieldDef;
            const indices = rawIndices.map(Number).reverse(); // root -> leaf order
            if (indices.length <= level) continue; // malformed key, skip

            let map = roots;
            let node;
            for (let l = 0; l <= level; l++) {
                const idx = indices[l];
                if (!map.has(idx)) map.set(idx, makeNode(l));
                node = map.get(idx);
                if (l < maxLevel) map = node[children[l]];
            }

            node[prop] = value;
            if (capturesPath && pathProp) {
                if (capturesPath === true) {
                    // Sole field at this level capturing a path: store it directly.
                    node[pathProp] = key;
                } else {
                    // Multiple fields at this level capture paths: merge them into
                    // one object under node[pathProp], keyed by `capturesPath`.
                    if (typeof node[pathProp] !== "object" || node[pathProp] === null) {
                        node[pathProp] = {};
                    }
                    node[pathProp][capturesPath] = key;
                }
            }
        }

        return toArray(roots, 0);
    };
}

export const parseEntities = createFormTreeParser({
    pathProp: "path",
    children: ["fields"],
    fields: {
        entity: { level: 0, prop: "name", capturesPath: true },
        field: { level: 1, prop: "name", capturesPath: true },
    },
});

export const parseExternalSdks = createFormTreeParser({
    pathProp: "path",
    children: ["interfaces", "methods", "params"],
    fields: {
        sdkName: { level: 0, prop: "name", capturesPath: true },
        interfaceName: { level: 1, prop: "name", capturesPath: true },
        methodName: { level: 2, prop: "name", capturesPath: "name" },
        returnType: { level: 2, prop: "returnType", capturesPath: "returnType" },
        paramName: { level: 3, prop: "name", capturesPath: "name" },
        type: { level: 3, prop: "type", capturesPath: "type" },
    },
});
