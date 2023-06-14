import { transformSync, parseSync } from "@babel/core";
import { walk } from "estree-walker";
import fs from "fs";

const content = fs.readFileSync("demo/index.ts", "utf-8");

const constructorVisitor = {
    ClassProperty(path, { classProps }) {
        const { node } = path;
        classProps[node.key.name] = node;
    },
};

const updatePropsVisitor = {
    ClassProperty(path, { classProps }) {
        const { node } = path;
        if (Object.keys(classProps).includes(node.key.name)) {
            path.replaceWith(classProps[node.key.name]);
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
            path.traverse(constructorVisitor, { classProps });
            superPath.node.id.name = `${superPath.node.id.name}_${node.id.name}_MERGE`;
            superPath.traverse(updatePropsVisitor, { classProps });
            const mergeNode = JSON.parse(JSON.stringify(superPath.node));
            superPath.replaceWith(superNode);
            superPath.insertBefore(mergeNode);
            path.traverse(superClassVisitor, {
                superClassName: node.superClass.name,
                mergeNode: mergeNode.id,
            });
        }
    },
};

function myCustomPlugin({ types: t }) {
    return {
        visitor: {
            ClassDeclaration(path) {
                const { node } = path;

                path.parentPath.traverse(classVisitor, {
                    name: node.id.name,
                    superPath: path,
                });

                node.id.name = node.id.name.replace("__$TRANSFORMED", "");
            },
        },
    };
}

const output = transformSync(content, {
    plugins: [myCustomPlugin],
});

fs.writeFileSync("./dist.js", output.code);
