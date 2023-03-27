import * as React from 'react';

import axios from 'axios';

import { CastDevice, DiscoveredCastDevice } from './types';
import { OptionsObject, SnackbarKey, SnackbarMessage, useSnackbar } from 'notistack';

/**
 * useEmail returns the Email Repos
 * ```typescript
 * // get full client instance
 * const Email = useEmail();
 * // or specific members of the SupabaseClient class
 * const { emails } = useEmail();
 * ```
 */

export const useChromecast = () => {
	const context = React.useContext(ChromecastContext);
	const { enqueueSnackbar } = useSnackbar();

	if (context === undefined) {
		throw new Error('useChromecast must be used within a ChromecastContext.Provider');
	}

	const updateDevices = async (devices: CastDevice[]) => {
		await axios
			.post('/devices', devices)
			.then((res) => {
				context.devices = devices;
				enqueueSnackbar('Device Configuration Saved!', { variant: 'success' });
			})
			.catch((err) => {
				console.error(err.response.data);
				enqueueSnackbar(err.response.data, { variant: 'error' });
			});
	};

	const castUrl = async (url: string, devices: CastDevice[]) => {
		return new Promise((confirm, reject) => {
			devices.forEach(async (device, i) => {
				try {
					await axios
						.get(`/cast/${device.address}?url=${url}`)
						.then((res) => {
							if (res.data === 'ok') {
								enqueueSnackbar(`URL Casting to ${device.friendlyName}`, { variant: 'success' });
							} else {
								enqueueSnackbar(`Error Casting to ${device.friendlyName}: ${res.data}`, { variant: 'error' });
							}
						})
						.catch((err) => {
							console.error(err.response.data);
							enqueueSnackbar(err.response.data, { variant: 'error' });
						});
				} catch (error) {}

				if (devices.length - 1 === i) confirm('');
			});
		});
	};

	const stopCast = async (devices: CastDevice[]) => {
		return new Promise((confirm, reject) => {
			devices.forEach(async (device, i) => {
				try {
					await axios
						.get(`/stop/${device.address}`)
						.then((res) => {
							if (res.data === 'ok') {
								enqueueSnackbar(`Stopped ${device.friendlyName}`, { variant: 'success' });
							} else {
								enqueueSnackbar(`Error stopping ${device.friendlyName}: ${res.data}`, { variant: 'error' });
							}
						})
						.catch((err) => {
							console.error(err.response.data);
							enqueueSnackbar(err.response.data, { variant: 'error' });
						});
				} catch (error) {}

				if (devices.length - 1 === i) confirm('');
			});
		});
	};

	return {
		devices: context.devices as CastDevice[],
		discovered: context.discovered as DiscoveredCastDevice[],
		updateDevices: updateDevices,
		castUrl: castUrl,
		stopCast: stopCast,
	};
};

export type ChromecastContextType = {
	devices: CastDevice[];
	discovered: DiscoveredCastDevice[];
	updateDevices?: (devices: CastDevice[]) => Promise<void>;
};

export const ChromecastContext = React.createContext<ChromecastContextType>({
	devices: [],
	discovered: [],
	updateDevices: undefined,
});

/**
 * ChromecastContextProvider is a context provider giving access to the Email to child along the React tree
 * ```typescript
 * <ChromecastContextProvider>
 *    <Content />
 * </ChromecastContextProvider>
 * ```
 */

export const ChromecastContextProvider: React.FC<{ children: JSX.Element; enqueueSnackbar: (message: SnackbarMessage, options?: OptionsObject | undefined) => SnackbarKey }> = ({
	children,
	enqueueSnackbar,
}) => {
	const [devices, setDevices] = React.useState<CastDevice[]>([]);
	const [discovered, setDiscovered] = React.useState<DiscoveredCastDevice[]>([]);

	React.useEffect(() => {
		const getDevices = async () => {
			await axios
				.get('/devices')
				.then((res) => {
					// console.log(res.data);
					setDevices(res.data);
				})
				.catch((err) => {
					console.error(err.response.data);
					enqueueSnackbar(err.response.data, { variant: 'error' });
				});
		};
		const getDiscovered = async () => {
			await axios
				.get('/discovered')
				.then((res) => {
					// console.log(res.data);
					setDiscovered(res.data);
				})
				.catch((err) => {
					console.error(err.response.data);
					enqueueSnackbar(err.response.data, { variant: 'error' });
				});
		};

		getDevices();
		getDiscovered();
	}, [enqueueSnackbar]);

	return <ChromecastContext.Provider value={{ devices: devices, discovered: discovered }}>{children}</ChromecastContext.Provider>;
};
