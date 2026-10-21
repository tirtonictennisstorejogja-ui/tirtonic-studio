// Cloudflare Pages Function: POST /api/idcc-ai. Logika ada di lib/idcc-ai.mjs.
// Kunci API diisi di Cloudflare Pages > Settings > Variables and Secrets (ANTHROPIC_API_KEY), tidak pernah di repo.
import { handle } from '../../lib/idcc-ai.mjs';
export const onRequest = ({ request, env }) => handle(request, env);
