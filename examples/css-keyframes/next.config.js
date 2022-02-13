// @ts-check
/* eslint-disable global-require, @typescript-eslint/no-var-requires, import/no-extraneous-dependencies, spaced-comment */

const path = require("path");
const dev = process.env.NODE_ENV !== "production";

const libs = ["core", "types", "react", "undo-redo"];

const withTM = require("next-transpile-modules")(
  libs.map((lib) => path.resolve(__dirname, `../../libs/${lib}`)),
);

/** @type {import("next/dist/server/config").NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: dev,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    for (const lib of libs) {
      const libSrc = `../../libs/${lib}/src`;
      config.resolve.alias[`timelime/${lib}`] = path.resolve(__dirname, `${libSrc}/index.ts`);
      config.resolve.alias[`~${lib}`] = path.resolve(__dirname, libSrc);
    }
    return config;
  },

  // Required in `NextConfig` type
  experimental: undefined,
  future: undefined,
};

module.exports = withTM(nextConfig);
