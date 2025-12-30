"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import grain from "../../public/grain.avif";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/authStore";
import { Home, Video, FileText, LogOut } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  const loggedIn = useAuthStore((s) => s.isAuthenticated);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const logoutStore = useAuthStore((s) => s.logout);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onLogin = () => setAuthenticated(true);
    const onLogout = () => setAuthenticated(false);
    const onRegister = () => setAuthenticated(true);
    window.addEventListener("login", onLogin);
    window.addEventListener("logout", onLogout);
    window.addEventListener("register", onRegister);

    return () => {
      window.removeEventListener("login", onLogin);
      window.removeEventListener("logout", onLogout);
      window.removeEventListener("register", onRegister);
    };
  }, [setAuthenticated]);

  const links = useMemo(() => {
    if (loggedIn) {
      return [
        { name: "Dashboard", href: "/dashboard", variant: "ghost" as const, icon: Home },
        { name: "Interview", href: "/interview", variant: "ghost" as const, icon: Video },
      ];
    }

    return [
      { name: "Register", href: "/register", variant: "primary" as const, icon: null },
      { name: "Login", href: "/login", variant: "outline" as const, icon: null },
    ];
  }, [loggedIn]);

  return (
    <div className="w-full fixed top-5 left-0 right-0 z-999 flex justify-center pointer-events-none">
      <motion.header
        id="nav"
        initial={false}
        animate={{
          paddingTop: isScrolled ? "12px" : "20px",
          paddingBottom: isScrolled ? "12px" : "20px",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`relative max-w-6xl w-[95%] flex justify-between items-center pointer-events-auto px-6 transition-all duration-300 ${
          isScrolled
            ? "backdrop-blur-xl bg-white/10 border border-white/20 rounded-full shadow-lg"
            : "bg-transparent rounded-lg"
        }`}
      >
        <Image
          src={grain}
          alt="grain"
          fill
          className="absolute opacity-5 inset-0 object-cover mix-blend-overlay pointer-events-none"
        />

        <motion.div className="text-white font-bold text-xl tracking-widest relative z-10 whitespace-nowrap">
          <Link href="/">INTERVUE</Link>
        </motion.div>

        <div className="flex gap-3 items-center relative z-10">
          {links.map((link) => (
            <Link key={link.name} href={link.href}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={getButtonStyle(link.variant)}
                title={link.name}
              >
                {link.icon && <link.icon size={16} />}
                <span className="hidden sm:inline">{link.name}</span>
              </motion.button>
            </Link>
          ))}

          {loggedIn && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={getButtonStyle("outline")}
              onClick={async () => {
                await fetch("http://localhost:4000/api/auth/logout", {
                  method: "POST",
                  credentials: "include",
                });

                logoutStore();
                router.replace("/");
              }}
              title="Logout"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          )}
        </div>
      </motion.header>
    </div>
  );
}

function getButtonStyle(
  variant: "primary" | "outline" | "ghost"
) {
  switch (variant) {
    case "primary":
      return "px-4 sm:px-6 py-2 rounded-full bg-white text-black text-xs uppercase flex items-center gap-2 transition-all";
    case "outline":
      return "px-4 sm:px-6 py-2 rounded-full border border-white/20 text-white text-xs uppercase flex items-center gap-2 hover:border-white/40 transition-all";
    case "ghost":
      return "px-4 sm:px-6 py-2 rounded-full text-white/80 text-xs uppercase flex items-center gap-2 hover:text-white transition-all";
  }
}

