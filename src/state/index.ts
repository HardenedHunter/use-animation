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
    index: number;
    intervalId: NodeJS.Timer;
  };
};

type BattleStore = {
  left: CharacterModel;
  right: CharacterModel;
  animate: VoidFunction;
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

  const isLastSprite = latestAnimation.index === sprites.length - 1;

  if (isLastSprite) {
    if (next) {
      playAnimationInner(getCharacter, setCharacter, next);
      return;
    }

    if (!repeat) {
      clearInterval(latestAnimation.intervalId);
      return;
    }
  }

  const index = (latestAnimation.index + 1) % sprites.length;
  const sprite = sprites[index] as string;
  console.log(sprite);

  setCharacter({
    ...latestCharacterData,
    sprite,
    animation: { ...latestAnimation, index },
  });
};

const playAnimationInner = (
  getCharacter: () => CharacterModel,
  setCharacter: (character: CharacterModel) => void,
  config: AnimationConfig
) => {
  const character = getCharacter();
  const { animation } = character;

  if (animation) {
    clearInterval(animation.intervalId);
  }

  const newIntervalId = setInterval(
    () => iterateAnimation(getCharacter, setCharacter, config),
    100
  );

  setCharacter({
    ...character,
    animation: { ...animation, intervalId: newIntervalId, index: -1 },
  });
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
  animate: () => {
    const { left, right } = get();

    left.playAnimation({
      sprites: animations.attack,
      next: { sprites: animations.idle },
    });

    // right.playAnimation({ sprites: animations.death });
  },
}));

export default useBattleStore;
