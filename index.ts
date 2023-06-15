import { parseSync, transformSync } from "@babel/core";
import { build__classAst, buildClassAst } from "./asts";
import fs from "fs";

const content = fs.readFileSync("demo/simple.ts", "utf-8");

const seen = [];

const findSubClassesVisitor = {
    ClassDeclaration(path, { superName, __classes }) {
        const { node } = path;
        if (node.superClass?.name === superName) {
            __classes[`__${node.id.name}`] = build__classAst(path);
        }
    },
};

function myCustomPlugin({ types: t }) {
    return {
        visitor: {
            ClassDeclaration(path) {
                /**
                 * Create equivalent `__[class-name]` class for each class in the program, and transform the
                 * original class to a container which returns the underscored version
                 */
                const { node } = path;

                if (
                    node.id.name.startsWith("__") ||
                    seen.includes(node.id.name)
                ) {
                    return;
                }

                const __classes = {
                    [`__${node.id.name}`]: build__classAst(path),
                };

                path.parentPath.traverse(findSubClassesVisitor, {
                    superName: node.id.name,
                    __classes,
                });

                for (const __className in __classes) {
                    if (!seen.includes(__className)) {
                        path.insertBefore(__classes[__className]);
                        seen.push(__className);
                    }
                }

                path.replaceWith(buildClassAst(path));

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

const code = `A.prototype.hello = 1;`;

console.dir(parseSync(code), { depth: null });

fs.writeFileSync("./dist.js", output.code.replace(/__\$TRANSFORMED__/g, ""));
