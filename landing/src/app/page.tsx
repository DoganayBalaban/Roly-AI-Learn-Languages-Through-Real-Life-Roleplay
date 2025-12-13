"use client";
import FAQ from "@/components/FAQ";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const languages = ["English", "French", "Italian", "German", "Spanish"];

// --- 1. DATA GÜNCELLEMESİ: Her özelliğe bir 'image' yolu ekledik ---
const FEATURES = [
  {
    id: 1,
    title: "Real-life Scenarios",
    description:
      "From ordering at a cafe to a job interview, role-play every situation with AI.",
    // Telefonun konumu
    phoneState: {
      scale: 0.7,
      xPercent: -90, // Sola git
      yPercent: -120, // biraz daha yukarı
      rotation: -10,
    },
    textAlign: "right",
    // BU ÖZELLİĞİN EKRAN GÖRÜNTÜSÜ
    image: "/screen1.png",
  },
  {
    id: 2,
    title: "Instant Feedback",
    description:
      "Get detailed grammar and pronunciation corrections immediately.",
    phoneState: {
      scale: 0.7,
      xPercent: 10, // Sağa git
      yPercent: -120, // biraz daha yukarı
      rotation: 10,
    },
    textAlign: "left",
    image: "/screen2.png", // Farklı resim
  },
  {
    id: 3,
    title: "Gamified Learning",
    description: "Earn XP, maintain streaks, and climb the leaderboard.",
    phoneState: {
      scale: 0.6,
      xPercent: -50, // Ortaya gel
      yPercent: -135, // biraz daha yukarı
      rotation: 0,
    },
    textAlign: "center",
    image: "/screen3.png", // Farklı resim
  },
];

export default function RolyAILanding() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const heroTextRef = useRef<HTMLDivElement | null>(null);
  const textSliderRef = useRef<HTMLSpanElement | null>(null);

  // Dizi Refleri
  const featuresRef = useRef<(HTMLDivElement | null)[]>([]);
  const screensRef = useRef<(HTMLDivElement | null)[]>([]); // Ekran görüntüleri için Ref Dizisi

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=" + FEATURES.length * 150 + "%", // Biraz daha uzun süre
          scrub: 1,
          pin: true,
        },
      });

      // --- BAŞLANGIÇ AYARLARI (Set Initial States) ---
      // İlk resim hariç diğerlerini sağa ötele (ekran dışına) ve gizle
      screensRef.current.forEach((screen, i) => {
        if (i !== 0) {
          gsap.set(screen, { xPercent: 100, opacity: 0 });
        }
      });

      // Hero Metnini Yok Et
      tl.to(heroTextRef.current, { opacity: 0, y: -50, duration: 1 });

      // --- DÖNGÜ (ANIMATION LOOP) ---
      FEATURES.forEach((feature, index) => {
        const textElement = featuresRef.current[index];
        const currentScreen = screensRef.current[index];
        const prevScreen = screensRef.current[index - 1]; // Bir önceki ekran
        if (!textElement || !currentScreen) {
          return;
        }

        // A) TELEFON HAREKETİ VE METİN GELİŞİ (Eski kodun aynısı)
        tl.to(
          phoneRef.current,
          {
            ...feature.phoneState,
            duration: 4,
            ease: "power2.inOut",
          },
          "step-" + index
        ).fromTo(
          textElement,
          { opacity: 0, x: feature.textAlign === "left" ? -50 : 50 },
          { opacity: 1, x: 0, duration: 3, ease: "power2.out" },
          "step-" + index
        );

        // B) EKRAN DEĞİŞİMİ (SLIDER MANTIĞI)
        if (index > 0 && prevScreen) {
          // 1. Önceki ekranı sola kaydır ve yok et
          tl.to(
            prevScreen,
            {
              xPercent: -100, // Sola kayıp gitsin
              opacity: 0,
              duration: 4,
              ease: "power2.inOut",
            },
            "step-" + index
          );

          // 2. Yeni ekranı sağdan içeri sok
          tl.to(
            currentScreen,
            {
              xPercent: 0, // Merkez konuma gel
              opacity: 1,
              duration: 4,
              ease: "power2.inOut",
            },
            "step-" + index
          ); // "<" yerine label kullandık, tam senkronize olsun diye
        }

        // C) Metni yok et (Son eleman değilse)
        if (index !== FEATURES.length - 1) {
          tl.to(textElement, { opacity: 0, y: -50, duration: 2 }, "+=1");
        }
      });

      // --- Language Slider (Bağımsız) ---
      const stepPercent = 100 / (languages.length + 1);
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
    <>
      <div
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden bg-white text-black"
      >
        {/* Background Glow */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, #AFFC88 0%, transparent 70%)`,
            opacity: 0.6,
            mixBlendMode: "multiply",
          }}
        />

        {/* --- TELEFON (SABİT ÇERÇEVE) --- */}
        <div
          ref={phoneRef}
          className="absolute top-[950px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[350px] h-[700px] bg-black rounded-[55px] border-[12px] border-black shadow-2xl overflow-hidden"
        >
          {/* EKRAN İÇERİĞİ (MASKELENMİŞ ALAN) */}
          <div className="relative w-full h-full bg-gray-900 rounded-[40px] overflow-hidden">
            {/* ÇENTİK (Dynamic Island) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full z-50"></div>

            {/* --- RESİMLERİN HEPSİNİ BURAYA BASIYORUZ --- */}
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                ref={(el) => {
                  screensRef.current[i] = el;
                }} // Ref ataması
                className="absolute inset-0 w-full h-full" // Hepsi üst üste
              >
                <Image
                  src={feature.image} // Config'den gelen resim yolu
                  alt={feature.title}
                  fill // Container'ı doldur
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* HERO SECTION */}
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
            Don&apos;t just memorize. Build confidence by speaking with RolyAI
            in real-life scenarios.
          </p>
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

        {/* FEATURES TEXT LOOP */}
        {FEATURES.map((feature, index) => (
          <div
            key={feature.id}
            ref={(el) => {
              featuresRef.current[index] = el;
            }}
            className={`absolute top-1/2 -translate-y-1/2 w-1/3 z-10 opacity-0 ${
              feature.textAlign === "right"
                ? "right-[10%] text-left"
                : feature.textAlign === "left"
                ? "left-[10%] text-left"
                : "left-1/2 -translate-x-1/2 top-[80%] text-center w-full px-4"
            }`}
          >
            <div className="p-6 rounded-xl">
              <h3 className="text-3xl font-bold mb-3 text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-lg">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
      <FAQ />
    </>
  );
}
