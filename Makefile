build_dev:
	@docker-compose build halalcenter_api_service_dev

run_dev:
	@docker-compose up halalcenter_api_service_dev

stop:
	@docker-compose down

linter:
	npm run linter

.PHONY: run_dev build_dev linter