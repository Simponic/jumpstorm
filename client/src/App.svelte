<script>
  import { Router, Link, Route } from "svelte-routing";
  import Home from "./routes/Home.svelte";

  export let url = "/";
</script>

<Router {url}>
  <div class="main">
    <div class="header">
      <div class="nav">
        <h1>jumpstorm</h1>
      </div>
    </div>
    <div class="content">
      <Route path="/"><Home /></Route>
    </div>
    <div class="footer">
      <span>
        built by
        <a href="https://github.com/simponic" target="_blank" class="tf">
          simponic
        </a>
      </span>
      <span>
        | inspired by
        <a href="https://www.youtube.com/watch?v=6qBcG31eiJY">carykh</a>
      </span>
    </div>
  </div>
</Router>
