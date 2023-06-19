import { NodePath, types as t } from "@babel/core";

const randomNumberCode = () => Math.floor(Math.random() * 90000) + 10000;

export const PLUGIN_PREFIX = `__${randomNumberCode()}_`;

export const withPluginPrefix = (name: string): string =>
    `${PLUGIN_PREFIX}${name}`;

export const isProcessedClass = (path: NodePath<t.ClassDeclaration>) => {
    /**
     * Check if class has already been visited, i.e. has prefixed name prefix or wrapped `__class` property
     */
    const { node } = path;

    if (node.id.name.startsWith("__")) {
        return true;
    }

    let isProcessed = false;
    path.traverse({
        Identifier(idPath) {
            if (idPath.node.name === withPluginPrefix("class")) {
                isProcessed = true;
                idPath.stop();
            }
        },
    });

    return isProcessed;
};
