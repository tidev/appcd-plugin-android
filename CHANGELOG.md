# v2.0.2 (Jun 4, 2020)

 * chore: Added API version 2.x.
 * chore: Updated dependencies.

# v2.0.1 (Jan 9, 2020)

 * chore: Switched to new `appcd.apiVersion`.
   [(DAEMON-309)](https://jira.appcelerator.org/browse/DAEMON-309)
 * chore: Updated dependencies.

# v2.0.0 (Nov 8, 2019)

 * BREAKING CHANGE: Renamed 'sdk' and 'ndk' to 'sdks' and 'ndks'.
 * BREAKING CHANGE: No longer scan for deprecated 'android' executable.
 * BREAKING CHANGE: Removed 'targets'. Combine 'addons' and 'platforms' to get same result.
 * fix: Fixed bug with selecting the correct default Android SDK.
 * feat: Wired up live configuration changes.
   [(DAEMON-198)](https://jira.appcelerator.org/browse/DAEMON-198)
 * chore: Update dependencies.

# v1.5.3 (Jun 3, 2020)

 * chore: Added API version 2.x.
 * chore: Updated dependencies.

# v1.5.2 (Jan 9, 2020)

 * chore: Switched to new `appcd.apiVersion`.
   [(DAEMON-309)](https://jira.appcelerator.org/browse/DAEMON-309)
 * chore: Updated dependencies.

# v1.5.1 (Nov 8, 2019)

 * chore: Updated dependencies.

# v1.5.0 (Aug 14, 2019)

 * chore: Added Appc Daemon v3 to list of compatible appcd versions.
 * chore: Updated dependencies.

# v1.4.0 (Jun 6, 2019)

 * fix: Updated config to remove redundant `android` namespace.
 * chore: Switched `prepare` script to `prepack`.

# v1.3.0 (Mar 29, 2019)

 * chore: Upgraded to Gulp 4.
 * chore: Update dependencies
 * fix: Updated filesystem watching to use new `appcd.fs.watch()` and `appcd.fs.unwatch()` to
   optimize subscriptions. [(DAEMON-253)](https://jira.appcelerator.org/browse/DAEMON-253)
 * fix: Utilize Genymotion service for detecting emulator changes instead of just watching the
   VirtualBox config. [(DAEMON-252)](https://jira.appcelerator.org/browse/DAEMON-252)

# v1.2.0 (Oct 25, 2018)

 * chore: Moved to `@appcd` scope
 * chore: Update dependencies
 * feat: Add Daemon 2.x support

# v1.1.0 (Apr 9, 2018)

 * fix: Removed `appcd-*` dependencies and locked down the appcd version in the `package.json`.
   [(DAEMON-208)](https://jira.appcelerator.org/browse/DAEMON-208)
 * fix: Improved `adb` tracking to re-initialize device tracking as soon as adb is discovered.
   [(DAEMON-164)](https://jira.appcelerator.org/browse/DAEMON-164)
 * fix: Add vbox config file to emulator watch paths.
   [(DAEMON-249)](https://jira.appcelerator.org/browse/DAEMON-249)
 * chore: Updated dependencies.

# v1.0.0 (Dec 5, 2017)

 * Initial release.
