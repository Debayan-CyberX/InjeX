# Obsidian glass and living titanium

This visual pass adapts the user's locally available InboxIQ project and supplied screenshot for InjeX. The existing research pages and API contracts remain intact.

## Implementation

- The full workspace has a graphite-sage light field with moving, shaded folds, smoked obsidian glass, warm ivory text, translucent panels, fine illuminated borders, and raised active tabs. It uses an original analytic WebGL shader rather than a network video.
- The floating capsule dock adapts InboxIQ's glass refraction shader and HTML control composition. It links Overview, Live Detection, Attack Lab, and Comparison directly; Research opens Analytics, History, Dataset, Architecture, and About. Upstream attribution is included in `frontend/public/visuals-LICENSE.txt`.
- The hero is an actual Three.js mesh with neutral titanium material, warm ivory studio lights, and broad neutral fill. Its closed ribbon geometry, surface normals, orientation, and photographic reflections continuously change. Wrapped normals are stitched to keep the reflective seams smooth. The original image is a loading and no-WebGL fallback.
- Studio reflection lighting is generated locally. There are no external HDRs, 3D models, font CDNs, or visual-service requests.
- Motion uses requestAnimationFrame without React state updates per frame. Background and dock rendering are capped at 24 FPS; the hero at 30 FPS. Resolution and device pixel ratios are bounded. Hero rendering stops outside the visible frame; all visual loops stop when the browser tab is hidden.
- Live light pauses both the titanium form and background, retains their current state, and persists the preference. System reduced-motion settings keep a static scene. GPU errors are isolated from research controls. Forced WebGL context loss/restoration recovers both the chrome scene and backdrop. GPU resources and event listeners are cleaned up.
- The glass workspace grows to the full page length and uses normal document scrolling. The dock remains fixed above the page, with bottom clearance for the footer. Hash navigation resets document scroll.
- The chrome model uses raycasting against its actual surface. Hovering bends and twists a local part of the ribbon, with smooth relaxation on leave. Mouse or pen dragging rotates it. Research controls remain clickable and touch scrolling is preserved. Paused and reduced-motion modes disable interaction motion.

## Verification

- TypeScript and production builds pass. The 3D engine is loaded in an overview-only chunk of approximately 134 KB gzip; Vite reports its normal 500 KB raw-chunk advisory. The rest of the application remains split by page.
- All nine pages were checked at 375, 768, 1024, 1440, and 1920 pixels with no document overflow or uncaught browser exceptions. All nine also fit a 320-pixel viewport.
- The live chrome clock advances, the silver backdrop produces different rendered frames, and pausing freezes both. Pause persists across reload; resuming restores motion. Scrolling the hero out of view stops its animation clock.
- Dock routes, Research links, outside dismissal, Escape focus restoration, and route scroll reset pass. Full-page scrolling and dock positioning pass at all six checked widths, including 320 pixels. The footer is fully reachable above the floating dock. Hover deformation, drag rotation, and relaxation on pointer leave also pass.
- Reduced-motion mode keeps a static chrome frame. Disabling WebGL retains the original image and working detector navigation.
- Automated WCAG 2 A/AA and 2.1 AA checks cover all nine desktop and mobile pages. Matrix label contrast was corrected for the new glass palette.
- Existing real-backend interaction checks pass: prompt handoff, both detectors, preprocessing, keyboard submission, tabs and copy, stale results, six actual attack variants, graph/list/compare views, zoom, CSV export, matrix controls, history search/filter/sort/detail, dataset provenance, and architecture inspection.
- Deletion and HTTP-error handling are checked using isolated browser interception only; real history is not cleared.

## Visual review

[Overview](previews/silver/overview.png), [glass detection console](previews/silver/detection.png), and [mobile](previews/silver/mobile.png).

The free hosted API can sleep between visits and retains temporary shared process history. This pass does not change those existing backend behaviors.

## Obsidian palette verification

The approved palette is obsidian `#090B09`, ivory `#F1EFE7`, graphite `#181D18`, sage-grey `#A2ADA0`, acid-lime `#C7F36B`, and coral `#ED9690`. Blue optical tints have been removed from the panels, dock, backdrop shader, and studio environment. Ray source colors are deep graphite `#252C26`, soft sage-grey `#697565`, and warm highlights `#B8C2AE`; they remain neutral and restrained in the shader. Alpha, blur, refraction, geometry, full-page scrolling, floating navigation, and mesh interaction are preserved.

The palette pass has zero automated WCAG 2 A/AA and 2.1 AA violations on all nine desktop pages, all nine 320-pixel mobile pages, and the populated detector. Hover, drag, relaxation, six viewport widths, full-page scrolling, and footer clearance pass without uncaught browser errors.

## Sculpture visibility adjustment

Removed the lime reflection strip and green-biased material/fill light from the sculpture. Neutral graphite studio fill, a lighter titanium material, slightly softer reflections, and brighter ivory light boxes keep the full curved silhouette visible. The static fallback is brighter and grayscale. Page colors and backdrop rays are unchanged. Hover, drag, relaxation and footer clearance still pass at six viewport widths with no uncaught browser errors.
