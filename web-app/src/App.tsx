import React from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';

// Chomecast Providers
import { ChromecastContextProvider, useChromecast } from './lib/useChromecast';
import { CastDevice } from './lib/types';

// Style
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// MUI Components
import { AppBar, Checkbox, Container, CssBaseline, FormControlLabel, FormGroup, FormLabel, Grid, InputAdornment, TextField, Toolbar, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

// Icons
import HttpIcon from '@mui/icons-material/Http';
import CastIcon from '@mui/icons-material/Cast';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

// Components
import SettingsDialog from './components/SettingsDialog';

function App() {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
	const theme = React.useMemo(
		() =>
			createTheme({
				palette: {
					mode: prefersDarkMode ? 'dark' : 'light',

					primary: {
						light: '#33bae7',
						main: '#00a9e2',
						dark: '#00769e',
						contrastText: '#ffffff',
					},
					secondary: {
						light: '#ab6bf0',
						main: '#783dbd',
						dark: '#450b8c',
						contrastText: '#ffffff',
					},
				},
			}),
		[prefersDarkMode]
	);

	const { devices, castUrl, stopCast } = useChromecast();
	const [selectedDevices, setSelectedDevices] = React.useState<CastDevice[]>([]);

	const [castURL, setCastURL] = React.useState('');

	const [loading, setLoading] = React.useState<boolean>(false);

	const handleDeviceSelected = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.checked === true) {
			setSelectedDevices([...selectedDevices, devices[index]]);
		} else {
			let array = [...selectedDevices];
			array.splice(array.indexOf(devices[index]), 1);
			setSelectedDevices(array);
		}
	};

	const handleCast = () => {
		setLoading(true);

		castUrl(castURL, selectedDevices).then(() => {
			setCastURL('');
			setSelectedDevices([]);
			setLoading(false);
		});
	};

	const handleStop = () => {
		setLoading(true);

		stopCast(selectedDevices).then(() => {
			setCastURL('');
			setSelectedDevices([]);
			setLoading(false);
		});
	};

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AppBar position='static' enableColorOnDark>
				<Toolbar>
					<CastIcon />
					<Typography variant='h6' component='div' sx={{ marginLeft: 2, flexGrow: 1 }}>
						Caster
					</Typography>

					<SettingsDialog />
				</Toolbar>
			</AppBar>

			<Container maxWidth='md'>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<TextField
							sx={{ marginTop: 16 }}
							fullWidth
							label='URL'
							variant='outlined'
							InputProps={{
								startAdornment: (
									<InputAdornment position='start'>
										<HttpIcon />
									</InputAdornment>
								),
							}}
							value={castURL}
							onChange={(e) => setCastURL(e.target.value)}
						/>
					</Grid>
					<Grid item xs={12}>
						<FormLabel component='legend'>Displays: </FormLabel>
						<FormGroup>
							{devices.map((device, i) => (
								<FormControlLabel
									key={i}
									control={<Checkbox />}
									label={device.friendlyName}
									onChange={(e) => {
										handleDeviceSelected(i, e as React.ChangeEvent<HTMLInputElement>);
									}}
									checked={selectedDevices.find((d) => d.address === device.address) != null}
								/>
							))}
						</FormGroup>
					</Grid>
					<Grid item xs>
						<LoadingButton
							fullWidth
							variant='contained'
							size='large'
							endIcon={<CastIcon />}
							loading={loading}
							loadingPosition='end'
							disabled={selectedDevices.length === 0 || castURL.trim() === '' || !castURL.startsWith('http')}
							onClick={handleCast}
						>
							<span>Cast</span>
						</LoadingButton>
					</Grid>
					<Grid item>
						{' '}
						<LoadingButton
							fullWidth
							variant='contained'
							size='large'
							color='error'
							endIcon={<CancelOutlinedIcon />}
							loading={loading}
							loadingPosition='end'
							disabled={selectedDevices.length === 0}
							onClick={handleStop}
						>
							<span>Stop</span>
						</LoadingButton>
					</Grid>
				</Grid>
			</Container>
		</ThemeProvider>
	);
}

function IntegrationChromecast() {
	const { enqueueSnackbar } = useSnackbar();

	return (
		<ChromecastContextProvider enqueueSnackbar={enqueueSnackbar}>
			<App />
		</ChromecastContextProvider>
	);
}

export default function IntegrationNotistack() {
	return (
		<SnackbarProvider maxSnack={3}>
			<IntegrationChromecast />
		</SnackbarProvider>
	);
}
