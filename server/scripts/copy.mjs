//
// copy.mjs
//   - Do the equivalent of: cp <fromFile> <toFile>
//

import * as fs from 'fs';

function cp(fromFile, toFile, cb) {
	fs.copyFile(fromFile, toFile, (err) => {
		if ( err ) {
			console.log(`ERROR: Could not copy from ${fromFile} to ${toFile}`);
			console.log(err);
		} else {
			console.log(`Copied ${fromFile} to ${toFile}`);
		}
	});
}

const args = process.argv.slice(2);
if ( args.length !== 2 ) {
	console.log(`USAGE: node copy.mjs <fromFile> <toFile>`)
} else {
	cp(args[0], args[1]);
}
