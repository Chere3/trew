import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {
      nextConfigPath: path.resolve(dirname, '../next.config.ts')
    }
  },
  staticDirs: [
    "../public"
  ],
  async webpackFinal(config) {
    // Ensure Next.js modules can be resolved
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(dirname, '../'),
      };
      // Ensure node_modules resolution includes project root
      if (config.resolve.modules) {
        config.resolve.modules = [
          path.resolve(dirname, '../node_modules'),
          ...(Array.isArray(config.resolve.modules) ? config.resolve.modules : ['node_modules']),
        ];
      } else {
        config.resolve.modules = [path.resolve(dirname, '../node_modules'), 'node_modules'];
      }
    }
    return config;
  },
  async viteFinal(config) {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(dirname, '../'),
      };
    }
    return config;
  },
};

export default config;
