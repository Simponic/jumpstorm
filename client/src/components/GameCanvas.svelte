<script lang="ts">
  import { onMount } from "svelte";
  import { loadAssets } from "@engine/config";
  import { Game } from "@engine/Game";
  import { JumpStorm } from "../JumpStorm";

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  export let width: number;
  export let height: number;

  onMount(async () => {
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    await loadAssets();

    const game = new Game();
    const jumpStorm = new JumpStorm(game);

    await jumpStorm.init(ctx, "http", "ws", document.location.host + "/api");
    jumpStorm.play();
  });
</script>

<canvas bind:this={canvas} {width} {height} />
