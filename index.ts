import fs from "fs";
import path from "path";
import dt from "dependency-tree";
import { parseSync } from "@babel/core";
import { walk } from "estree-walker";

class Dependencies {
    public dependencies: any[] = [];
    public ident: string;

    private _tree: any[];

    public constructor(ident: string) {
        this.ident = ident;
        this.getDependencies();
    }

    public get tree() {
        if (this._tree) {
            return this._tree;
        } else {
            return this.toTree(this.ident);
        }
    }

    private getDependencies() {
        const dependantStack = [this.ident];

        while (dependantStack.length) {
            const currentIdent = dependantStack.pop();
            this.traverseFileList(currentIdent, dependantStack);
        }
        return this.dependencies;
    }

    private walkFileAST(
        ast: any,
        currentIdent: string,
        fn: string,
        dependantStack: string[]
    ) {
        const stack = [];
        walk(ast, {
            enter: (node, parent) => {
                if (node.type === "Identifier" && node.name === currentIdent) {
                    while (stack.length) {
                        const { ancestor, ancestorParent } = stack.pop();
                        if (ancestorParent.type === "Program") {
                            stack.length = 0;
                        }
                        if (
                            (ancestor.type === "ClassDeclaration" ||
                                ancestor.type === "FunctionDeclaration" ||
                                ancestor.type === "VariableDeclarator") &&
                            ancestor.id.name !== currentIdent
                        ) {
                            if (
                                this.dependencies.every(
                                    (d) =>
                                        d.name !== ancestor.id.name ||
                                        d.uses !== currentIdent
                                )
                            ) {
                                this.dependencies.push({
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
            },
        });
    }

    private traverseFileList(currentIdent: string, dependantStack: string[]) {
        for (const fn of fileList) {
            const content = fs.readFileSync(fn, "utf-8");
            const ast = parseSync(content) as any;
            this.walkFileAST(ast, currentIdent, fn, dependantStack);
        }
    }

    private toTree(ident: string, tree: any = []) {
        for (const d of this.dependencies) {
            if (d.uses === ident) {
                tree.push(d);
                d.dependencies = this.toTree(d.name, d.chilren);
            }
        }
        return tree;
    }
}

const ENTRY_FILE = "demo/index.ts";

const fileList = dt.toList({
    filename: ENTRY_FILE,
    directory: path.dirname(ENTRY_FILE),
});

const d = new Dependencies("MY_CONST");
console.dir(d.tree, { depth: 5 });
