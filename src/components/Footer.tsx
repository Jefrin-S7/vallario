import Link from "next/link";
import Image from "next/image";
import { AtSign, PlaySquare, Music2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70">
      <div className="v-container py-16 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/brand/vallario-logo.png"
              alt="VALLARIO"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="font-display font-bold text-lg text-white">
              VALLARIO
            </span>
          </Link>
          <p className="mt-4 text-sm max-w-xs">
            Premium digital products &amp; automation — build, automate, create,
            and grow with one library.
          </p>
          <div className="flex gap-3 mt-6">
            {[AtSign, PlaySquare, Music2].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center hover:border-violet hover:text-violet transition"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <FooterCol
          title="Shop"
          links={[
            ["Collections", "/shop"],
            ["AI & Automation", "/shop?category=AI+%26+Automation"],
            ["Courses", "/shop?category=Courses"],
            ["Ebooks", "/shop?category=Ebooks"],
            ["Bundles", "/shop?category=Digital+Product+Bundles"],
          ]}
        />
        <FooterCol
          title="Support"
          links={[
            ["Contact", "/support"],
            ["FAQ", "/support#faq"],
            ["Help Center", "/support"],
            ["Order Status", "/dashboard?tab=orders"],
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            ["Legal Overview", "/legal"],
            ["Privacy Policy", "/legal/privacy"],
            ["Terms of Service", "/legal/terms"],
            ["Refund Policy", "/legal/refunds"],
            ["License Agreement", "/legal/license"],
          ]}
        />
      </div>
      <div className="border-t border-white/10">
        <div className="v-container py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <span>© {new Date().getFullYear()} VALLARIO. All rights reserved.</span>
          <span>Secure payments via Cashfree &amp; PayPal.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="font-display text-white text-sm font-semibold mb-4">
        {title}
      </h4>
      <ul className="space-y-2.5 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="hover:text-white transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
