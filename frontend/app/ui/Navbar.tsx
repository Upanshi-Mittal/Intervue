"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import Image from "next/image";
import grain from "../../public/grain.avif";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/authStore";
export default function Navbar() {
  const router = useRouter();

  const loggedIn = useAuthStore((s) => s.isAuthenticated);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const logoutStore = useAuthStore((s) => s.logout);

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
        { name: "Dashboard", href: "/dashboard", variant: "ghost" as const },
        { name: "Interview", href: "/interview", variant: "ghost" as const },
      ];
    }

    return [
      { name: "Register", href: "/register", variant: "primary" as const },
      { name: "Login", href: "/login", variant: "outline" as const },
    ];
  }, [loggedIn]);

  return (
    <div className="w-full fixed top-5 z-999 flex justify-center pointer-events-none">
      <header
        id="nav"
        className="relative max-w-6xl p-6 transition-all rounded-md w-full flex justify-between items-center pointer-events-auto"
      >
        <Image
          src={grain}
          alt="grain"
          fill
          className="absolute opacity-5 inset-0 object-cover mix-blend-overlay pointer-events-none"
        />

        <div className="text-white font-bold text-xl tracking-widest">
          <Link href="/">INTERVUE.AI</Link>
        </div>

        <div className="flex gap-4 items-center">
          {links.map((link, i) => (
            <Link key={link.name} href={link.href}>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * i }}
                className={getButtonStyle(link.variant)}
              >
                {link.name}
              </motion.button>
            </Link>
          ))}

          {loggedIn && (
            <motion.button
              className={getButtonStyle("outline")}
                onClick={async () => {
                await fetch("http://localhost:4000/api/auth/logout", {
                  method: "POST",
                  credentials: "include",
                });

                logoutStore();
                router.replace("/");
              }}
            >
              Logout
            </motion.button>
          )}
        </div>
      </header>
    </div>
  );
}

function getButtonStyle(
  variant: "primary" | "outline" | "ghost"
) {
  switch (variant) {
    case "primary":
      return "px-6 py-2 rounded-full bg-white text-black text-xs uppercase";
    case "outline":
      return "px-6 py-2 rounded-full border border-white/20 text-white text-xs uppercase";
    case "ghost":
      return "px-6 py-2 rounded-full text-white/80 text-xs uppercase";
  }
}
