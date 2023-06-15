import { transformSync, types as t } from "@babel/core";
import { build__classAst, buildClassAst } from "./asts";
import fs from "fs";

const content = fs.readFileSync("demo/index.ts", "utf-8");

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

                if (node.id.name.startsWith("__")) {
                    return;
                } else if (node.superClass) {
                    path.replaceWith(buildClassAst(path));
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
                    path.insertBefore(__classes[__className]);
                }

                console.log(__classes);

                path.replaceWith(buildClassAst(path));
            },
        },
    };
}

const output = transformSync(content, {
    plugins: [myCustomPlugin],
});

fs.writeFileSync("./dist.js", output.code.replace(/__\$TRANSFORMED__/g, ""));
