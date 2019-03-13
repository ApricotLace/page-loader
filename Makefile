nstall: install-deps

run:
	npx babel-node -- 'src/testik.js' 10

install-deps:
	npm install

build:
	rm -rf dist
	npm run build

test:
	npm test

test-coverage:
	npm test -- --coverage
lint:
	npx eslint .

publish:
	npm publish

.PHONY: test
