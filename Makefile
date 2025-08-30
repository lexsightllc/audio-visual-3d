NODE_VERSION ?= 20.12.2
SEED ?= 42424242

.PHONY: setup dev build preview test validate demo evidence clean

setup:
	npm ci
	npx playwright install --with-deps

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

validate:
	npm run validate:schemas

demo: build
	# start preview in background
	npm run preview & echo $$! > .preview.pid
	# give server a moment
	sleep 2
	VITE_SEED=$(SEED) node scripts/smoke-e2e.mjs
	# stop preview
	-kill `cat .preview.pid` && rm .preview.pid
	@echo "Artifacts:"
	@ls -lah artifacts

evidence:
	npm run evidence

clean:
	rm -rf dist artifacts logs reports
	mkdir -p artifacts logs reports
