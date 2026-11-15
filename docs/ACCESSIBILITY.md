# Accessibility requirements (core theme of the challenge)

Target: WCAG 2.2 AA. Test with keyboard only and with a screen reader (VoiceOver or NVDA) if available.

## Must have
- Semantic landmarks (`header`, `main`, `nav`, `footer`), one `h1`, logical heading order.
- Every control reachable and operable by keyboard, visible focus ring, no keyboard traps.
- Shortcuts (document them on the page): Space = play/pause, N/P = next/previous record, E = toggle explore, Arrow keys = move probe, M = mute, D = read description again, +/- = volume.
- `aria-live="polite"` region for status and probe descriptions. Do not spam it: throttle to one update per 400 ms.
- Every frame has meaningful alt text AND a longer description block ("What you are seeing").
- Auto-generated frame description from pixel stats, for example: "Bright areas cover about 8% of the frame, mostly in the upper right. Colors are mainly warm." Mark it as auto-generated and approximate.
- Audio never starts on page load. First sound only after a user gesture. Clear "Press Space or the Play button to listen" message.
- Text captions for audio events during Tour mode (visible and in the live region).
- Contrast ratio 4.5:1 for text, 3:1 for UI. Touch targets at least 44 px.
- Honour `prefers-reduced-motion` (no auto-animating visuals) and support dark/light.
- Text is resizable to 200% without loss. Layout works on a 360 px wide phone.
- Provide a "Listen only" view with the visuals hidden, so the experience is not dependent on sight.
- Volume safety: master gain capped, limiter on, loud events soft-clipped.

## Nice to have
- Haptic pulse via `navigator.vibrate` on lightning events where supported (mobile).
- Speech via `speechSynthesis` for descriptions, off by default.

## Checks before release
- Lighthouse Accessibility score 95 or higher.
- Tab through the whole page without a mouse.
- Run with the screen hidden: can you choose a record, play it, explore it, and download the WAV?
