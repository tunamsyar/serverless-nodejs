install:
	yarn install

clean:
	rm -rf node_modules yarn.lock

start:
	yarn start

start-redis:
	docker-compose up redis

stop-redis:
	docker-compose down redis

.PHONY: install clean start start-redis stop-redis
