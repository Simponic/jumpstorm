<script lang="ts">
  import GameCanvas from "../components/GameCanvas.svelte";
  import LeaderBoard from "../components/LeaderBoard.svelte";

  import { Miscellaneous } from "@engine/config";

  let width: number = Miscellaneous.WIDTH;
  let height: number = Miscellaneous.HEIGHT;
</script>

<div class="centered-game">
  <GameCanvas {width} {height} />
  <LeaderBoard />
</div>
