import './conduit.css';
import { runApp } from './conduit.js';

try {
  runApp();
} catch ( ex ) {
  console.log(`FATAL ERROR: App stopped: ${JSON.stringify(ex, Object.getOwnPropertyNames(ex))}`);
}
