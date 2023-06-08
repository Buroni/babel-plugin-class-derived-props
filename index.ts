import fs from "fs";
import path from "path";
import dt from "dependency-tree";
import { parseSync } from "@babel/core";
import { walk } from "estree-walker";

const ENTRY_FILE = "demo/index.ts";

const fileList = dt.toList({ filename: ENTRY_FILE, directory: path.dirname(ENTRY_FILE) });

const toTree = (ident: string, dependancies: any[], tree: any = []) => {
    for (const d of dependancies) {
        if (d.uses === ident) {
            tree.push(d);
            d.dependencies = toTree(d.name, dependancies, d.chilren);
        }
    }
    return tree;
};

const getDependencies = (ident: string) => {
    const dependants = [];

    const dependantStack = [ident];

    const walkFileAST = (ast: any, currentIdent: string, fn: string) => {
        const stack = [];
        walk(ast,
            {
                enter(node, parent) {
                    if (node.type === "Identifier" && node.name === currentIdent) {
                        while (stack.length) {
                            const { ancestor, ancestorParent } = stack.pop();
                            if (ancestorParent.type === "Program") {
                                stack.length = 0;
                            }
                            if (
                                (
                                    ancestor.type === "ClassDeclaration" ||
                                    ancestor.type === "FunctionDeclaration" ||
                                    ancestor.type === "VariableDeclarator"
                                )
                                && ancestor.id.name !== currentIdent
                            ) {
                                if (dependants.every(d => d.name !== ancestor.id.name || d.uses !== currentIdent)) {
                                    dependants.push({
                                        name: ancestor.id.name,
                                        type: ancestor.type,
                                        file: fn,
                                        uses: currentIdent,
                                        dependencies: [],
                                    });
                                }
                                dependantStack.push(ancestor.id.name);
                            }
                        }
                    }
                    stack.push({ ancestor: node, ancestorParent: parent });
                }
            }
        );
    };

    const traverseFileList = (currentIdent: string) => {
        for (const fn of fileList) {
            const content = fs.readFileSync(fn, "utf-8");
            const ast = parseSync(content) as any;
            walkFileAST(ast, currentIdent, fn);
        }
    };

    while (dependantStack.length) {
        const currentIdent = dependantStack.pop();
        traverseFileList(currentIdent);
    }
    return dependants;
};


const deps = getDependencies("MY_CONST");
// console.dir(deps, { depth: 4 });
console.dir(toTree("MY_CONST", deps), { depth: 5 });
