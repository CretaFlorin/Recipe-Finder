.PHONY: backend frontend migrate start-all

migrate:
	cd backend && npx prisma migrate dev --name init

backend:
	cd backend && npm install && npm run start:dev

frontend:
	cd frontend && npm install && npm run dev

start-all: 
	$(MAKE) backend &
	$(MAKE) frontend &

