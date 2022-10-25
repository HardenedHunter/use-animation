import { useCallback, useEffect, useState, useRef } from "react";

import { Sprites } from "../utils";

type AnimationConfig = {
    sprites: Sprites;
    /**
     * Animation repeat count. Should be a positive integer or -1 (infinite repeat), default value is 1
     */
    repeat?: number;
    next?: AnimationConfig;
};

type AnimationIterationConfig = AnimationConfig & {
    repeat: number;
};

type AnimationParams = {
    delay: number;
    onSpriteChange?: (sprite: string) => void;
    config: AnimationConfig;
};

type AnimationChangeHandler = (payload: {
    index: number;
    sprites: Sprites;
    timeoutId?: NodeJS.Timer;
}) => void;

type AnimationState = {
    index: number;
    timeoutId?: NodeJS.Timer;
};

const initialState: AnimationState = { index: 0 };

const iterateAnimation = (
    index: number,
    config: AnimationIterationConfig,
    delay: number,
    onChange: AnimationChangeHandler
) => {
    let { repeat } = config;
    const { next, sprites } = config;
    const animationLength = sprites.length;
    const newIndex = (index + 1) % animationLength;
    const isLastSprite = newIndex === animationLength - 1;

    if (!isLastSprite || repeat === -1) {
        const timeoutId = setTimeout(
            () => iterateAnimation(newIndex, config, delay, onChange),
            delay
        );

        onChange({ index, timeoutId, sprites });
        return;
    }

    if (repeat > 1) {
        repeat -= 1;

        const timeoutId = setTimeout(
            () =>
                iterateAnimation(
                    newIndex,
                    { ...config, repeat },
                    delay,
                    onChange
                ),
            delay
        );

        onChange({ index, timeoutId, sprites });
        return;
    }

    if (next) {
        onChange({ index, sprites });
        setTimeout(() => playAnimation(next, delay, onChange), delay);
        return;
    }
};

const playAnimation = (
    config: AnimationConfig,
    delay: number,
    onChange: AnimationChangeHandler,
    timeoutId?: NodeJS.Timer
) => {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }

    const { repeat } = config;

    const animationConfig =
        repeat === undefined
            ? { ...config, repeat: 1 }
            : (config as AnimationIterationConfig);

    iterateAnimation(0, animationConfig, delay, onChange);
};

const useAnimation = () => {
    const [state, setState] = useState<AnimationState>(initialState);
    const stateRef = useRef<AnimationState>(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const animate = useCallback((params: AnimationParams) => {
        const { delay, onSpriteChange, config } = params;

        playAnimation(
            config,
            delay,
            (payload) => {
                console.log(payload.index);
                setState(payload);
                onSpriteChange?.(payload.sprites[payload.index] as string);
            },
            stateRef.current.timeoutId
        );
    }, []);

    return animate;
};

export default useAnimation;
