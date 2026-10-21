// Netlify Function (cadangan selama masa pindah ke Cloudflare Pages). Logika ada di lib/idcc-ai.mjs.
import { handle } from '../../lib/idcc-ai.mjs';
export default (req) => handle(req, process.env);
