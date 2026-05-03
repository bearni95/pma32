<script lang="ts">
	import RomGrid from '$components/core/RomGrid.svelte';
	import romIndex from '$data/roms.json';
	import type { ConsoleEntry, RomIndex } from '$types/rom.type';
	import { normalizeForSearch } from '$utils/string/normalizeForSearch';

	const index = romIndex as RomIndex;

	let query = '';

	function isPokemon(file: string, title: string): boolean {
		return /pokemon|pokémon/i.test(title) || file.includes('/gba-pokemon/');
	}

	function battleNetworkNumber(title: string): number | null {
		const match = title.match(/megaman\s+battle\s+network\s+(\d+)/i);
		return match ? Number(match[1]) : null;
	}

	function sortGbaOther(roms: ConsoleEntry['roms']): ConsoleEntry['roms'] {
		const bn = roms
			.filter((r) => battleNetworkNumber(r.title) !== null)
			.sort((a, b) => battleNetworkNumber(a.title)! - battleNetworkNumber(b.title)!);
		const rest = roms
			.filter((r) => battleNetworkNumber(r.title) === null)
			.sort((a, b) => a.title.localeCompare(b.title));
		return [...bn, ...rest];
	}

	const sections: ConsoleEntry[] = index.consoles.flatMap((c) => {
		if (c.id !== 'gba') return [c];
		const pokemon = c.roms.filter((r) => isPokemon(r.file, r.title));
		const others = c.roms.filter((r) => !isPokemon(r.file, r.title));
		const split: ConsoleEntry[] = [];
		if (others.length) {
			split.push({ ...c, id: 'gba-other' as never, name: 'Game Boy Advance — Other', short: 'GBA Other', roms: sortGbaOther(others) });
		}
		if (pokemon.length) {
			split.push({ ...c, id: 'gba-pokemon' as never, name: 'Game Boy Advance — Pokémon', short: 'GBA Pokémon', roms: pokemon });
		}
		return split;
	});

	$: normalizedQuery = normalizeForSearch(query);
	$: filteredSections = normalizedQuery
		? sections
				.map((s) => ({
					...s,
					roms: s.roms.filter((r) => normalizeForSearch(r.title).includes(normalizedQuery))
				}))
				.filter((s) => s.roms.length > 0)
		: sections;

	function clearQuery() {
		query = '';
	}
</script>

<svelte:head>
	<title>Per molts any, per molts jocs!</title>
</svelte:head>

<main
	class="px-4 py-8 space-y-6 lg:max-w-[1200px] lg:mx-auto lg:my-8 lg:px-8 bg-base-100/30 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl"
>
	<header>
		<h1 class="text-4xl font-bold text-center">Per molts any, per molts jocs!</h1>
	</header>

	<div class="join w-full">
		<input
			type="search"
			bind:value={query}
			placeholder="Filter games…"
			class="input input-bordered join-item flex-1"
			aria-label="Filter games"
		/>
		<button
			type="button"
			class="btn btn-ghost join-item"
			on:click={clearQuery}
			disabled={!query}
			aria-label="Clear filter"
		>
			×
		</button>
	</div>

	{#if filteredSections.length === 0}
		<p class="opacity-70 italic">No games match "{query}".</p>
	{/if}

	<div class="space-y-10">
		{#each filteredSections as console (console.id)}
			<RomGrid {console} maxCols={console.id === 'gba-other' ? 4 : 3} />
		{/each}
	</div>
</main>
