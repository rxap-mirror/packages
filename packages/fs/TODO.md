# TODO: `@rxap/fs` Library Audit & Technical Debt Cleanup

This document outlines the findings from an architectural and functional audit of the `@rxap/fs` library.

---

## 🧪 Test Coverage Gap

### Extremely Minimal Tests
* **Status (2026-06):** Improved. `VirtualFile.clone` (name change / no-change) now has specs,
  added alongside the clone/immutability fixes.
* **Still untested:**
  - `FetchFile` network fetch logic, content-type normalization, retry-after-failure, and the
    single-`arrayBuffer` conversion path.
  - File writing (`write`, `writeTextContent`, `writeData`) and format conversions.
  - `AsyncVirtualFile.clone` and `virtualFileClone` validation.
  - Directory clear (`virtualDirectoryClear`) and recursive directory structures.
  - Nested directory matching and deletion (`removeFile` / `removeFileByMatch`) — verify the
    boolean propagation fix.
  - File downloads (`download-virtual-file.ts`).
* **Recommended Action:**
  - Create integration/unit tests for `FetchFile` using a mocked `fetch`.
  - Expand `virtual-file.spec.ts` to cover write options, text decoding and blob conversions.
  - Expand `virtual-directory.spec.ts` to cover file search by match and deletion paths.

---

## Resolved (2026-06)
The following audit items were fixed (with specs where applicable):
- No-op string `.replace()` in `clone` methods (`VirtualFile`, `AsyncVirtualFile`,
  `VirtualDirectory`, `virtualFileClone`) — the trailing name is now actually rewritten.
- Broken boolean propagation in `VirtualDirectory.removeFileByMatch` (now returns/short-circuits
  on a nested match).
- Inverted TypeScript overloads in `download-virtual-file.ts`.
- Self-referential `@rxap/fs` imports replaced with relative imports.
- `FetchFile` no longer caches a rejected promise (retry is possible) and reads the
  `ArrayBuffer` directly instead of round-tripping through a `Blob`.
