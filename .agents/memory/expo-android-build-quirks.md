---
name: Expo Android build quirks
description: Android release builds depend on valid Expo config values and Reanimated architecture settings.
---

Expo config should omit optional Android file/API-key fields when they are unused rather than setting them to `null`; the Android prebuild plugin can receive the unresolved value as an object and fail while resolving a path.

**Why:** A release prebuild failed in CI because an unused nullable Google Android config field was interpreted as a path-like value.

**How to apply:** Before an Android release build, validate the resolved Expo config and keep unused `googleServicesFile`/`googleMapsApiKey` fields absent. Reanimated 4 also requires Expo New Architecture to be enabled.