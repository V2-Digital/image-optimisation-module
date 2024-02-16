terraform {
  required_providers {
    util = {
      source  = "poseidon/util"
      version = "0.2.2"
    }

    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.7"
    }
  }


}

provider "aws" {
  alias  = "ap_southeast_2"
  region = "ap-southeast-2"
}
