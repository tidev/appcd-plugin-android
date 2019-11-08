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
