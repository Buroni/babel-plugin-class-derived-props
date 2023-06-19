import { types as t } from "@babel/core";
import { buildUnderscoredClassAST, buildWrapperClassAST } from "./ast/index";
import { isProcessedClass, withPluginPrefix } from "./utils";

export default function () {
    return {
        visitor: {
            ClassDeclaration(path) {
                /**
                 * Create equivalent `__<class-name>` (prefixed) class for each class in the program, and transform the
                 * original class to a container which returns the prefixed version
                 */

                if (isProcessedClass(path)) {
                    return;
                }

                path.insertBefore(buildUnderscoredClassAST(path));

                // Replace original class with wrapper that returns prefixed class
                path.replaceWith(buildWrapperClassAST(path));

                // Remove `__$TRANSFORMED__"` prefix from swapped class.
                // Gets around babel complaining about swapping classes with same name
                path.node.id.name = path.node.id.name.replace(
                    "__$TRANSFORMED__",
                    ""
                );
            },

            BinaryExpression(path) {
                /**
                 * Set `o instanceof <class-name>` to `o instanceof __<class-name>` where applicable
                 */
                const {
                    node: { right, operator },
                } = path;
                const prefixedName = withPluginPrefix(right.name);

                if (
                    operator === "instanceof" &&
                    path.scope.hasBinding(prefixedName)
                ) {
                    path.get("right").replaceWith(t.identifier(prefixedName));
                }
            },

            MemberExpression(path) {
                /**
                 * Set `<obj-name>.prototype` to `__<obj-name>.prototype` where applicable
                 */
                const { node } = path;
                const prefixedName = withPluginPrefix(node.object.name);
                // If the object has an equivalent`__<obj-name>` and is accessing prototype,
                // change the prototype's object from `[pbj-name]` to `__<obj-name>`
                if (
                    node.property.name === "prototype" &&
                    path.scope.hasBinding(prefixedName)
                ) {
                    path.get("object").replaceWith(t.identifier(prefixedName));
                }
            },
        },
    };
}
