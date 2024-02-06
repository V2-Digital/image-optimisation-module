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
  skipRunCommand: true
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

for (const [key, value] of Object.entries(AWS_ENV_OBJECT)) {
  project.appService.addEnvironment(key, value)
}

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

project.makefile.addRule({
  targets: ['run'],
  recipe: [
    'docker compose run --service-ports --rm app bun --hot run src/local.ts'
  ]
})

project.package.setScript('start:node', 'node terraform/templates/index.js');


const servicePort = 3000

project.appService.addEnvironment('PORT', servicePort.toString())
project.appService.addEnvironment('IMAGE_STORE_BUCKET', '${IMAGE_STORE_BUCKET:-}')
project.appService.addPort(servicePort, servicePort)


project.addGitIgnore('.terraform');

project.synth();
