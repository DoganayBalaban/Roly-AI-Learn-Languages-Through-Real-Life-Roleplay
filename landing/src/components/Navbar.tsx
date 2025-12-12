import Image from "next/image";
import Link from "next/link"; // Sayfalar arası geçiş için gerekli

// 1. Veri Yapısı (Array of Objects)
// Linkleri buraya ekleyip çıkarabilirsin, tasarım bozulmaz.
const navLinks = [
  { id: 1, title: "Özellikler", href: "#features" },
  { id: 2, title: "Nasıl Çalışır?", href: "#how-it-works" },
  { id: 3, title: "İletişim", href: "#contact" },
  { id: 4, title: "Gizlilik Sözleşmesi", href: "#privacy" },
];

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO ALANI */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="relative overflow-hidden rounded-xl">
            {/* Logo resmin public klasöründe olmalı */}
            <Image
              src="/logo.png"
              alt="Roly AI Logo"
              width={70}
              height={70}
              className="object-cover"
            />
          </div>
          <span className="font-bold text-2xl tracking-tight text-gray-900 group-hover:text-green-600 transition">
            Roly AI
          </span>
        </Link>

        {/* LINKLER (Masaüstü - Map Döngüsü) */}
        {/* 'hidden md:flex' diyerek mobilde gizleyip masaüstünde gösteriyoruz */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors duration-200"
            >
              {link.title}
            </Link>
          ))}
        </div>

        {/* CTA BUTONU (Sağ Taraf) */}
        <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-lg shadow-orange-100">
          Uygulamayı İndir
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
