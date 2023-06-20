const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const webpack = require('webpack');
require('dotenv').config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: config => {
    const env = Object.keys(process.env).reduce((acc, curr) => {
      acc[`process.env.${curr}`] = JSON.stringify(process.env[curr]);
      return acc;
    }, {});
    config.plugins.push(new webpack.DefinePlugin(env));
    // config.plugins.push(
    //   new webpack.ProgressPlugin((percentage, message, ...args) => {
    //     console.info(percentage, message, ...args);
    //   })
    // );
    return config;
  }
}

module.exports = withBundleAnalyzer(nextConfig)