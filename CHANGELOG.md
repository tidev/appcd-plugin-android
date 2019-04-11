# v1.4.0

 * Updated config to remove redundant `android` namespace.

# v1.3.0 (Mar 29, 2019)

 * Upgraded to Gulp 4.
 * Update dependencies
 * Updated filesystem watching to use new `appcd.fs.watch()` and `appcd.fs.unwatch()` to optimize
   subscriptions. [(DAEMON-253)](https://jira.appcelerator.org/browse/DAEMON-253)
 * Utilize Genymotion service for detecting emulator changes instead of just watching the
   VirtualBox config.
   [(DAEMON-252)](https://jira.appcelerator.org/browse/DAEMON-252)

# v1.2.0 (Oct 25, 2018)

 * Moved to `@appcd` scope
 * Update dependencies
 * Add Daemon 2.x support

# v1.1.0 (Apr 9, 2018)

 * Removed `appcd-*` dependencies and locked down the appcd version in the `package.json`.
   [(DAEMON-208)](https://jira.appcelerator.org/browse/DAEMON-208)
 * Improved `adb` tracking to re-initialize device tracking as soon as adb is discovered.
   [(DAEMON-164)](https://jira.appcelerator.org/browse/DAEMON-164)
 * Add vbox config file to emulator watch paths.
   [(DAEMON-249)](https://jira.appcelerator.org/browse/DAEMON-249)
 * Updated npm dependencies.

# v1.0.0 (Dec 5, 2017)

 * Initial release.
