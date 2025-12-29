"use client";


import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef } from "react";

import FAQ from "@/components/FAQ";
import Testimonials from "@/components/Testimonials";
import WaitlistSection from "@/components/WaitlistSection";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Typewriter } from "react-simple-typewriter";

gsap.registerPlugin(ScrollTrigger);

const languages = ["English", "French", "Italian", "German", "Spanish"];

const FEATURES = [
  {
    id: 1,
    title: "Real-life Scenarios",
    description:
      "From ordering at a cafe to a job interview, role-play every situation with AI.",
    phoneState: { scale: 0.7, xPercent: -90, yPercent: -120, rotation: -10 },
    textAlign: "right",
    image: "/screen1.png",
  },
  {
    id: 2,
    title: "Instant Feedback",
    description:
      "Get detailed grammar and pronunciation corrections immediately.",
    phoneState: { scale: 0.7, xPercent: 10, yPercent: -120, rotation: 10 },
    textAlign: "left",
    image: "/screen2.png",
  },
  {
    id: 3,
    title: "Gamified Learning",
    description: "Earn XP, maintain streaks, and climb the leaderboard.",
    phoneState: { scale: 0.6, xPercent: -50, yPercent: -135, rotation: 0 },
    textAlign: "center",
    image: "/screen3.png",
  },
];

export default function RolyAILanding() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const heroTextRef = useRef<HTMLDivElement | null>(null);

  const featuresRef = useRef<(HTMLDivElement | null)[]>([]);
  const screensRef = useRef<(HTMLDivElement | null)[]>([]);

  const setFeatureRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      featuresRef.current[index] = el;
    },
    []
  );

  const setScreenRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      screensRef.current[index] = el;
    },
    []
  );

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${FEATURES.length * 150}%`,
          scrub: 1,
          pin: true,
        },
      });

      screensRef.current.forEach((screen, i) => {
        if (!screen) return;
        gsap.set(screen, {
          xPercent: i === 0 ? 0 : 100,
          opacity: i === 0 ? 1 : 0,
        });
      });

      tl.to(heroTextRef.current, {
        opacity: 0,
        y: -50,
        duration: 1,
      });

      FEATURES.forEach((feature, index) => {
        const textEl = featuresRef.current[index];
        const currentScreen = screensRef.current[index];
        const prevScreen = screensRef.current[index - 1];

        if (!textEl || !currentScreen) return;

        const enterX =
          feature.textAlign === "left"
            ? -50
            : feature.textAlign === "right"
            ? 50
            : 0;

        tl.to(
          phoneRef.current,
          {
            ...feature.phoneState,
            duration: 4,
            ease: "power2.inOut",
          },
          `step-${index}`
        ).fromTo(
          textEl,
          { opacity: 0, x: enterX },
          { opacity: 1, x: 0, duration: 3 },
          `step-${index}`
        );

        if (index > 0 && prevScreen) {
          tl.to(
            prevScreen,
            { xPercent: -100, opacity: 0, duration: 4 },
            `step-${index}`
          );
          tl.to(
            currentScreen,
            { xPercent: 0, opacity: 1, duration: 4 },
            `step-${index}`
          );
        }

        if (index !== FEATURES.length - 1) {
          tl.to(textEl, { opacity: 0, y: -50, duration: 2 }, "+=1");
        }
      });
    },
    { scope: containerRef }
  );

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden bg-white text-black"
      >

        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, #AFFC88 0%, transparent 70%)",
            opacity: 0.6,
          }}
        />

        {/* PHONE */}
        <div
          ref={phoneRef}
          className="absolute top-[950px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20
                     w-[350px] h-[700px] bg-black rounded-[55px] shadow-2xl overflow-hidden"
        >
          <div className="relative w-full h-full bg-gray-900 rounded-[40px] overflow-hidden">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full z-50" />

            {FEATURES.map((feature, i) => (
              <div key={i} ref={setScreenRef(i)} className="absolute inset-0">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* HERO */}
        <div
          ref={heroTextRef}
          className="absolute top-36 sm:top-52 w-full flex flex-col items-center z-10 px-4"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-center">
            <div className="flex flex-col space-y-2">
              <span>Speak your way to</span>
              <span className="text-green-600">
                {" "}
                <Typewriter
                  words={languages}
                  loop
                  cursor
                  cursorStyle="|"
                  typeSpeed={80}
                  deleteSpeed={50}
                  delaySpeed={1200}
                />
              </span>{" "}
              <span>fluency</span>
            </div>
          </h1>

          <p className="text-gray-500 max-w-lg text-center mb-8">
            Don&apos;t just memorize. Build confidence by speaking with RolyAI
            in real-life scenarios.
          </p>

          <Link href="#beta">
            <Image
              src="/googleplay.svg"
              alt="Google Play"
              width={180}
              height={180}
            />
          </Link>
        </div>

        {/* FEATURES TEXT */}
        {FEATURES.map((feature, index) => (
          <div
            key={feature.id}
            ref={setFeatureRef(index)}
            className={`absolute top-1/2 -translate-y-1/2 w-1/3 opacity-0 z-10
              ${
                feature.textAlign === "right"
                  ? "right-[10%]"
                  : feature.textAlign === "left"
                  ? "left-[10%]"
                  : "left-1/2 -translate-x-1/2 top-[80%] w-full text-center"
              }`}
          >
            <h3 className="text-3xl font-bold mb-3">{feature.title}</h3>
            <p className="text-gray-600 text-lg">{feature.description}</p>
          </div>
        ))}
      </div>

      <WaitlistSection />
      <FAQ />
      <Testimonials />
    </>
  );
}
