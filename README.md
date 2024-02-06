Note: Please ensure NPM is installed on the machine deploying the terraform

TODO:
- [] Implement automated release pipeline to build lambda code
- [] Consider moving lambda code into s3 & injecting environment variables in as a file
- [] Consider what to do about cache control

### Running locally.

To run you will need to have docker installed on your local machine.

Once that has been setup you will need to set the following environment variables:

#### AWS ENVIRONMENT VARIABLES
``` bash
  AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY
  AWS_SESSION_TOKEN
  AWS_REGION
```

### APPLICATION ENVIRONMENT VARIABLES

```
  IMAGE_STORE_BUCKET=<NAME OF THE S3 BUCKET THE IMAGES ARE STORED IN>
```

Once these have been setup you will be able to execute the following command to get a mock image optimiser running locally.

```
  make run
```

Consider this server as a immitation of what cloudfront does when handling request.

You can test that function behaves as expected by opening your browser and navigating to the following url:

```
http://localhost:3000/<IMAGE_PATH>
```
