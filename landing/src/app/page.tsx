"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function RolyAILanding() {
  const containerRef = useRef(null);
  const phoneRef = useRef(null);
  const heroTextRef = useRef(null);
  const featureTextRef = useRef(null);

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
            yPercent: -100,
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
            radial-gradient(circle at center, #FFF991 0%, transparent 70%)
          `,
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />

      {/* 1. TELEFON */}
      <div
        ref={phoneRef}
        className="absolute top-[880px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
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
        <h1 className="text-6xl font-bold mb-4 text-center">
          <span className="text-green-600">Konuşarak</span> İngilizce Öğren
        </h1>
        <p className="text-l text-gray-500 max-w-lg text-center mb-8">
          Sadece ezber yapma. RolyAI ile gerçek senaryolarda konuşarak özgüven
          kazan.
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
        <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 shadow-sm">
          <h3 className="text-3xl font-bold mb-3 text-gray-800">
            Gerçek Hayat Senaryoları
          </h3>
          <p className="text-gray-600">
            Kafede sipariş vermekten iş görüşmesine kadar, her duruma yapay zeka
            ile rol yaparak (roleplay) hazırlan. Hatalarını anında gör.
          </p>
          <button className="mt-4 text-orange-600 font-semibold border-b-2 border-orange-600 hover:text-orange-800 transition-colors">
            Ücretsiz Başla &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
