# Memory & Performance Audit Report
**Date:** 2025-10-10
**Project:** asciifier-web

## Issues Found & Fixed

### 🔴 Critical Issues

1. **AsciiGallery.tsx - Async setState After Unmount**
   - **Location:** Line 116-118
   - **Issue:** `fetchSingleArt()` sets state in setTimeout without checking if component is mounted
   - **Impact:** Memory leak + "setState on unmounted component" warnings
   - **Fix:** Add mounted ref to prevent state updates after unmount

2. **Dropzone.tsx - Timeout Not Cleaned on Unmount**
   - **Location:** updateTimeoutRef
   - **Issue:** No cleanup in useEffect return for the debounce timeout
   - **Impact:** Timeout fires after unmount, attempting state update
   - **Fix:** Add cleanup function to clear timeout on unmount

3. **TextToAscii.tsx - Multiple Uncleaned Timeouts**
   - **Location:** Lines 149, 224, 240
   - **Issue:** setTimeout calls with no cleanup in useEffect
   - **Impact:** Timers fire after unmount
   - **Fix:** Store timeout IDs and clean up on unmount

### 🟡 Medium Issues

4. **SoundEngine - AudioContext Never Closed**
   - **Location:** utils/sounds.ts
   - **Issue:** AudioContext created but never closed (singleton pattern)
   - **Impact:** Minor - AudioContext persists but this is acceptable for singleton
   - **Fix:** Add cleanup method (optional, singleton is intentional)

5. **PNG Export - Large Canvas Creation**
   - **Location:** utils/exportUtils.ts downloadPNG
   - **Issue:** html-to-image creates large canvases, could spike memory on mobile
   - **Impact:** Temporary memory spike during export
   - **Fix:** Already mitigated by restoring element styles immediately

### ✅ Already Good

- Toast.tsx - Properly cleans up timers ✓
- simple-typewriter.js - Has dispose() method ✓
- TextToAscii debounce - Has cleanup ✓
- Dropzone timeout clearing - Clears before new timeout ✓

## Recommended Fixes

### Priority 1: Component Unmount Safety
All async operations and timeouts need mounted checks or cleanup.

### Priority 2: Mobile Performance
- PNG export already optimized
- Consider throttling rapid shuffle clicks
- Art cache limited to prevent unbounded growth

### Priority 3: Audio Context Management
Current singleton pattern is acceptable, but could add cleanup for completeness.
