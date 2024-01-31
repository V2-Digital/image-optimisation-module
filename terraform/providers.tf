terraform {
  required_providers {
    util = {
      source  = "poseidon/util"
      version = "0.2.2"
    }

    aws = {
      source  = "hashicorp/aws"
      version = "~>5.7"
    }
  }
}

provider "util" {
}
