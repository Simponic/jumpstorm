import { Component, ComponentNames } from '.';

export class NetworkUpdateable extends Component {
  static DEFAULT_UPDATE_JITTER_MS = 30;
  static DEFAULT_THRESHOLD_TIME_MS = 20;

  public updateThreshold: number;
  public jitter: number;

  constructor(
    updateThreshold = NetworkUpdateable.DEFAULT_THRESHOLD_TIME_MS,
    jitter = NetworkUpdateable.DEFAULT_UPDATE_JITTER_MS
  ) {
    super(ComponentNames.NetworkUpdateable);

    this.updateThreshold = updateThreshold;
    this.jitter = jitter;
  }

  public getNextUpdateTime() {
    return Math.random() * this.jitter + this.updateThreshold;
  }
}
