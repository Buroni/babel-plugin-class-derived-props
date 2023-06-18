import { NodePath, types as t } from "@babel/core";
import { buildUnderscoredClassAST, buildWrapperClassAST } from "./ast/index";

const isProcessedClass = (path: NodePath<t.ClassDeclaration>) => {
    /**
     * Check if class has already been visited, i.e. has underscored name prefix or wrapped `__class` property
     */
    const { node } = path;

    if (node.id.name.startsWith("__")) {
        return true;
    }

    let isProcessed = false;
    path.traverse({
        Identifier(idPath) {
            if (idPath.node.name === "__class") {
                isProcessed = true;
                idPath.stop();
            }
        },
    });

    return isProcessed;
};

export default function () {
    return {
        visitor: {
            ClassDeclaration(path) {
                /**
                 * Create equivalent `__<class-name>` (underscored) class for each class in the program, and transform the
                 * original class to a container which returns the underscored version
                 */
                const { node } = path;

                if (isProcessedClass(path)) {
                    return;
                }

                path.insertBefore(buildUnderscoredClassAST(path));

                // Replace original class with wrapper that returns underscored class
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
                if (operator === "instanceof") {
                    path.get("right").replaceWith(
                        t.identifier(`__${right.name}`)
                    );
                }
            },

            MemberExpression(path) {
                /**
                 * Set `<obj-name>.prototype` to `__<obj-name>.prototype` where applicable
                 */
                const { node } = path;
                // If the object has an equivalent`__<obj-name>` and is accessing prototype,
                // change the prototype's object from `[pbj-name]` to `__<obj-name>`
                if (
                    node.property.name === "prototype" &&
                    path.scope.hasBinding(`__${node.object.name}`)
                ) {
                    path.get("object").replaceWith(
                        t.identifier(`__${node.object.name}`)
                    );
                }
            },
        },
    };
}
