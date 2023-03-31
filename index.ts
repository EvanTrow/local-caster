require('dotenv').config();

import express from 'express';
import bodyParser from 'body-parser';

import fs from 'fs';
import path from 'path';

import { spawn, exec } from 'child_process';

import chromecastDiscover from 'chromecast-discover';

//#region Cast Device Discover
let castDevices = [];
chromecastDiscover.on('online', (data) => {
	if (!castDevices.find((d) => d.id == data.id)) {
		castDevices.push(data);
	}
});
chromecastDiscover.on('update', (data) => {
	castDevices[castDevices.indexOf(castDevices.find((d) => d.id == data.id))] = data;
});
chromecastDiscover.start();
//#endregion

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '/dist')));

app.get('/discovered', (req, res) => {
	res.send(castDevices);
});

app.get('/devices', (req, res) => {
	try {
		fs.readFile('./config.json', 'utf8', (error, data) => {
			if (error) {
				console.log(error);
				res.status(500);
				res.send(String(error));
			} else {
				res.send(JSON.parse(data));
			}
		});
	} catch (error) {
		console.log(error);
		res.status(500);
		res.send(String(error));
	}
});

app.post('/devices', (req, res) => {
	try {
		fs.writeFile('./config.json', JSON.stringify(req.body), (error) => {
			if (error) {
				console.log(error);
				res.status(500);
				res.send(String(error));
			} else {
				res.send('ok');
			}
		});
	} catch (error) {
		console.log(error);
		res.status(500);
		res.send(String(error));
	}
});

app.get('/cast/:host', (req, res) => {
	try {
		castUrl(req.params.host, req.query.url as string).then((result) => {
			res.send(result);
		});
	} catch (error) {
		console.log(error);
		res.status(500);
		res.send(String(error));
	}
});

app.get('/stop/:host', (req, res) => {
	try {
		stopCast(req.params.host).then((result) => {
			res.send(result);
		});
	} catch (error) {
		console.log(error);
		res.status(500);
		res.send(String(error));
	}
});

app.listen(port, () => {
	return console.log(`Server is listening on port ${port}`);
});

async function castUrl(host: string, url: string) {
	url = decodeURIComponent(url);

	if (url.includes('docs.google.com/presentation')) {
		url = url.replace('/pub', '/embed');
	}

	console.log('Casting:', host, '<--', url);

	return new Promise((confirm, reject) => {
		const cmd = `catt -d ${host} stop && catt -d ${host} cast_site "${url}"`;

		console.log('Running:', cmd);

		exec(cmd, (err, stdout, stderr) => {
			if (err) {
				console.log(`Error!`, err);
				confirm(String(err));
			} else {
				if (stdout.trim().length > 0) {
					console.log(`stdout: ${stdout.trim()}`);

					confirm('ok');
				} else {
					console.log(`stderr: ${stderr.trim()}`);
					confirm(stderr.trim());
				}
			}
		});
	});
}

async function stopCast(host: string) {
	console.log('Stopping:', host);

	return new Promise((confirm, reject) => {
		const cmd = `catt -d ${host} stop`;

		console.log('Running:', cmd);

		exec(cmd, (err, stdout, stderr) => {
			if (err) {
				console.log(`Error!`, err);
				confirm(String(err));
			} else {
				if (stderr.trim().length > 0) {
					console.log(`stderr: ${stderr.trim()}`);
					confirm(stderr.trim());
				} else {
					confirm('ok');
				}
			}
		});
	});
}
