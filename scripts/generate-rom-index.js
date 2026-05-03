import { readdirSync, statSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, relative, parse } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROMS_ROOT = join(__dirname, '../static/roms');
const OUTPUT_PATH = join(__dirname, '../src/data/roms.json');

const ROM_EXTENSIONS = new Set(['.gba', '.gbc', '.gb', '.smc', '.sfc', '.fig']);
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

const CONSOLE_BY_EXT = {
	'.gba': 'gba',
	'.gbc': 'gbc',
	'.gb': 'gb',
	'.smc': 'snes',
	'.sfc': 'snes',
	'.fig': 'snes'
};

const CONSOLE_META = {
	gba: { id: 'gba', name: 'Game Boy Advance', short: 'GBA' },
	gbc: { id: 'gbc', name: 'Game Boy Color', short: 'GBC' },
	gb: { id: 'gb', name: 'Game Boy', short: 'GB' },
	snes: { id: 'snes', name: 'Super Nintendo', short: 'SNES' }
};

function walk(dir) {
	const entries = readdirSync(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walk(full));
		} else if (entry.isFile()) {
			files.push(full);
		}
	}
	return files;
}

function cleanTitle(name) {
	return name
		.replace(/^\[[^\]]+\]\s*/g, '')
		.replace(/^\{[^}]+\}\s*/g, '')
		.replace(/^MiraiRetro\s+/i, '')
		.replace(/^\d+\s*-\s*/, '')
		.replace(/\s*\([^)]*\)/g, '')
		.replace(/\s*\[[^\]]*\]/g, '')
		.replace(/\s*\{[^}]*\}/g, '')
		.replace(/\s+v\d+(\.\d+)*\s*$/i, '')
		.replace(/^(megaman\s+battle\s+network\s+\d+)\s*-.*$/i, '$1')
		.replace(/^super\s+mario\s+advance\s+\d+\s*-\s*/i, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function toWebPath(absolutePath) {
	const rel = relative(join(__dirname, '../static'), absolutePath);
	return '/' + rel.split('\\').join('/');
}

function buildImageMap(allFiles) {
	const map = new Map();
	for (const file of allFiles) {
		const parsed = parse(file);
		if (!IMAGE_EXTENSIONS.has(parsed.ext.toLowerCase())) continue;
		map.set(parsed.name.toLowerCase(), file);
	}
	return map;
}

function findImage(romFile, imageMap) {
	const parsed = parse(romFile);
	const baseKey = parsed.name.toLowerCase();
	if (imageMap.has(baseKey)) return imageMap.get(baseKey);
	const cleaned = cleanTitle(parsed.name).toLowerCase();
	if (imageMap.has(cleaned)) return imageMap.get(cleaned);
	for (const [key, value] of imageMap) {
		if (key.startsWith(baseKey) || baseKey.startsWith(key)) return value;
	}
	return null;
}

function generate() {
	const allFiles = walk(ROMS_ROOT);
	const imageMap = buildImageMap(allFiles);

	const consoles = {};
	for (const meta of Object.values(CONSOLE_META)) {
		consoles[meta.id] = { ...meta, roms: [] };
	}

	for (const file of allFiles) {
		const parsed = parse(file);
		const ext = parsed.ext.toLowerCase();
		if (!ROM_EXTENSIONS.has(ext)) continue;

		const consoleId = CONSOLE_BY_EXT[ext];
		if (!consoleId) continue;

		const imagePath = findImage(file, imageMap);
		const stats = statSync(file);

		consoles[consoleId].roms.push({
			id: parsed.name,
			title: cleanTitle(parsed.name) || parsed.name,
			file: toWebPath(file),
			image: imagePath ? toWebPath(imagePath) : null,
			size: stats.size,
			ext: ext.replace('.', '')
		});
	}

	for (const c of Object.values(consoles)) {
		c.roms.sort((a, b) => a.title.localeCompare(b.title));
	}

	const orderedConsoles = ['gba', 'gbc', 'gb', 'snes']
		.map((id) => consoles[id])
		.filter((c) => c.roms.length > 0);

	const output = {
		generatedAt: new Date().toISOString(),
		totalRoms: orderedConsoles.reduce((sum, c) => sum + c.roms.length, 0),
		consoles: orderedConsoles
	};

	writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, '\t'));
	console.log(`Wrote ${output.totalRoms} ROMs across ${orderedConsoles.length} consoles to ${OUTPUT_PATH}`);
	for (const c of orderedConsoles) {
		console.log(`  ${c.short}: ${c.roms.length}`);
	}
}

generate();
