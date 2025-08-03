terraform {
  required_providers {
    util = {
      source  = "poseidon/util"
      version = "0.3.0"
    }

    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.7"
    }
  }
}
