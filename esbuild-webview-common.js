/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// @ts-check

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

/**
 * @param {{
 *   entryPoints: Record<string, string>,
 *   srcDir: string,
 *   outdir: string,
 *   additionalOptions?: esbuild.BuildOptions
 * }} options
 * @param {string[]} args
 */
exports.run = async (options, args) => {
    const watch = args.includes('--watch');
    
    try {
        await fs.promises.mkdir(options.outdir, { recursive: true });
    } catch (e) {
        // Ignore
    }

    /** @type {esbuild.BuildOptions} */
    const buildOptions = {
        entryPoints: options.entryPoints,
        bundle: true,
        minify: true,
        sourcemap: true,
        format: 'esm',
        outdir: options.outdir,
        ...options.additionalOptions
    };

    if (watch) {
        const context = await esbuild.context(buildOptions);
        await context.watch();
        console.log('Watching for changes...');
    } else {
        await esbuild.build(buildOptions);
        console.log('Build complete');
    }
};
