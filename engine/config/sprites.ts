export enum Sprites {
  FLOOR,
  TRAMPOLINE,
  COFFEE,
}

export interface SpriteSpec {
  sheet: string;
  width: number;
  height: number;
  frames: number;
  msPerFrame: number;
  states?: Record<string | number, Partial<SpriteSpec>>;
}

export const SPRITE_SPECS: Map<Sprites, Partial<SpriteSpec>> = new Map<
  Sprites,
  SpriteSpec
>();

const floorSpriteSpec = {
  height: 40,
  frames: 3,
  msPerFrame: 125,
  states: {},
};
floorSpriteSpec.states = [40, 80, 120, 160].reduce((acc, cur) => {
  acc[cur] = {
    width: cur,
    sheet: `/assets/floor_tile_${cur}.png`,
  };
  return acc;
}, {});
SPRITE_SPECS.set(Sprites.FLOOR, floorSpriteSpec);

SPRITE_SPECS.set(Sprites.COFFEE, {
  msPerFrame: 100,
  width: 60,
  height: 45,
  frames: 3,
  states: {
    LEFT: {
      sheet: "/assets/coffee_left.png",
    },
    RIGHT: {
      sheet: "/assets/coffee_right.png",
    },
  },
});
