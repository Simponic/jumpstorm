<script lang="ts">
  import { type LeaderBoardEntry } from "@engine/interfaces";

  export let entry: LeaderBoardEntry = {
    name: "simponic",
    score: 100,
  };
</script>

<div class="entry">
  <span class="name">{entry.name}</span>
  <span class="score">{entry.score}</span>
</div>

<style>
  .entry {
    display: flex;
    justify-content: space-between;
  }
</style>
