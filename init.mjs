import createDb from './server/init-db.mjs';
import fillDb from './cli/fill-server.mjs';

const main = () => {
    createDb();
    
    setTimeout(() => {
        fillDb();
    }, 1000);
}

main();