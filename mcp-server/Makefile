# ==========================================
# MCP Maestro Server - Make Commands
# ==========================================

.PHONY: build dev prod logs shell stop clean rebuild

# Build production image
build:
	docker-compose build --no-cache

# Run in development mode (with hot reload)
dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Run in production mode
prod:
	docker-compose up -d --build

# View logs
logs:
	docker-compose logs -f

# Shell into running container
shell:
	docker-compose exec mcp-maestro sh

# Stop all containers
stop:
	docker-compose down

# Clean everything (including volumes)
clean:
	docker-compose down -v --remove-orphans
	docker rmi mcp-server-mcp-maestro 2>/dev/null || true

# Rebuild and restart
rebuild: stop build prod

# Health check
health:
	curl -s http://localhost:3000/health | jq .

# Show status
status:
	docker-compose ps
