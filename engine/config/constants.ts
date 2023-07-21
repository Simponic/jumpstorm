import { Action } from "../interfaces";

export namespace KeyConstants {
  export const KeyActions: Record<string, Action> = {
    a: Action.MOVE_LEFT,
    ArrowLeft: Action.MOVE_LEFT,
    d: Action.MOVE_RIGHT,
    ArrowRight: Action.MOVE_RIGHT,
    w: Action.JUMP,
    ArrowUp: Action.JUMP,
  };

  export const ActionKeys: Map<Action, string[]> = Object.keys(
    KeyActions
  ).reduce((acc: Map<Action, string[]>, key) => {
    const action = KeyActions[key];

    if (acc.has(action)) {
      acc.get(action).push(key);
      return acc;
    }

    acc.set(action, [key]);
    return acc;
  }, new Map<Action, string[]>());
}

export namespace PhysicsConstants {
  export const MAX_JUMP_TIME_MS = 150;
  export const GRAVITY = 0.0075;
  export const PLAYER_MOVE_VEL = 1;
  export const PLAYER_JUMP_ACC = -0.01;
  export const PLAYER_JUMP_INITIAL_VEL = -0.9;
}