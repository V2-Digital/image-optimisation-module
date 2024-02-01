import { DockerCompose, DockerComposeService } from 'projen';

import { BunTypescript } from 'bun-ts-projen';

const PROJECT_NAME = 'image-optimisation-module';

const project = new BunTypescript({
  name: PROJECT_NAME,
  deps: ['@aws-sdk/client-s3', 'pino', 'sharp'],
  devDeps: ['bun-ts-projen', '@types/aws-lambda', 'projen'],
  bunContainerVersion: '1.0.25-slim',
  tsconfigPaths: {
    '@repositories': ['./src/repositories'],
    '@services': ['./src/services'],
    '@common': ['./src/common'],
    '@controllers': ['./src/controllers'],
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

const AWS_ENV_OBJECT = {
  AWS_ACCESS_KEY_ID: '${AWS_ACCESS_KEY_ID:-}',
  AWS_SECRET_ACCESS_KEY: '${AWS_SECRET_ACCESS_KEY:-}',
  AWS_SESSION_TOKEN: '${AWS_SESSION_TOKEN:-}',
  AWS_REGION: '${AWS_REGION:-ap-southeast-2}',
};

project.composeFile.addService(
  'terraform',
  new DockerComposeService('app', {
    imageBuild: {
      context: './containers',
      dockerfile: 'Dockerfile.terraform',
      args: {
        TERRAFORM_VERSION: '1.5.5',
      },
    },
    environment: {
      APP_ENVIRONMENT: '${APP_ENVIRONMENT:-dev}',
      APP_NAME: 'digital',
      COMPONENT: PROJECT_NAME,
      ...AWS_ENV_OBJECT,
    },
    volumes: [DockerCompose.bindVolume('./terraform', '/app')],
  }),
);

project.makefile.addRule({
  targets: ['init', 'plan', 'apply', 'tf_shell'],
  prerequisites: ['% :'],
  recipe: ['docker compose run --rm terraform make $(*)'],
});

project.makefile.addRule({
  targets: ['clean'],
  recipe: [
    'rm -rf terraform/.terraform dist',
    'docker compose down --remove-orphans --volumes',
  ],
});

project.package.setScript('node_start', 'node terraform/templates/index.js');

project.addGitIgnore('.terraform');

project.synth();
