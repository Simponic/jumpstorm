import { Component, ComponentNames } from ".";

export class NetworkUpdateable extends Component {
  public isPublish: boolean;
  public isSubscribe: boolean;

  constructor(isPublish: boolean, isSubscribe: boolean) {
    super(ComponentNames.NetworkUpdateable);

    this.isPublish = isPublish;
    this.isSubscribe = isSubscribe;
  }
}
