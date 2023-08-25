export enum Sprites {
  FLOOR,
  TRAMPOLINE,
  COFFEE
}

export interface SpriteSpec {
  sheet: string;
  width: number;
  height: number;
  frames: number;
  msPerFrame: number;
  states?: Map<string | number, Partial<SpriteSpec>>;
}

export const SPRITE_SPECS: Map<Sprites, Partial<SpriteSpec>> = new Map<
  Sprites,
  SpriteSpec
>();

const floorSpriteSpec = {
  height: 40,
  frames: 3,
  msPerFrame: 125,
  states: new Map<number, Partial<SpriteSpec>>()
};
[40, 80, 120, 160].forEach((width) => {
  floorSpriteSpec.states.set(width, {
    width,
    sheet: `/assets/floor_tile_${width}.png`
  });
});
SPRITE_SPECS.set(Sprites.FLOOR, floorSpriteSpec);

const coffeeSpriteSpec = {
  msPerFrame: 100,
  width: 60,
  height: 45,
  frames: 3,
  states: new Map<string, Partial<SpriteSpec>>()
};
coffeeSpriteSpec.states.set('LEFT', {
  sheet: '/assets/coffee_left.png'
});
coffeeSpriteSpec.states.set('RIGHT', {
  sheet: '/assets/coffee_right.png'
});
SPRITE_SPECS.set(Sprites.COFFEE, coffeeSpriteSpec);
