<script lang="ts">
  import GameCanvas from "../components/GameCanvas.svelte";
  import LeaderBoard from "../components/LeaderBoard.svelte";

  let width: number = 600;
  let height: number = 800;
</script>

<div class="centered-game">
  <GameCanvas {width} {height} />
  <LeaderBoard />
</div>
