import { transformSync, parseSync, types as t } from "@babel/core";
import generate from "@babel/generator";
import fs from "fs";

const content = fs.readFileSync("demo/index3.ts", "utf-8");

const codeToAst = (code: string) => ({ ...parseSync(code).program.body[0] });

const build__classAst = (path: any) => {
    const classProps = [];
    const { node } = path;
    const constr = node.body.body.find((n) => n.key?.name === "constructor");

    path.traverse(findClassPropsVisitor, { classProps });

    return t.classDeclaration(
        t.identifier(`__${node.id.name}`),
        node.superClass ? { ...node.superClass } : null,
        t.classBody([
            t.classMethod(
                "method",
                t.identifier("ctor"),
                [...constr.params],
                t.blockStatement([...constr.body.body])
            ),
            t.classMethod(
                "method",
                t.identifier("initProps"),
                [],
                t.blockStatement([
                    ...classProps.map((p) =>
                        t.expressionStatement(
                            t.assignmentExpression(
                                "=",
                                t.memberExpression(t.thisExpression(), p.key),
                                p.value
                            )
                        )
                    ),
                ])
            ),
        ])
    );
};

const findSubClassesVisitor = {
    ClassDeclaration(path, { superName, subClasses }) {
        const { node } = path;
        if (node.superClass?.name === superName) {
            console.log(`${superName} has subclass ${node.id.name}`);
            subClasses[node.id.name] = node;
        }
    },
};

const findClassPropsVisitor = {
    ClassProperty(path, { classProps }) {
        classProps.push(path.node); // TODO - destructure?
    },
};

function myCustomPlugin({ types: t }) {
    return {
        visitor: {
            ClassDeclaration(path) {
                const { node } = path;

                if (node.superClass) {
                    // We only want to deal with base classes in this visitor
                    return;
                }

                const subClasses = {};
                const __classes = {
                    [`__${node.id.name}`]: build__classAst(path),
                };

                console.log(__classes);

                // __classes[`__${node.id.name}`] = t.classDeclaration(`__${node.id.name}`, undefined, t.classBody())

                path.parentPath.traverse(findSubClassesVisitor, {
                    superName: node.id.name,
                    subClasses,
                });

                for (const subClassName in subClasses) {
                    const subClass = subClasses[subClassName];
                    // const c = t.classDeclaration(`__${subClassName}`, __classes[`__${node.id.name}`])
                }
            },
        },
    };
}

const output = transformSync(content, {
    plugins: [myCustomPlugin],
});
