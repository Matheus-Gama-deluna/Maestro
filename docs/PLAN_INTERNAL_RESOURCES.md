# Internal Resource Loading Implementation Plan

## Goal
Modify the MCP Maestro server to read resources (specialists, templates, guides) from an internal directory bundled with the package, rather than searching the user's filesystem or external paths. This ensures robust and self-contained operation.

## User Review Required
- **Build Process Change**: A `prebuild` or `postbuild` step will be added to copy the `content` directory from the monorepo root to the `src` package directory.
- **Path Resolution**: `utils/files.ts` will strictly look for content in `../../content` relative to the compiled `dist/utils/files.js` (which maps to `<package_root>/content`).

## Proposed Changes

### Build Configuration
#### [MODIFY] [package.json](file:///d:/Sistemas/Maestro/src/package.json)
- Add a script to copy `../content` to `./content` before building or packaging.
- Ensure `content` directory is clean before copy.

### Source Code
#### [MODIFY] [files.ts](file:///d:/Sistemas/Maestro/src/src/utils/files.ts)
- Remove dependency on `content-injector.ts` for finding content.
- Implement `getServerContentDir` to return `path.join(__dirname, '..', '..', 'content')`.
- Remove fallback logic that searches `process.cwd()`.

### Content Injection (Optional but related)
- `content-injector.ts` can remain as is if it's used for `maestro init` (injecting into user project), but `files.ts` (reading for MCP) will be independent.

## Verification Plan

### Automated Tests
- Run `npm run build` and verify `content` folder exists in `src/content`.
- (Manual) Check if `dist/utils/files.js` logic correctly resolves to `src/content`.

### Manual Verification
- Start the server (`npm start:http`) or run it locally.
- Request a resource (e.g., `maestro://especialista/Gestão de Produto`).
- Verify it returns content without error.
