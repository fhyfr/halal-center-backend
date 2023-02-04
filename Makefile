build_dev:
	@docker-compose build halalcenter_api_service_dev

run_dev:
	@docker-compose up halalcenter_api_service_dev

stop:
	@docker-compose down

lint:
	npm run lint

.PHONY: run_dev build_dev lint