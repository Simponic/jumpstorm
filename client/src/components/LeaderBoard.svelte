<script lang="ts">
  import LeaderBoardCard from "./LeaderBoardCard.svelte";

  const MAX_ENTRIES = 8;

  export let entries: { name: string, score: number }[] = [];
</script>

<div class="leaderboard">
  {#each entries
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES) as entry}
    <LeaderBoardCard {entry} />
  {/each}
</div>

<style>
  .leaderboard {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 10px;
  }
</style>
