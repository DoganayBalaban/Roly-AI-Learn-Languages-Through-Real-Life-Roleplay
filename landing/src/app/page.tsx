"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
          start: "top top", // Container tepesi ekran tepesine değdiğinde
          end: "+=200%", // 2 ekran boyu kadar scroll süresi ver (yavaş ve akıcı olsun)
          scrub: 1, // Scroll ile senkronize (1sn yumuşatma ile)
          pin: true, // Tüm sahneyi olduğu yere çivile, içerik değişsin
        },
      });

      // ADIM 1: Hero Metinlerini Yok Et
      tl.to(heroTextRef.current, {
        opacity: 0,
        y: -50,
        duration: 2,
      })

        // ADIM 2: Telefonu "Features" Pozisyonuna Taşı
        // (Ortadan, Aşağı-Sola doğru kaydırıyoruz)
        .to(
          phoneRef.current,
          {
            scale: 0.85, // Biraz küçülsün ki yanına metin sığsın
            xPercent: -100, // Sola kaydır (Yüzde olarak)
            yPercent: -75, // Biraz aşağı kaydır
            rotation: 0, // Hafif tatlı bir eğim ver
            duration: 4, // Bu hareket uzun sürsün
            ease: "power1.inOut",
          },
          "<"
        ) // "<" işareti: Bir önceki animasyonla AYNI ANDA başla demek

        // ADIM 3: Feature Metinlerini Getir
        .from(
          featureTextRef.current,
          {
            opacity: 0,
            x: 100, // Sağdan gelsin
            duration: 3,
          },
          "-=2"
        ); // Telefon yerine oturmadan 2sn önce gelmeye başlasın
    },
    { scope: containerRef }
  );

  return (
    // Ana Wrapper: 100vh değil, içerik sığacak kadar. Pin ile sabitlenecek.
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-white text-black"
    >
      {/* 1. TELEFON (Merkezdeki Yıldız) */}
      <div
        ref={phoneRef}
        className="absolute top-[600px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[600px] bg-black rounded-[40px] z-20 border-8 border-gray-800 shadow-2xl flex items-center justify-center text-white text-2xl"
      >
        {/* Buraya Uygulama Ekran Görüntüsü Gelecek */}
        RolyAI App Ekranı
      </div>

      {/* 2. HERO METİNLERİ */}
      <div
        ref={heroTextRef}
        className="absolute top-32 w-full text-center z-10 px-4"
      >
        <h1 className="text-6xl font-bold mb-4 text-green-600">Pratik yap</h1>
        <p className="text-xl text-gray-500 max-w-lg mx-auto">
          RolyAI ile ezberleme, öğren.
        </p>
      </div>

      {/* 3. FEATURES METİNLERİ (Scroll Yapınca Gelecek) */}
      {/* Telefon sola kayacağı için, bunu sağ tarafa konumlandırıyoruz */}
      <div
        ref={featureTextRef}
        className="absolute top-1/2 right-[10%] -translate-y-1/2 w-1/3 z-10"
      >
        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
          <h3 className="text-3xl font-bold mb-3 text-gray-800">
            Akıllı Öneri
          </h3>
          <p className="text-gray-600">
            RolyAI sohbeti analiz eder ve yanlışlarını bulur.
          </p>
          <button className="mt-4 text-green-600 font-semibold border-b-2 border-green-600">
            Daha Fazla Bilgi &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
