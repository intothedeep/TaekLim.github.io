import path from 'path';

import i18n from './i18n.config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'export',
    // async exportPathMap(defaultPathMap) {
    //     return {
    //         ...defaultPathMap,
    //         '/sitemap.xml': { page: '/sitemap.xml' }, // Map the sitemap route
    //     };
    // },
    webpack: (config, options) => {
        config.module.rules.push({
            test: /\.(pdf)$/,
            type: 'asset/resource',
        });

        // TODO scss css loader
        // config.module.rules.push({
        // 	test: /\.(scss|css)$/,
        // 	use: ["style-loader", "css-loader", "sass-loader"],
        // });

        updateSVGR(config);
        updateAlias(config);

        return config;
    },
    // i18n: i18n,
};

export default nextConfig;

const updateSVGR = (config) => {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
        rule.test?.test?.('.svg'),
    );

    config.module.rules.push(
        // Reapply the existing rule, but only for svg imports ending in ?url
        {
            ...fileLoaderRule,
            test: /\.svg$/i,
            resourceQuery: /url/, // *.svg?url
        },
        // Convert all other *.svg imports to React components
        {
            test: /\.svg$/i,
            issuer: fileLoaderRule.issuer,
            resourceQuery: {
                not: [...fileLoaderRule.resourceQuery.not, /url/],
            }, // exclude if *.svg?url
            use: ['@svgr/webpack'],
        },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
};

const updateAlias = (config) => {
    const alias = config.resolve.alias;

    config.resolve.alias = {
        ...alias,
        '@svg': [
            path.resolve(process.cwd(), './src/assets/svgs'),
            path.resolve(process.cwd(), 'src/assets/svgs'),
        ],
        '@ui': [
            path.resolve(process.cwd(), './src/components/ui'),
            path.resolve(process.cwd(), 'src/components/ui'),
        ],
        '@components': [
            path.resolve(process.cwd(), './src/components'),
            path.resolve(process.cwd(), 'src/components'),
        ],
    };

    return config;
};
