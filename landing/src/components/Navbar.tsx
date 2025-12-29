import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { id: 1, title: "Features", href: "#features" },
  { id: 2, title: "FAQ", href: "#faq" },
  { id: 3, title: "Reviews", href: "#reviews" },
];

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg transition-all h-20">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at center, #AFFC88 0%, rgba(255,255,255,0.8) 70%)
          `,
          opacity: 0.5,
          mixBlendMode: "multiply",
        }}
      />

      {/* Hafif Beyaz Katman (Yazıların okunabilirliğini artırmak için) */}
      <div className="absolute inset-0 bg-white/40 z-0" />

      {/* --- İÇERİK KISMI --- */}
      {/* relative ve z-10 vererek glow efektinin üstüne çıkardık */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* LOGO ALANI */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="relative overflow-hidden rounded-xl">
            <Image
              src="/logo.png"
              alt="Roly AI Logo"
              width={70}
              height={70}
              className="object-cover"
            />
          </div>
          <span className="font-bold hidden lg:block text-2xl tracking-tight text-gray-900 group-hover:text-green-600 transition">
            Roly AI
          </span>
        </Link>

        {/* LINKLER (Masaüstü) */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200"
            >
              {link.title}
            </Link>
          ))}
        </div>

        {/* CTA BUTONU */}
        <Link href={"#beta"}>
          <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-lg shadow-orange-100 hover:shadow-green-100 hover:-translate-y-0.5">
            Download the App
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
