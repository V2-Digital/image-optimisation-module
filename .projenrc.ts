import { BunTypescript } from 'bun-ts-projen';

const PROJECT_NAME = 'image-optimisation-module';
const SERVICE_PORT = 3000;

const project = new BunTypescript({
  name: PROJECT_NAME,
  deps: ['@aws-sdk/client-s3', 'pino', 'sharp', 'axios'],
  devDeps: ['bun-ts-projen', '@types/aws-lambda'],
  bunContainerVersion: '1.0.25-slim',
  tsconfigCompilerOptionsOverride: {
    paths: {
      '@repositories': ['./src/repositories'],
      '@services': ['./src/services'],
      '@common': ['./src/common'],
      '@controllers': ['./src/controllers'],
    },
  },
  skipRunCommand: true,
  appEnvironmentVariables: {
    AWS_ACCESS_KEY_ID: '${AWS_ACCESS_KEY_ID:-}',
    AWS_SECRET_ACCESS_KEY: '${AWS_SECRET_ACCESS_KEY:-}',
    AWS_SESSION_TOKEN: '${AWS_SESSION_TOKEN:-}',
    AWS_REGION: '${AWS_REGION:-ap-southeast-2}',
    IMAGE_STORE_BUCKET: '${IMAGE_STORE_BUCKET:-}',
    PORT: SERVICE_PORT.toString(),
  },
});

project.makefile.addRule({
  targets: ['build'],
  recipe: [
    'docker compose run --rm app bun install',
    'docker compose run --rm app bun run build',
  ],
});

project.appService.addEnvironment('ENVIRONMENT', 'local');

project.makefile.addRule({
  targets: ['clean'],
  recipe: ['docker compose down --remove-orphans --volumes'],
});

project.makefile.addRule({
  targets: ['run'],
  recipe: [
    'docker compose run --service-ports --rm app bun --hot run src/local.ts',
  ],
});

project.makefile.addRule({
  targets: ['lint'],
  recipe: ['docker compose run --service-ports --rm app bun run lint'],
});

project.makefile.addRule({
  targets: ['format'],
  recipe: ['docker compose run --service-ports --rm app bun run format'],
});

project.package.setScript('start:node', 'node terraform/templates/index.js');

project.appService.addPort(SERVICE_PORT, SERVICE_PORT);

project.synth();
