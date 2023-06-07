import fs from "fs";
import path from "path";
import dt from "dependency-tree";
import { parseSync } from "@babel/core";
import { walk } from "estree-walker";

const ENTRY_FILE = "demo/index.ts";

const fileList = dt.toList({ filename: ENTRY_FILE, directory: path.dirname(ENTRY_FILE) });

const getDependencies = (ident: string) => {
    const dependants = [];

    const dependantStack = [ident];

    while (dependantStack.length) {
        const currentIdent = dependantStack.pop();

        for (const fn of fileList) {
            const content = fs.readFileSync(fn, "utf-8");
            const ast = parseSync(content) as any;
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
                                    (ancestor.type === "ClassDeclaration" || ancestor.type === "FunctionDeclaration" || ancestor.type === "VariableDeclarator")
                                    && ancestor.id.name !== currentIdent
                                ) {
                                    dependants.push({name: ancestor.id.name, type: ancestor.type, file: fn, uses: currentIdent});
                                    dependantStack.push(ancestor.id.name);
                                }
                            }
                        }
                        stack.push({ ancestor: node, ancestorParent: parent });
                    }
                }
            );
        }
    }
    return dependants
};


const deps = getDependencies("MY_CONST");
// console.dir(deps, { depth: 4 });
console.log(deps);
