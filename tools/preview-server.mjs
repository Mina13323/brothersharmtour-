/**
 * Dev-only preview server.
 *
 * The sandbox this project was built in has no PHP binary, so the live preview
 * is served through a WebAssembly PHP 8.3 runtime (@php-wasm/node): the repo is
 * mounted into the wasm filesystem and every request is handed to
 * public/index.php, which is the exact same entry point `php -S` would use.
 *
 *   node tools/preview-server.mjs [port]
 *
 * Anywhere with a real PHP installed, use the simpler path instead:
 *
 *   composer install && php artisan serve        # Laravel
 *   php -S localhost:8000 -t public              # micro runtime
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] || process.env.PORT || 8000);

const MIME = {
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.json': 'application/json',
	'.webp': 'image/webp',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.ico': 'image/x-icon',
	'.webmanifest': 'application/manifest+json',
	'.avif': 'image/avif',
	'.woff2': 'font/woff2',
};

async function loadRuntime() {
	for (const specifier of ['@php-wasm/node', '/home/user/.phpw/node_modules/@php-wasm/node/index.js']) {
		try {
			return await import(specifier);
		} catch {
			/* try the next candidate */
		}
	}
	throw new Error('Could not load @php-wasm/node. Run: npm i @php-wasm/node');
}

async function loadUniversal() {
	for (const specifier of ['@php-wasm/universal', '/home/user/.phpw/node_modules/@php-wasm/universal/index.js']) {
		try {
			return await import(specifier);
		} catch {
			/* try the next candidate */
		}
	}
	throw new Error('Could not load @php-wasm/universal.');
}

const { loadNodeRuntime, createNodeFsMountHandler } = await loadRuntime();
const { PHP } = await loadUniversal();

process.on('unhandledRejection', (reason) => console.error('· unhandled:', reason?.message || reason));
process.on('uncaughtException', (error) => console.error('· crashed:', error?.message || error));

console.log('· booting PHP 8.3 (wasm) …');
const runtime = await loadNodeRuntime('8.3', { emscriptenOptions: { processId: 1 } });
const php = new PHP(runtime, { documentRoot: '/app/public' });

await php.mount('/app', createNodeFsMountHandler(root));
fs.mkdirSync(path.join(root, 'storage/framework/views'), { recursive: true });

console.log(`· mounted ${root}`);

const server = http.createServer(async (req, res) => {
	const url = new URL(req.url, 'http://localhost');
	const pathname = decodeURIComponent(url.pathname);

	const chunks = [];
	for await (const chunk of req) {
		chunks.push(chunk);
	}
	const body = Buffer.concat(chunks);

	const headers = {};
	for (const [key, value] of Object.entries(req.headers)) {
		headers[key] = Array.isArray(value) ? value.join(', ') : value;
	}
	headers.host = req.headers.host || `localhost:${port}`;

	// Extra .php entrypoints (debug scripts, installer) run through PHP too.
	if (pathname.endsWith('.php')) {
		try {
			const response = await php.run({
				scriptPath: '/app/public' + pathname,
				relativeUri: pathname + (url.search || ''),
				method: req.method,
				headers,
				body: body.length ? body.toString('binary') : undefined,
			});

			res.writeHead(response.httpStatusCode || 200, { 'Content-Type': 'text/plain; charset=utf-8' });
			res.end((response.text ?? '') + (response.errors ? '\n\n' + response.errors : ''));
		} catch (error) {
			res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
			res.end(String(error?.message || error));
		}
		return;
	}

	// Static assets are cheaper to serve straight from disk.
	if (pathname !== '/') {
		const file = path.join(root, 'public', pathname);
		if (file.startsWith(path.join(root, 'public')) && fs.existsSync(file) && fs.statSync(file).isFile()) {
			res.writeHead(200, {
				'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
				'Cache-Control': 'no-store',
			});
			fs.createReadStream(file).pipe(res);
			return;
		}
	}


	try {
		const response = await php.run({
			scriptPath: '/app/public/index.php',
			relativeUri: pathname + (url.search || ''),
			method: req.method,
			headers,
			body: body.length ? body.toString('binary') : undefined,
		});

		const text = (response.text ?? '') + (response.exitCode === 255 && response.errors ? '\n<!-- ' + String(response.errors).slice(0, 4000) + ' -->' : '');
		const status = response.httpStatusCode || 200;
		const outHeaders = { 'Cache-Control': 'no-store' };

		for (const [name, value] of Object.entries(response.headers || {})) {
			const v = Array.isArray(value) ? value.join(', ') : value;
			if (name.toLowerCase() !== 'content-type' && name.toLowerCase() !== 'content-length') {
				outHeaders[name] = v;
			}
		}

		outHeaders['Content-Type'] =
			(response.headers?.['content-type']?.[0] || 'text/html; charset=UTF-8') + '';

		res.writeHead(status, outHeaders);
		res.end(Buffer.from(text, 'utf8'));
	} catch (error) {
		console.error('preview error:', error?.message || error);
		res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
		res.end(`Preview runtime error\n\n${error?.stack || error}`);
	}
});

server.listen(port, '0.0.0.0', () => {
	console.log(`· preview ready on http://0.0.0.0:${port}`);
});
