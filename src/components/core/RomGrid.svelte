<script lang="ts">
	import classNames from 'classnames';
	import RomCard from './RomCard.svelte';
	import type { ConsoleEntry } from '$types/rom.type';

	export let console: ConsoleEntry;
	export let maxCols: 3 | 4 | 5 | 6 = 6;

	const colClasses: Record<3 | 4 | 5 | 6, string> = {
		3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3',
		4: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4',
		5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5',
		6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
	};

	$: gridClasses = classNames('grid gap-3', colClasses[maxCols]);
</script>

<section id={console.id} aria-label={console.name}>
	<div class={gridClasses}>
		{#each console.roms as rom (rom.id)}
			<RomCard {rom} />
		{/each}
	</div>
</section>
