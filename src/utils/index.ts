import { Sprites } from "../hooks/useAnimation";

const buildSpriteArray = <T>(start: number, end: number): Sprites<T> => {
    const result = [];
    for (let i = start; i <= end; i++) {
        result.push(`witch/witch${i}.svg`);
    }

    return result as Sprites<T>;
};

export const animations = {
    idle: buildSpriteArray<string>(1, 6),
    run: buildSpriteArray<string>(7, 14),
    charge: buildSpriteArray<string>(15, 19),
    attack: buildSpriteArray<string>(20, 28),
    death: buildSpriteArray<string>(29, 43),
    resurrect: buildSpriteArray<string>(29, 43).reverse() as Sprites<string>,
};
