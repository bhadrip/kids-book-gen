set shell := ["zsh", "-cu"]

setup:
    corepack install
    pnpm install --frozen-lockfile
    pnpm exec playwright install chromium

dev:
    pnpm dev

check:
    pnpm check

test:
    pnpm test

e2e:
    pnpm e2e

build:
    pnpm build

ci: check test e2e build

doctor:
    node scripts/doctor.mjs
