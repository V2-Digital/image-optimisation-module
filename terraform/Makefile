init:
	touch /tmp/index.js
	terraform init \
		-backend-config="bucket=$(APP_NAME)-$(APP_ENVIRONMENT)-terraform" \
		-backend-config="key=$(COMPONENT)/terraform.tfstate" \
		-backend-config="dynamodb_table=$(APP_ENVIRONMENT)-terraform-state-lock-table"

plan: init
	terraform plan

apply: init
	terraform apply -auto-approve

fmt_check:
	terraform fmt -check

destroy:
	terraform destroy
