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

    fs.rmSync(DIST_PATH, { force: true, recursive: true });
    fs.mkdirSync(DIST_PATH);

    for (const f of testFiles) {
        const content = fs.readFileSync(f, "utf-8");

        const output = transformSync(content, {
            plugins: [plugin],
        });

        fs.writeFileSync(
            path.resolve(DIST_PATH, `${path.parse(f).name}.js`),
            output.code
        );
    }
})();
