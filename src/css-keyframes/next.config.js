// @ts-check
/* eslint-disable global-require, @typescript-eslint/no-var-requires, import/no-extraneous-dependencies, spaced-comment */

const path = require("path");
const dev = process.env.NODE_ENV !== "production";

const withTM = require("next-transpile-modules")([
  path.resolve(__dirname, "../core"),
  path.resolve(__dirname, "../types"),
  path.resolve(__dirname, "../react"),
]);

/** @type {import("next/dist/server/config").NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: dev,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias["~"] = path.resolve(__dirname, "../");
    return config;
  },

  // Required in `NextConfig` type
  experimental: undefined,
  future: undefined,
};

module.exports = withTM(nextConfig);
