---
name: Android release signing
description: Durable signing-key and release-build compatibility guidance for Nexus Premium.
---

Android release builds must use the persistent keystore stored in GitHub Actions Secrets. Do not generate a fresh signing key for each workflow run.

**Why:** Android only accepts an in-place update when the new APK is signed by the same key as the installed APK. A per-run key makes every later release require uninstalling the app.

**How to apply:** Keep the signing-secret names and the release signing configuration stable. If an older public APK was signed with an unknown key, treat install-over-update compatibility as unresolved and do not claim it is guaranteed.