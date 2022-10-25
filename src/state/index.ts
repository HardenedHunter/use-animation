import create from "zustand";

type CharacterModel = {
    sprite: string;
};

type BattleStore = {
    left: CharacterModel;
    right: CharacterModel;
};

const useBattleStore = create<BattleStore>(() => ({
    left: {
        sprite: "witch/witch1.svg",
    },
    right: {
        sprite: "witch/witch1.svg",
    },
}));

export default useBattleStore;
