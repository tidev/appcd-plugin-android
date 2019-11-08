/* eslint-disable promise/always-return */

import appcdLogger from 'appcd-logger';
import DetectEngine from 'appcd-detect';
import gawk from 'gawk';
import version from './version';

import * as androidlib from 'androidlib';

import { arrayify, debounce, get, mergeDeep } from 'appcd-util';
import { cmd, exe } from 'appcd-subprocess';
import { DataServiceDispatcher } from 'appcd-dispatcher';
import { isFile } from 'appcd-fs';

const { gray } = appcdLogger.styles;

/**
 * The Android info service.
 */
export default class AndroidInfoService extends DataServiceDispatcher {
	/**
	 * Starts detecting Android information.
	 *
	 * @param {Config} cfg - An Appc Daemon config object.
	 * @returns {Promise}
	 * @access public
	 */
	async activate(cfg) {
		this.config = cfg;

		this.data = gawk({
			devices: [],
			emulators: [],
			ndks: [],
			sdks: []
		});

		/**
		 * The active device tracking handle used to get device events and stop tracking.
		 * @type {TrackDeviceHandle}
		 */
		this.trackDeviceHandle = null;

		/**
		 * A map of buckets to a list of active fs watch subscription ids.
		 * @type {Object}
		 */
		this.subscriptions = {};

		/**
		 * The path to the adb executable that will be used to track devices.
		 * @type {String}
		 */
		this.selectedADB = null;

		/**
		 * The user-configured path to adb. If not explicitly set, androidlib will attempt to
		 * auto-detect it.
		 * @type {String}
		 */
		this.userADB = null;

		if (cfg.android) {
			this.userADB = cfg.android.executables && cfg.android.executables.adb;
			mergeDeep(androidlib.options, cfg.android);
		}
		gawk.watch(cfg, 'android', () => mergeDeep(androidlib.options, cfg.android || {}));

		await Promise.all([
			this.initNDKs(),
			this.initSDKsDevicesAndEmulators()
		]);
	}

	/**
	 * Wires up the Android NDK detect engine.
	 *
	 * @returns {Promise}
	 * @access private
	 */
	async initNDKs() {
		this.ndkDetectEngine = new DetectEngine({
			checkDir(dir) {
				try {
					return new androidlib.ndk.NDK(dir);
				} catch (e) {
					// 'dir' is not an NDK
				}
			},
			depth:    1,
			env:      'ANDROID_NDK',
			exe:      `ndk-build${cmd}`,
			multiple: true,
			name:     'android:ndk',
			paths: [
				...arrayify(get(this.config, 'android.ndk.searchPaths'), true),
				...androidlib.ndk.ndkLocations[process.platform]
			],
			processResults: async (results, engine) => {
				if (results.length > 1) {
					results.sort((a, b) => version.compare(a.version, b.version));
				}

				// loop over all of the new ndks and set default version
				if (results.length) {
					let foundDefault = false;
					for (const result of results) {
						if (!foundDefault && (!engine.defaultPath || result.path === engine.defaultPath)) {
							result.default = true;
							foundDefault = true;
						} else {
							result.default = false;
						}
					}

					// no default found the system path, so just select the last/newest one as the default
					if (!foundDefault) {
						results[results.length - 1].default = true;
					}
				}
			},
			recursive:           true,
			recursiveWatchDepth: 0,
			redetect:            true,
			watch:               true
		});

		// listen for ndk results
		this.ndkDetectEngine.on('results', results => gawk.set(this.data.ndks, results));

		await this.ndkDetectEngine.start();

		gawk.watch(this.config, [ 'android', 'ndk', 'searchPaths' ], value => {
			this.ndkDetectEngine.paths = [
				...arrayify(value, true),
				...androidlib.ndk.ndkLocations[process.platform]
			];
		});
	}

	/**
	 * Wires up the Android SDK detect engine, then uses this information to detect connected
	 * devices and available emulators.
	 *
	 * @returns {Promise}
	 * @access private
	 */
	async initSDKsDevicesAndEmulators() {
		this.sdkDetectEngine = new DetectEngine({
			checkDir(dir) {
				try {
					return new androidlib.sdk.SDK(dir);
				} catch (e) {
					// 'dir' is not an SDK
				}
			},
			depth:    1,
			env:      [ 'ANDROID_SDK', 'ANDROID_SDK_ROOT' ],
			exe:      `../../adb${exe}`,
			multiple: true,
			name:     'android:sdk',
			paths: [
				...arrayify(get(this.config, 'android.sdk.searchPaths'), true),
				...androidlib.sdk.sdkLocations[process.platform]
			],
			processResults: async (results) => {
				// loop over all of the new sdks and set default version
				if (results.length) {
					const lookup = {};
					let foundDefault = false;

					for (const result of results) {
						result.default = false;
						lookup[result.path] = result;
					}

					for (const path of this.sdkDetectEngine.paths) {
						if (lookup[path]) {
							lookup[path].default = true;
							foundDefault = true;
							break;
						}
					}

					if (!foundDefault) {
						// since sdks aren't in any particular order, the first one is a good one
						results[0].default = true;
					}
				}
			},
			recursive: true,
			recursiveWatchDepth: 1,
			redetect: true,
			registryKeys: [
				{
					key: 'HKLM\\SOFTWARE\\Wow6432Node\\Android SDK Tools',
					value: 'Path'
				},
				{
					key: 'HKLM\\SOFTWARE\\Android Studio',
					value: 'SdkPath'
				}
			],
			watch: true
		});

		// listen for sdk results
		this.sdkDetectEngine.on('results', results => gawk.set(this.data.sdks, results));

		let initialized = false;

		const rescan = debounce(async () => {
			console.log('Rescanning Android emulators...');
			const emus = await androidlib.emulators.getEmulators({ force: true, sdks: this.data.sdks });
			console.log(`Found ${emus.length} emulators`);
			gawk.set(this.data.emulators, emus);
		});

		appcd.fs.watch({
			debounce: true,
			depth: 2,
			handler: rescan,
			paths: [ androidlib.avd.getAvdDir() ],
			type: 'avd'
		});

		try {
			const { response } = await appcd.call('/genymotion/1.x/info/emulators', { type: 'subscribe' });
			response.on('data', rescan);
		} catch (e) {
			console.warn('Unable to subscribe to Genymotion, reverting to watching the VirtualBox config');
			appcd.fs.watch({
				debounce: true,
				handler: rescan,
				depth: 2,
				paths: [
					androidlib.virtualbox.virtualBoxConfigFile[process.platform]
				],
				type: 'vboxconf'
			});
		}

		await new Promise((resolve, reject) => {
			// if sdks change, then refresh the simulators and update the targets object
			gawk.watch(this.data.sdks, async () => {
				// we need to pause gawk so two events dont fire
				this.data.__gawk__.pause();

				console.log('Android SDK changed, rescanning emulators');
				gawk.set(this.data.emulators, await androidlib.emulators.getEmulators({ force: true, sdks: this.data.sdks }));

				let adb = null;

				for (const sdk of this.data.sdks) {
					if (adb === null || sdk.default) {
						adb = sdk.platformTools.executables.adb || null;
					}
				}

				// if the user set their own adb, then use that instead of the default detected one
				if (this.userADB) {
					adb = this.userADB;
				}

				// if adb changed...
				if (adb !== this.selectedADB) {
					// ...set the option and handle device tracking
					console.log(`adb changed: ${this.selectedADB} => ${adb}`);

					this.selectedADB = adb;

					if (this.adbWatcherSid) {
						// whatever adb path we were watching just changed, so stop watching the old path
						await appcd.fs.unwatch('adb', [ this.adbWatcherSid ]);
						this.adbWatcherSid = null;
					}

					if (adb) {
						if (this.adbWatcherSid === null) {
							const { [adb]: sid } = await appcd.fs.watch({
								type: 'adb',
								paths: [ adb ],
								debounce: true,
								handler: ({ action }) => {
									if (action === 'add') {
										this.startTrackingDevices();
									} else if (action === 'delete') {
										this.stopTrackingDevices('adb was deleted');
									}
								}
							});
							this.adbWatcherSid = sid;
						}

						await this.startTrackingDevices();
					} else {
						this.stopTrackingDevices('adb no longer found');
					}
				}

				// now we need to resume gawk
				this.data.__gawk__.resume();

				if (!initialized) {
					initialized = true;
					resolve();
				}
			});

			this.sdkDetectEngine.start()
				.then(async results => {
					gawk.watch(this.config, [ 'android', 'sdk', 'searchPaths' ], value => {
						this.sdkDetectEngine.paths = [
							...arrayify(value, true),
							...androidlib.sdk.sdkLocations[process.platform]
						];
					});

					// if there's no results, then the gawk watch above never gets called
					if (!initialized && results.length === 0) {
						initialized = true;
						gawk.set(this.data.emulators, await androidlib.emulators.getEmulators({ force: true, sdks: this.data.sdks }));

						resolve();
					}
				})
				.catch(reject);
		});
	}

	/**
	 * Starts tracking devices if not already tracking and if `adb` was found.
	 *
	 * @returns {Promise}
	 * @access private
	 */
	startTrackingDevices() {
		return new Promise(resolve => {
			if (this.trackDeviceHandle || !isFile(this.selectedADB)) {
				return resolve();
			}

			// we have adb and we're not already tracking devices

			console.log('Starting device tracking %s', gray(`(${this.selectedADB})`));

			androidlib.options.executables.adb = this.selectedADB;

			this.trackDeviceHandle = androidlib.devices.trackDevices()
				.on('devices', devices => {
					console.log('Devices changed');
					console.log(devices);
					gawk.set(this.data.devices, devices);
					resolve();
				})
				.on('close', () => {
					console.log('ADB connection was closed');
					gawk.set(this.data.devices, []);

					if (this.trackDeviceHandle && !this.trackDeviceHandle.stopped) {
						// adb disconnected us and we should try to re-connect
						console.log('Attempting to restart device tracking in 2 seconds...');
						setTimeout(() => this.startTrackingDevices(), 2000);
					}

					this.trackDeviceHandle = null;
				})
				.once('error', err => {
					console.log('Track devices returned error: %s', err.message);
				});
		});
	}

	/**
	 * Stops tracking devices if already tracking and empties the list of devices.
	 *
	 * @param {String} msg - A message describing why device tracking is stopping.
	 * @access private
	 */
	stopTrackingDevices(msg) {
		if (this.trackDeviceHandle) {
			console.log('Stopping device tracking, %s', msg);
			this.trackDeviceHandle.stop();
			this.trackDeviceHandle = null;
		}

		// no adb == no devices
		console.log('Resetting devices');
		gawk.set(this.data.devices, []);
	}

	/**
	 * Stops the detect engines.
	 *
	 * @returns {Promise}
	 * @access public
	 */
	async deactivate() {
		if (this.trackDeviceHandle) {
			this.trackDeviceHandle.stop();
			this.trackDeviceHandle = null;
		}

		if (this.sdkDetectEngine) {
			await this.sdkDetectEngine.stop();
			this.sdkDetectEngine = null;
		}

		if (this.ndkDetectEngine) {
			await this.ndkDetectEngine.stop();
			this.ndkDetectEngine = null;
		}

		if (this.subscriptions) {
			for (const type of Object.keys(this.subscriptions)) {
				await appcd.fs.unwatch(type);
			}
		}
	}
}
