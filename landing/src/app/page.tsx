"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const languages = ["English", "French", "Italian", "German", "Spanish"];

export default function RolyAILanding() {
  const containerRef = useRef(null);
  const phoneRef = useRef(null);
  const heroTextRef = useRef(null);
  const featureTextRef = useRef(null);
  const textSliderRef = useRef<HTMLSpanElement | null>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=200%",
          scrub: 1,
          pin: true,
        },
      });

      // ADIM 1: Hero Metinlerini Yok Et
      tl.to(heroTextRef.current, {
        opacity: 0,
        y: -50,
        duration: 2,
      })

        // ADIM 2: Telefonu "Features" Pozisyonuna Taşı
        .to(
          phoneRef.current,
          {
            scale: 0.7,
            xPercent: -100,
            yPercent: -110,
            rotation: 0,
            duration: 4,
            ease: "power1.inOut",
          },
          "<"
        )

        // ADIM 3: Feature Metinlerini Getir
        .from(
          featureTextRef.current,
          {
            opacity: 0,
            x: 100,
            duration: 3,
          },
          "-=2"
        );

      // Diller için sonsuz döngülü kaydırma
      const totalSlides = languages.length + 1; // ilk elemanın kopyası için +1
      const stepPercent = 100 / totalSlides;
      const tlText = gsap.timeline({ repeat: -1 });

      languages.forEach((_, index) => {
        tlText.to(textSliderRef.current, {
          yPercent: -stepPercent * (index + 1),
          duration: 0.5,
          ease: "power2.inOut",
          delay: 1.5,
        });
      });

      tlText.set(textSliderRef.current, { yPercent: 0 });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-white text-black"
    >
      {/* --- EKLENEN KISIM: Soft Yellow Glow Background --- */}
      {/* z-0 verdik ki diğer içeriklerin (z-10, z-20) arkasında kalsın */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, #AFFC88 0%, transparent 70%)
          `,
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />

      {/* 1. TELEFON */}
      <div
        ref={phoneRef}
        className="absolute top-[950px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
      >
        <Image
          src={"/rolyaihomescreen.png"}
          alt="rolyaihomescreen"
          width={400}
          height={600}
          className="rounded-[60px]"
        />
      </div>

      {/* 2. HERO METİNLERİ VE BUTON */}
      <div
        ref={heroTextRef}
        className="absolute top-52 w-full flex flex-col items-center z-10 px-4"
      >
        <h1 className="text-6xl font-bold mb-4 text-center flex flex-col justify-center items-center gap-5">
          <div className="space-x-4">
            <span>Speak your way to</span>
            <span className="relative h-[1.1em] w-[10ch] overflow-hidden inline-flex items-start text-green-600">
              <span ref={textSliderRef} className="flex flex-col text-left">
                {languages.map((lang, i) => (
                  <span key={i} className="h-[1.1em] flex items-center">
                    {lang}
                  </span>
                ))}
                <span className="h-[1.2em] flex items-center">
                  {languages[0]}
                </span>
              </span>
            </span>
          </div>
          <span className="text-start">fluency</span>
        </h1>
        <p className="text-l text-gray-500 max-w-lg text-center mb-8">
          Don&apos;t just memorize. Build confidence by speaking with RolyAI in
          real-life scenarios.
        </p>

        {/* Play Store Butonu */}
        <Link
          href={"#"}
          className="flex items-center rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          <Image
            src={"/googleplay.svg"}
            alt="googleplaystore"
            width={180}
            height={180}
          />
        </Link>
      </div>

      {/* 3. FEATURES METİNLERİ */}
      <div
        ref={featureTextRef}
        className="absolute top-1/2 right-[10%] -translate-y-1/2 w-1/3 z-10"
      >
        <div className="p-6 rounded-xl">
          <h3 className="text-3xl font-bold mb-3 text-gray-800">
            Real-life Scenarios
          </h3>
          <p className="text-gray-600">
            From ordering at a cafe to a job interview, role-play every
            situation with AI and see your mistakes instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
