"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { joinWaitlist } from "@/lib/actions";
import { Clock, Loader2, Mail } from "lucide-react"; // Clock ikonu ekledik
import { useState } from "react";
// import { joinWaitlist } from "@/app/actions"; // Server action buraya

const WAITLIST_USERS = [
  { src: "https://github.com/shadcn.png", alt: "@shadcn", fallback: "CN" },
  { src: "https://github.com/leerob.png", alt: "@leerob", fallback: "LR" },
  {
    src: "https://github.com/evilrabbit.png",
    alt: "@evilrabbit",
    fallback: "ER",
  },
  { src: "https://i.pravatar.cc/150?u=4", alt: "@user4", fallback: "U4" },
];

export default function WaitlistSection() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  // Client Action (Server Action ile bağlantılı)
  const clientAction = async (formData: FormData) => {
    setStatus("loading");

    const result = await joinWaitlist(formData);

    if (result) {
      setStatus("success");
    }

    // Şimdilik simülasyon:
    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  return (
    <section className="relative py-24 text-black overflow-hidden">
      {/* Background Effect */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, #AFFC88 0%, transparent 70%)`,
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          Ready to speak fluently?
        </h2>
        <p className="text-xl md:text-2xl text-gray-500 font-light mb-10 max-w-2xl mx-auto">
          Join the closed beta to start practicing with RolyAI.
        </p>

        <div className="max-w-md mx-auto">
          {status === "success" ? (
            // --- BAŞVURU ALINDI EKRANI ---
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 flex flex-col items-center animate-in fade-in zoom-in duration-300 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Clock className="text-white w-6 h-6" /> {/* Bekleme ikonu */}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Request Received! 📩
              </h3>

              <p className="text-gray-600 text-base leading-relaxed">
                Since this is a <strong>Closed Beta</strong>, we need to
                manually add you to the Google Play allowlist.
              </p>

              <div className="mt-4 p-3 bg-white/50 rounded-lg border border-blue-200/50 text-sm text-blue-800 font-medium">
                ⏳ We will email your access link within 24 hours.
              </div>
            </div>
          ) : (
            // --- FORM KISMI ---
            <form action={clientAction} className="flex flex-col gap-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full bg-white/10 border border-gray-500 text-black placeholder:text-gray-400 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white/15 transition-all text-lg"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  "Request Beta Access"
                )}
              </button>

              <p className="text-xs text-gray-500 mt-2">
                *Limited spots available for the closed beta.
              </p>
            </form>
          )}
        </div>

        {/* Social Proof */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-80">
          <div className="flex -space-x-3">
            {WAITLIST_USERS.map((user, i) => (
              <Avatar key={i} className="border-2 border-gray-900 w-10 h-10">
                <AvatarImage src={user.src} alt={user.alt} />
                <AvatarFallback>{user.fallback}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-sm font-medium text-gray-500">
            Join <span className="text-black font-bold">+400 people</span>{" "}
            waiting
          </span>
        </div>
      </div>
    </section>
  );
}
