import { transformSync } from "@babel/core";
import plugin from "../src/index";
import fs from "fs";
import path from "path";

const DIST_PATH = path.resolve(__dirname, "dist");

const ls = async (path_: string) => {
    // https://stackoverflow.com/a/59042581/2744990
    const dir = await fs.promises.opendir(path_);
    const paths = [];
    for await (const dirent of dir) {
        paths.push(path.resolve(path_, dirent.name));
    }
    return paths;
};

(async () => {
    const testFiles = await ls(path.resolve(__dirname, "testfiles"));
    for (const f of testFiles) {
        const content = fs.readFileSync(f, "utf-8");

        const output = transformSync(content, {
            plugins: [plugin],
        });

        if (!fs.existsSync(DIST_PATH)) {
            fs.mkdirSync(DIST_PATH);
        }

        fs.writeFileSync(
            path.resolve(DIST_PATH, `${path.parse(f).name}.js`),
            output.code
        );
    }
})();

// const content = fs.readFileSync("demo/nested.ts", "utf-8");
//
// const output = transformSync(content, {
//     plugins: [plugin],
// });
//
// fs.writeFileSync("./dist.js", output.code);
