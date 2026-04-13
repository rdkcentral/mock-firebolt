//
// clean.mjs
//   - Do the equivalent of: rm -rf build && mkdir -p build
//

import mkdirp from 'mkdirp';
import { rimraf } from 'rimraf';

const buildPath = './build';

async function rmAndMkdir(dirName) {
	try {
		await rimraf(dirName);
	} catch (err) {
		console.log(`An error occurred removing ${dirName}: ${err}`);
		throw err;
	}
	try {
		await mkdirp(dirName);
	} catch (err) {
		console.log(`An error occurred re-creating ${dirName}: ${err}`);
		throw err;
	}
}

console.log('Starting clean...');
try {
	await rmAndMkdir(buildPath);
	console.log('Clean complete');
} catch (err) {
	process.exit(1);
}

