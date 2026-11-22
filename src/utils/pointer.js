// Keep receiving a pointer's moves after it leaves the element. Throws when
// the pointer is already gone (a finger lifted before the handler ran); the
// gesture still works without capture, so never let that abort a handler.
export function capturePointer(el, pointerId) {
  try {
    el.setPointerCapture?.(pointerId);
  } catch {
    // pointer no longer active
  }
}
