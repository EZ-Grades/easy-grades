# Package.json Updates Required

Add the following scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:report": "playwright show-report",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@types/node": "^20.10.0"
  }
}
```

Install the new dependencies:

```bash
npm install -D @playwright/test @types/node
npx playwright install
```
