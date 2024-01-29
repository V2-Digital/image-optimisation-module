import { BunTypescript } from 'bun-ts-projen';

const project = new BunTypescript({
  name: 'image-optimisation-module',
  deps: ['@aws-sdk/client-s3', 'pino', 'sharp'],
  devDeps: ['bun-ts-projen', '@types/aws-lambda'],
  bunContainerVersion: "1.0.25-alpine",
  tsconfigPaths: {
    '@repositories': ['./src/repositories'],
    '@services': ['./src/services'],
    '@common': ['./src/common'],
    '@controllers': ['./src/controllers'],
  },
});

project.addGitIgnore('dist');
project.package.addField('type', 'module')

project.appService.addEnvironment('TEST_VAR', 'this is the test var value');

project.makefile.addRule({
  targets: ['build'],
  recipe: [
    'docker compose run --rm app bun install',
    'docker compose run --rm app bun run build',
  ],
});

project.package.setScript('node_start', 'node dist/index.js');

project.synth();
