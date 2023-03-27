import * as React from 'react';
import { useChromecast } from '../lib/useChromecast';
import { CastDevice } from '../lib/types';

import { IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Grid } from '@mui/material';

import { Settings, WifiFind, Delete } from '@mui/icons-material';

export default function SettingsDialog() {
	const [open, setOpen] = React.useState(false);

	const { devices: queryDevices, discovered, updateDevices } = useChromecast();

	const [devices, setDevices] = React.useState<CastDevice[]>(queryDevices);

	const handleAddDevice = () => {
		setDevices([
			...devices,
			{
				address: '',
				friendlyName: '',
			},
		]);
	};

	const handleRemoveDevice = (index: number) => {
		let array = [...devices];
		array.splice(index, 1);
		setDevices(array);
	};

	const handleChangeAddress = (index: number, value: string) => {
		let array = [...devices];
		array[index].address = value;
		setDevices(array);
	};

	const handleChangeName = (index: number, value: string) => {
		let array = [...devices];
		array[index].friendlyName = value;
		setDevices(array);
	};

	const fillDiscovered = () => {
		var arary = devices;
		arary = arary.concat(
			discovered.map((d) => {
				return {
					address: d.addresses[0],
					friendlyName: d.friendlyName,
				};
			})
		);
		setDevices(arary);
	};

	const handleSaveDevices = async () => {
		await updateDevices(devices);

		handleClose();
	};

	const handleClickOpen = () => {
		setDevices(queryDevices);
		setOpen(true);
	};
	const handleClose = () => {
		setOpen(false);
	};

	return (
		<>
			<IconButton size='large' color='inherit' onClick={handleClickOpen}>
				<Settings />
			</IconButton>
			<Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
				<DialogTitle>
					<Grid container spacing={2}>
						<Grid item xs>
							Configure Cast Devices
						</Grid>
						<Grid item>
							<Button
								fullWidth
								size='small'
								variant='outlined'
								color='error'
								startIcon={<Delete />}
								onClick={() => {
									setDevices([]);
								}}
							>
								Remove All
							</Button>
						</Grid>
						<Grid item>
							<Button fullWidth size='small' variant='outlined' startIcon={<WifiFind />} onClick={fillDiscovered}>
								Discover
							</Button>
						</Grid>
					</Grid>
				</DialogTitle>
				<DialogContent>
					<Grid container spacing={2}>
						{devices.map((d, i) => (
							<Grid key={i} item xs={12}>
								<Grid container spacing={2}>
									<Grid item xs>
										<TextField
											fullWidth
											label='Address'
											variant='standard'
											value={d.address}
											onChange={(e) => {
												handleChangeAddress(i, e.target.value);
											}}
										/>
									</Grid>
									<Grid item xs>
										<TextField
											fullWidth
											label='Name'
											variant='standard'
											value={d.friendlyName}
											onChange={(e) => {
												handleChangeName(i, e.target.value);
											}}
										/>
									</Grid>
									<Grid item>
										<IconButton size='large' onClick={() => handleRemoveDevice(i)}>
											<Delete />
										</IconButton>
									</Grid>
								</Grid>
							</Grid>
						))}
						<Grid item xs={12}>
							<Button fullWidth size='small' variant='outlined' onClick={handleAddDevice}>
								Add Device
							</Button>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color='inherit'>
						Cancel
					</Button>
					<Button onClick={handleSaveDevices} variant='contained'>
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
