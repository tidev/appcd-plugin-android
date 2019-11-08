module.exports = {
	adb: {
		install: {
			/**
			 * The number of milliseconds to wait before installing an app times out.
			 * @type {Number}
			 */
			timeout: null
		},

		/**
		 * The port to connect to ADB.
		 * @type {Number}
		 */
		port: null,

		start: {
			/**
			 * The number of milliseconds to wait before retrying to start ADB.
			 * @type {Number}
			 */
			retryInterval: null,

			/**
			 * The number of milliseconds to wait before starting ADB times out.
			 * @type {Number}
			 */
			timeout: null
		}
	},

	avd: {
		/**
		 * The path to where AVDs are stored.
		 * @type {String}
		 */
		path: null
	},

	emulator: {
		start: {
			/**
			 * The number of milliseconds to wait before starting the Android emulator times out.
			 * @type {Number}
			 */
			timeout: null
		}
	},

	env: {
		/**
		 * An override for the `PATH` environment variable for androidlib's ADB detection.
		 * @type {String}
		 */
		path: null
	},

	executables: {
		/**
		 * The path to the ADB executable.
		 * @type {String}
		 */
		adb: null
	},

	genymotion: {
		/**
		 * A list of paths to search for Genymotion.
		 * @type {Array.<String>}
		 */
		searchPaths: null
	},

	ndk: {
		/**
		 * A list of paths to search for Android NDKs.
		 * @type {Array.<String>}
		 */
		searchPaths: null
	},

	sdk: {
		/**
		 * A list of paths to search for Android SDKs.
		 * @type {Array.<String>}
		 */
		searchPaths: null
	},

	virtualbox: {
		/**
		 * The path to VirtualBox's XML config file.
		 * @type {String}
		 */
		configFile: null,

		/**
		 * A list of paths to search for VirtualBox.
		 * @type {Array.<String>}
		 */
		searchPaths: null
	}
};
