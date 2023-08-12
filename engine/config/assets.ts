import type { SpriteSpec } from "./sprites";
import { SPRITE_SPECS } from "./sprites";

export const IMAGES = new Map<string, HTMLImageElement>();

export const loadSpritesIntoImageElements = (
  spriteSpecs: Partial<SpriteSpec>[],
): Promise<void>[] => {
  const spritePromises: Promise<void>[] = [];

  for (const spriteSpec of spriteSpecs) {
    if (spriteSpec.sheet) {
      const img = new Image();
      img.src = spriteSpec.sheet;
      IMAGES.set(spriteSpec.sheet, img);

      spritePromises.push(
        new Promise((resolve) => {
          img.onload = () => resolve();
        }),
      );
    }

    if (spriteSpec.states) {
      spritePromises.push(
        ...loadSpritesIntoImageElements(Array.from(spriteSpec.states.values())),
      );
    }
  }

  return spritePromises;
};

export const loadAssets = () =>
  Promise.all([
    ...loadSpritesIntoImageElements(
      Array.from(SPRITE_SPECS.keys()).map(
        (key) => SPRITE_SPECS.get(key) as SpriteSpec,
      ),
    ),
    // TODO: Sound
  ]);
