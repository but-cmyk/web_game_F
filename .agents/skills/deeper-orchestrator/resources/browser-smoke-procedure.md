# Browser Smoke Test Procedure

Read this resource during Phase 3 verification of each milestone.

## Procedure
1. **Launch Dev Server**: Run `npm run dev` in background or verify build via `npm run preview`.
2. **Access Application**: Open browser (via subagent or local test harness) at the local port.
3. **Verify Canvas Rendering**:
   - Check internal canvas size is exactly 320x180.
   - Verify integer scaling and crisp pixel art (no blurred smoothing).
   - Check horizontal and vertical centering across window resizes.
4. **Gameplay Interaction**:
   - Start a new run or trigger the target scene.
   - Execute at least 20 grid steps (using keyboard WASD/arrows or simulated touch input).
   - Verify turn processing, step events, and HUD updates.
5. **Console Inspection**:
   - Verify zero errors and zero unhandled rejections in browser console.
6. **Capture Artifact**:
   - Capture a viewport screenshot and embed it into the milestone walkthrough artifact.
7. **Clean Teardown**:
   - Terminate the background server process.

