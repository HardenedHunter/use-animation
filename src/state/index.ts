import create from "zustand";

const buildSpriteArray = (start: number, end: number) => {
    const result = [];
    for (let i = start; i <= end; i++) {
        result.push(`witch/witch${i}.svg`);
    }

    return result;
};

const animations = {
    idle: buildSpriteArray(1, 6),
    run: buildSpriteArray(7, 14),
    charge: buildSpriteArray(15, 19),
    attack: buildSpriteArray(20, 28),
    death: buildSpriteArray(29, 43),
    resurrect: buildSpriteArray(29, 43).reverse(),
};

type AnimationConfig = {
    repeat?: boolean;
    next?: AnimationConfig;
    sprites: string[];
};

type CharacterModel = {
    sprite: string;
    playAnimation: (config: AnimationConfig) => void;
    animation?: {
        nextIndex: number;
        timeoutId?: NodeJS.Timer;
    };
};

type BattleStore = {
    left: CharacterModel;
    right: CharacterModel;
    start: VoidFunction;
};

const iterateAnimation = (
    getCharacter: () => CharacterModel,
    setCharacter: (character: CharacterModel) => void,
    config: AnimationConfig
) => {
    const latestCharacterData = getCharacter();
    const { animation: latestAnimation } = latestCharacterData;
    const { sprites, repeat, next } = config;

    if (!latestAnimation) {
        return;
    }

    const sprite = sprites[latestAnimation.nextIndex] as string;
    const nextIndex = (latestAnimation.nextIndex + 1) % sprites.length;

    const newCharacterData = {
        ...latestCharacterData,
        sprite,
        animation: { nextIndex },
    };

    setCharacter(newCharacterData);

    const isLastSprite = latestAnimation.nextIndex === sprites.length - 1;

    if (isLastSprite) {
        if (next) {
            setTimeout(
                () => playAnimationInner(getCharacter, setCharacter, next),
                100
            );

            return;
        }

        if (!repeat) {
            return;
        }
    }

    const timeoutId = setTimeout(
        () => iterateAnimation(getCharacter, setCharacter, config),
        100
    );

    setCharacter({
        ...newCharacterData,
        animation: { nextIndex, timeoutId },
    });
};

const playAnimationInner = (
    getCharacter: () => CharacterModel,
    setCharacter: (character: CharacterModel) => void,
    config: AnimationConfig
) => {
    const character = getCharacter();
    const { animation } = character;

    if (animation && animation.timeoutId) {
        clearTimeout(animation.timeoutId);
    }

    setCharacter({
        ...character,
        animation: { nextIndex: 0 },
    });

    iterateAnimation(getCharacter, setCharacter, config);
};

const useBattleStore = create<BattleStore>((set, get) => ({
    left: {
        sprite: "witch/witch1.svg",
        playAnimation: (config) =>
            playAnimationInner(
                () => get().left,
                (character) => set({ left: character }),
                config
            ),
    },
    right: {
        sprite: "witch/witch1.svg",
        playAnimation: (config) =>
            playAnimationInner(
                () => get().right,
                (character) => set({ right: character }),
                config
            ),
    },
    start: () => {
        const { left, right } = get();

        left.playAnimation({
            sprites: animations.attack,
            next: { sprites: animations.idle, repeat: true },
        });

        const death: AnimationConfig = {
            sprites: animations.death,
        };

        const resurrect: AnimationConfig = {
            sprites: animations.resurrect,
            next: death,
        };

        death.next = resurrect;

        right.playAnimation(death);
    },
}));

export default useBattleStore;
