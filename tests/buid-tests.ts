import { transform, parseSync } from "@babel/core";
import plugin from "../src/index";
import fs from "fs";
import path from "path";

const DIST_PATH = path.resolve(__dirname, "dist");

const ls = async (path_: string) => {
    // https://stackoverflow.com/a/59042581/2744990
    const dir = await fs.promises.opendir(path_);
    const paths = [];
    for await (const dirent of dir) {
        const dirPath = path.resolve(path_, dirent.name);
        if (!(await fs.promises.lstat(dirPath)).isDirectory()) {
            paths.push(dirPath);
        }
    }
    return paths;
};

(async () => {
    const testFiles = await ls(path.resolve(__dirname, "testfiles"));

    await fs.promises.rm(DIST_PATH, { force: true, recursive: true });
    await fs.promises.mkdir(DIST_PATH);

    for (const f of testFiles) {
        const content = await fs.promises.readFile(f, "utf-8");

        const output = await transform(content, {
            plugins: [plugin],
        });

        await fs.promises.writeFile(
            path.resolve(DIST_PATH, `${path.parse(f).name}.js`),
            output.code
        );
    }

    // TODO - mock instead of copying
    await fs.promises.cp(
        path.resolve(__dirname, "testfiles", "utils"),
        path.resolve(DIST_PATH, "utils"),
        { recursive: true }
    );
})();

// import {parseSync} from "@babel/core";
//
// const code = "a.ctor && a.ctor(...args)";
//
// console.dir(parseSync(code), { depth: null });
