import { transformSync, types as t } from "@babel/core";
import { build__classAst, buildClassAst } from "./asts";
import fs from "fs";

const content = fs.readFileSync("demo/index.ts", "utf-8");

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
        },
    };
}

const output = transformSync(content, {
    plugins: [myCustomPlugin],
});

fs.writeFileSync("./dist.js", output.code.replace(/__\$TRANSFORMED__/g, ""));
