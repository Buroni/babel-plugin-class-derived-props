import { transformSync } from "@babel/core";
import fs from "fs";

const content = fs.readFileSync("demo/index.ts", "utf-8");

const constructorVisitor = {
    ClassProperty(path, { classProps }) {
        const { node } = path;
        classProps[node.key.name] = node;
    },
};

const updatePropsVisitor = {
    ClassProperty(path, { classProps, updated }) {
        const { node } = path;
        if (Object.keys(classProps).includes(node.key.name)) {
            if (
                JSON.stringify(classProps[node.key.name]) !==
                JSON.stringify(node)
            ) {
                path.replaceWith(classProps[node.key.name]);
                updated.v = true;
            }
        }
    },
};

const superClassVisitor = {
    Identifier(path, { superClassName, mergeNode }) {
        const { node } = path;
        if (node.name === superClassName) {
            path.replaceWith(mergeNode);
        }
    },
};

const classVisitor = {
    ClassDeclaration(path, { name, superPath }) {
        const { node } = path;
        if (node.superClass?.name === name) {
            const superNode = JSON.parse(JSON.stringify(superPath.node));

            superNode.id.name = `${superNode.id.name}__$TRANSFORMED`;

            const classProps = {};
            const updated = { v: false };
            path.traverse(constructorVisitor, { classProps });
            superPath.traverse(updatePropsVisitor, { classProps, updated });

            if (!updated.v) {
                return;
            }

            superPath.node.id.name = `${superPath.node.id.name}_${node.id.name}_MERGE`;
            const mergeNode = JSON.parse(JSON.stringify(superPath.node));

            path.traverse(superClassVisitor, {
                superClassName: node.superClass.name,
                mergeNode: mergeNode.id,
            });

            superPath.replaceWith(superNode);
            superPath.insertBefore(mergeNode);
        }
    },
};

function myCustomPlugin() {
    return {
        visitor: {
            ClassDeclaration(path) {
                const { node } = path;

                path.parentPath.traverse(classVisitor, {
                    name: node.id.name,
                    superPath: path,
                });
            },
        },
    };
}

const output = transformSync(content, {
    plugins: [myCustomPlugin],
});

fs.writeFileSync("./dist.js", output.code.replace(/__\$TRANSFORMED/g, ""));
