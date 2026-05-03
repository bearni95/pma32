export type ConsoleId = 'gba' | 'gbc' | 'gb' | 'snes';

export interface Rom {
	id: string;
	title: string;
	file: string;
	image: string | null;
	size: number;
	ext: string;
}

export interface ConsoleEntry {
	id: ConsoleId;
	name: string;
	short: string;
	roms: Rom[];
}

export interface RomIndex {
	generatedAt: string;
	totalRoms: number;
	consoles: ConsoleEntry[];
}
