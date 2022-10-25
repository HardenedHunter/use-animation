export type Sprites = [string, ...string[]];

const buildSpriteArray = (start: number, end: number): Sprites => {
    const result = [];
    for (let i = start; i <= end; i++) {
        result.push(`witch/witch${i}.svg`);
    }

    return result as Sprites;
};

export const animations = {
    idle: buildSpriteArray(1, 6),
    run: buildSpriteArray(7, 14),
    charge: buildSpriteArray(15, 19),
    attack: buildSpriteArray(20, 28),
    death: buildSpriteArray(29, 43),
    resurrect: buildSpriteArray(29, 43).reverse() as Sprites,
};
