import { transformSync, types as t } from "@babel/core";
import { buildUnderscoredClassAST, buildClassAST } from "./asts";
import fs from "fs";

const content = fs.readFileSync("demo/service.ts", "utf-8");

// Array of transformed class names used for determining
// whether to transform a `prototype` access or `instanceof` expression
const seen = [];

function myCustomPlugin() {
    return {
        visitor: {
            ClassDeclaration(path) {
                /**
                 * Create equivalent `__[class-name]` (underscored) class for each class in the program, and transform the
                 * original class to a container which returns the underscored version
                 */
                const { node } = path;

                if (node.id.name.startsWith("__")) {
                    return;
                }

                const underscoredClassName = `__${node.id.name}`;

                if (!seen.includes(underscoredClassName)) {
                    // Insert the underscored class before original class
                    path.insertBefore(buildUnderscoredClassAST(path));
                    seen.push(underscoredClassName);
                }

                // Replace original class with wrapper that returns underscored class
                path.replaceWith(buildClassAST(path));

                seen.push(node.id.name);
            },

            BinaryExpression(path) {
                /**
                 * Set `o instanceof [obj-name]` to `o instanceof __[obj-name]` where applicable
                 */
                const {
                    node: { right, operator },
                } = path;
                if (operator === "instanceof" && seen.includes(right.name)) {
                    path.get("right").replaceWith(
                        t.identifier(`__${right.name}`)
                    );
                }
            },

            MemberExpression(path) {
                /**
                 * Set `[obj-name].prototype` to `__[obj-name].prototype` where applicable
                 */
                const { node } = path;
                // If the object has an equivalent`__[obj-name]` and is accessing prototype,
                // change the prototype's object from `[pbj-name]` to `__[obj-name]`
                if (
                    node.property.name === "prototype" &&
                    seen.includes(node.object.name)
                ) {
                    path.get("object").replaceWith(
                        t.identifier(`__${node.object.name}`)
                    );
                }
            },
        },
    };
}

const output = transformSync(content, {
    plugins: [myCustomPlugin],
});

// TODO - less naive way of removing `__$TRANSFORMED__` class prefix
fs.writeFileSync("./dist.js", output.code.replace(/__\$TRANSFORMED__/g, ""));
