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

    const { protocol, host } = document.location;
    const isHttps = protocol.startsWith('https');
    jumpStorm.init(ctx, isHttps ? 'https' : 'http', isHttps ? 'wss' : 'ws', `${host}/api`)
        .then(() => jumpStorm.play());
  });
</script>

<canvas bind:this={canvas} {width} {height} />
