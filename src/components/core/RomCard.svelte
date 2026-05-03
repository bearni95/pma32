<script lang="ts">
	import classNames from 'classnames';
	import { base } from '$app/paths';
	import type { Rom } from '$types/rom.type';

	export let rom: Rom;
	export let classes: string = '';

	$: href = base + encodeURI(rom.file);
	$: imageHref = rom.image ? base + encodeURI(rom.image) : null;

	$: cardClasses = classNames(
		'block hover:scale-105 transition-transform',
		classes
	);
</script>

<a {href} download class={cardClasses} title={rom.title} aria-label={rom.title}>
	<div class="overflow-hidden">
		{#if imageHref}
			<img
				src={imageHref}
				alt={rom.title}
				loading="lazy"
				class="block w-full h-auto"
			/>
		{:else}
			<div class="flex items-center justify-center py-6">
				<span class="badge badge-neutral badge-lg uppercase">{rom.ext}</span>
			</div>
		{/if}
	</div>
</a>
