<script lang="ts">
  import { onMount } from "svelte";
  import { Game } from "../../lib/Game";
  import { Render } from "../../lib/systems";
  import { Floor } from "../../lib/entities";
  import { loadAssets } from "../../lib/config";
  import { JumpStorm } from "../../lib/JumpStorm";

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  export let width: number;
  export let height: number;

  let jumpStorm: JumpStorm;

  onMount(() => {
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    loadAssets().then(() => {
      jumpStorm = new JumpStorm(ctx);
      jumpStorm.play();
    });
  });
</script>

<canvas bind:this={canvas} {width} {height} />
