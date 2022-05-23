//
// clean.mjs
//   - Do the equivalent of: rm -rf build && mkdir -p build
//

import mkdirp from 'mkdirp';
import rimraf from 'rimraf';

const buildPath = './build';

function rmAndMkdir(dirName, cb) {
	rimraf(dirName, (err) => {
		if ( err ) {
			console.log(`An error occurred removing ${dirName}: ${err}`);
			cb(err);
		} else {
			mkdirp(dirName)
			.then((made) => {
				cb(null);
			})
			.catch((err) => {
				console.log(`An error occurred re-creating ${dirName}: ${err}`);
				cb(err);
			});
		}
	});
}

console.log('Starting clean...');
rmAndMkdir(buildPath, (err) => {
	if ( ! err ) {
		console.log('Clean complete');
	}
});
