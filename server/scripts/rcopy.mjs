//
// rcopy.mjs
//   - Do the equivalent of: cp -r <fromDir> <toDir>
//

import * as fs from 'fs';
import * as recursiveCopy from 'recursive-copy';
const rCopy = recursiveCopy.default;

function rcp(fromDir, toDir, cb) {
	const options = {
		overwrite: true,
		dot: true,
		filter: [ '**/*' ]
	};
	rCopy(fromDir, toDir, options, (err) => {
		if ( err ) {
			console.log(`ERROR: Could not recursively copy from ${fromDir} to ${toDir}`);
			console.log(err);
		} else {
			console.log(`Recursively copied ${fromDir} to ${toDir}`);
		}
	});
}

const args = process.argv.slice(2);
if ( args.length !== 2 ) {
	console.log(`USAGE: node rcopy.mjs <fromDir> <toDir>`)
} else {
	rcp(args[0], args[1]);
}
