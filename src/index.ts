import { types as t } from "@babel/core";
import { buildUnderscoredClassAST, buildWrapperClassAST } from "./ast/index";
import {
    isProcessedClass,
    TRANSFORMED_PREFIX,
    withPluginPrefix,
} from "./utils";

export default function () {
    return {
        visitor: {
            ClassDeclaration(path) {
                /**
                 * Create equivalent `__<class-name>` (shadowed) class for each class in the program, and transform the
                 * original class to a container which returns the shadowed version
                 */

                if (isProcessedClass(path)) {
                    return;
                }

                path.insertBefore(buildUnderscoredClassAST(path));

                // Replace original class with wrapper that returns shadowed class
                path.replaceWith(buildWrapperClassAST(path));

                // Remove `__$TRANSFORMED__"` shadow from swapped class.
                // Gets around babel complaining about swapping classes with same name
                path.node.id.name = path.node.id.name.replace(
                    TRANSFORMED_PREFIX,
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
                const shadowedName = withPluginPrefix(right.name);

                if (
                    operator === "instanceof" &&
                    path.scope.hasBinding(shadowedName)
                ) {
                    path.get("right").replaceWith(t.identifier(shadowedName));
                }
            },

            MemberExpression(path) {
                /**
                 * Set `<obj-name>.prototype` to `__<obj-name>.prototype` where applicable
                 */
                const { node } = path;
                const shadowedName = withPluginPrefix(node.object.name);
                // If the object has an equivalent`__<obj-name>` and is accessing prototype,
                // change the prototype's object from `[pbj-name]` to `__<obj-name>`
                if (
                    node.property.name === "prototype" &&
                    path.scope.hasBinding(shadowedName)
                ) {
                    path.get("object").replaceWith(t.identifier(shadowedName));
                }
            },
        },
    };
}
