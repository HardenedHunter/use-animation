import { FC, useState } from "react";
import type { NextPage } from "next";
import Image from "next/future/image";
import Head from "next/head";

import useAnimation, {
    AnimationConfig,
    AnimationFunction,
} from "../hooks/useAnimation";

import { animations } from "../utils";

type InnerProps = {
    animate: AnimationFunction<string>;
    resume: VoidFunction;
    pause: VoidFunction;
};

const DELAY = 100;

const Inner: FC<InnerProps> = ({ animate, pause, resume }) => {
    const [sprite, setSprite] = useState("witch/witch1.svg");

    const startAnimation = (config: AnimationConfig<string>) => {
        animate({
            delay: DELAY,
            onSpriteChange: setSprite,
            config,
        });
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-green-200">
            <div className="grid w-full max-w-2xl grid-cols-battle">
                <div className="relative aspect-square">
                    <Image
                        src={`/images/${sprite}`}
                        fill
                        alt="Character"
                        sizes="50vh"
                    />
                </div>
                <div></div>
                <div className="relative aspect-square -scale-x-100">
                    <Image
                        src={`/images/${sprite}`}
                        fill
                        alt="Character"
                        sizes="50vh"
                    />
                </div>
            </div>
            <div className="mt-5 flex gap-x-4">
                <button
                    className="rounded-md bg-blue-400 px-5 py-3 font-bold text-white"
                    onClick={() =>
                        startAnimation({ sprites: animations.idle, repeat: -1 })
                    }
                >
                    Idle ∞
                </button>
                <button
                    className="rounded-md bg-blue-400 px-5 py-3 font-bold text-white"
                    onClick={() =>
                        startAnimation({ sprites: animations.run, repeat: -1 })
                    }
                >
                    Run ∞
                </button>
                <button
                    className="rounded-md bg-blue-400 px-5 py-3 font-bold text-white"
                    onClick={() =>
                        startAnimation({
                            sprites: animations.charge,
                            repeat: -1,
                        })
                    }
                >
                    Charge ∞
                </button>
                <button
                    className="rounded-md bg-blue-400 px-5 py-3 font-bold text-white"
                    onClick={() =>
                        startAnimation({ sprites: animations.death, repeat: 1 })
                    }
                >
                    Death
                </button>
                <button
                    className="rounded-md bg-blue-400 px-5 py-3 font-bold text-white"
                    onClick={() =>
                        startAnimation({
                            sprites: animations.resurrect,
                            repeat: 1,
                        })
                    }
                >
                    Resurrect
                </button>
                <button
                    className="rounded-md bg-red-400 px-5 py-3 font-bold text-white"
                    onClick={pause}
                >
                    Stop
                </button>
                <button
                    className="rounded-md bg-yellow-500 px-5 py-3 font-bold text-white"
                    onClick={resume}
                >
                    Resume
                </button>
            </div>
        </main>
    );
};

const Home: NextPage = () => {
    const { animate, pause, resume } = useAnimation<string>();

    return (
        <>
            <Head>
                <title>Create T3 App</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Inner animate={animate} pause={pause} resume={resume} />
        </>
    );
};

export default Home;
