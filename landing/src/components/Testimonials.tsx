import { Quote } from "lucide-react";
import Image from "next/image";
import { reviews } from "../constants/REVIEWS";
// RolyAI için güncellenmiş müşteri yorumları

export default function Testimonials() {
  return (
    <section className="relative py-24 bg-white text-gray-900 overflow-hidden">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, #AFFC88 0%, transparent 70%)`,
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 ">
        {/* --- Header Kısmı --- */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
            Reviews that speak for <br className="hidden md:block" /> themselves
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            See how RolyAI transforms language learners into confident speakers.
            From mastering accents to acing real-life conversations, our users
            are reaching their fluency goals.
          </p>
        </div>

        {/* --- Kartlar Grid Yapısı --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="relative bg-gray-50 p-8 md:p-10 rounded-[2rem] hover:shadow-lg transition-shadow duration-300"
            >
              {/* Sol Üstteki Turuncu Çizgi Efekti */}
              <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-green-400 rounded-tl-[2rem] pointer-events-none" />

              {/* Tırnak İkonu */}
              <Quote className="w-10 h-10 text-gray-400/50 mb-4 rotate-180 fill-current" />

              {/* Yorum Metni */}
              <p className="text-gray-700 text-lg leading-relaxed font-medium italic mb-8">
                &quot;{review.text}&quot;
              </p>

              {/* Kullanıcı Bilgisi (Avatar + İsim) */}
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <Image
                    src={review.avatar}
                    alt={review.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">
                    {review.author}
                  </h4>
                  <p className="text-sm text-gray-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
