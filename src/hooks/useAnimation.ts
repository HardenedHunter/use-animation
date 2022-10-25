import { useCallback, useEffect, useState, useRef } from "react";

import { Sprites } from "../utils";

type AnimationState = {
    index: number;
    timeoutId?: NodeJS.Timer;
};

type AnimationChangeHandler = (payload: {
    index: number;
    sprites: Sprites;
    timeoutId?: NodeJS.Timer;
}) => void;

const initialState: AnimationState = { index: 0 };

const iterateAnimation = (
    index: number,
    options: AnimationOptions,
    delay: number,
    onChange: AnimationChangeHandler
) => {
    const { next, repeat, sprites } = options;
    const animationLength = sprites.length;
    const newIndex = (index + 1) % animationLength;
    const isLastSprite = newIndex === animationLength - 1;

    if (isLastSprite) {
        if (next) {
            onChange({ index: newIndex, sprites });
            setTimeout(() => playAnimation(next, delay, onChange), delay);
            return;
        }

        if (!repeat) {
            return;
        }
    }

    const timeoutId = setTimeout(
        () => iterateAnimation(newIndex, options, delay, onChange),
        delay
    );

    onChange({ index: newIndex, timeoutId, sprites });
};

const playAnimation = (
    options: AnimationOptions,
    delay: number,
    onChange: AnimationChangeHandler,
    timeoutId?: NodeJS.Timer
) => {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }

    iterateAnimation(0, options, delay, onChange);
};

type AnimationOptions = {
    sprites: Sprites;
    repeat?: number;
    next?: AnimationOptions;
};

type AnimationConfig = {
    delay: number;
    onSpriteChange?: (sprite: string) => void;
    options: AnimationOptions;
};

const useAnimation = () => {
    const [state, setState] = useState<AnimationState>(initialState);
    const stateRef = useRef<AnimationState>(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const animate = useCallback(
        ({ delay, onSpriteChange, options }: AnimationConfig) => {
            playAnimation(
                options,
                delay,
                (payload) => {
                    setState(payload);
                    onSpriteChange?.(payload.sprites[payload.index] as string);
                },
                stateRef.current.timeoutId
            );
        },
        []
    );

    return animate;
};

export default useAnimation;
