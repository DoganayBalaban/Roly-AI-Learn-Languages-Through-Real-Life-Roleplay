import Image from "next/image";
import Link from "next/link";

interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

interface Footer2Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  tagline?: string;
  menuItems?: MenuItem[];
  copyright?: string;
  bottomLinks?: {
    text: string;
    url: string;
  }[];
}

const Footer2 = ({
  logo = {
    src: "/logo.png",
    alt: "Roly AI Logo",
    title: "Roly AI",
    url: "/",
  },
  tagline = "Master languages through real-life conversations.",
  menuItems = [
    {
      title: "Product",
      links: [
        { text: "Features", url: "/" },
        { text: "Download App", url: "#download" },
      ],
    },
    {
      title: "Company",
      links: [
        {
          text: "About Us",
          url: "https://www.linkedin.com/in/doganay-balaban/",
        },
        { text: "Contact", url: "mailto:balabandoganay@gmail.com" },
      ],
    },
    {
      title: "Social",
      links: [
        { text: "Instagram", url: "https://instagram.com/doganay_balaban" },
        { text: "Twitter / X", url: "https://twitter.com/kami_0w" },
        {
          text: "LinkedIn",
          url: "https://www.linkedin.com/in/doganay-balaban/",
        },
      ],
    },
  ],
  copyright = "© 2025 RolyAI. All rights reserved.",
  bottomLinks = [
    {
      text: "Terms and Conditions",
      url: "https://www.notion.so/Terms-2b8229429c648081a57cf17c7da96bea?source=copy_link",
    },
    {
      text: "Privacy Policy",
      url: "https://www.notion.so/Privacy-2b8229429c6480c8afc4fb351bb9fef7?source=copy_link",
    },
  ],
}: Footer2Props) => {
  return (
    <section className="bg-white border-t border-gray-100 py-12">
      <div className="container mx-auto px-6">
        <footer>
          {/* Üst Kısım: Logo ve Linkler */}
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
            {/* Logo ve Slogan Alanı (Geniş) */}
            <div className="col-span-2 mb-8 lg:mb-0">
              <div className="flex items-center gap-2 lg:justify-start">
                <Link href="/">
                  <div className="relative w-10 h-10 overflow-hidden rounded-lg">
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      fill // width/height yerine fill daha esnek olur
                      className="object-cover"
                    />
                  </div>
                </Link>
                <p className="text-xl font-bold text-gray-900">{logo.title}</p>
              </div>
              <p className="mt-4 text-gray-500 max-w-xs leading-relaxed">
                {tagline}
              </p>
            </div>

            {/* Menü Linkleri */}
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-semibold text-gray-900">
                  {section.title}
                </h3>
                <ul className="space-y-3 text-gray-500">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-green-600 transition-colors"
                    >
                      {link.url.startsWith("http") ? (
                        <a href={link.url} target="_blank" rel="noreferrer">
                          {link.text}
                        </a>
                      ) : (
                        <Link
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          prefetch={false}
                        >
                          {link.text}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Alt Kısım: Copyright ve Legal Linkler */}
          <div className="mt-16 flex flex-col justify-between gap-4 border-t border-gray-100 pt-8 text-sm font-medium text-gray-500 md:flex-row md:items-center">
            <p>{copyright}</p>
            <ul className="flex gap-6">
              {bottomLinks.map((link, linkIdx) => (
                <li
                  key={linkIdx}
                  className="hover:text-green-600 transition-colors"
                >
                  {link.url.startsWith("http") ? (
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {link.text}
                    </a>
                  ) : (
                    <Link
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      prefetch={false}
                    >
                      {link.text}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
    </section>
  );
};

export { Footer2 };
