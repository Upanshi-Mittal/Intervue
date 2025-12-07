"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useMemo } from "react";
import grain from "../../public/grain.avif";
import Image from "next/image";

type NavbarProps = {
  isLoggedIn: boolean;
};

export default function Navbar({ isLoggedIn }: NavbarProps) {
  const links = useMemo(() => {
    if (isLoggedIn) {
      return [
        { name: "Dashboard", href: "/dashboard", variant: "ghost" },
        { name: "Interview", href: "/interview", variant: "ghost" },
        { name: "Logout", href: "/logout", variant: "outline" },
      ];
    }

    return [
      { name: "Register", href: "/register", variant: "primary" },
      { name: "Login", href: "/login", variant: "outline" },
    ];
  }, [isLoggedIn]);

  useEffect(() => {
    
    window.addEventListener("scroll", () => {

        if(window.scrollY) {
            // add shadow to navbar
            const navbar = document.querySelector("#nav");
            if(navbar) {
                navbar.classList.add("backdrop-blur-lg", "bg-white/10", "shadow-lg", "w-[60%]");
                 navbar.classList.remove("w-full");
            }
        } else {
            const navbar = document.querySelector("header");
            if(navbar) {
                navbar.classList.remove("backdrop-blur-lg", "bg-white/10", "shadow-lg", "w-[60%]");
                   navbar.classList.add("w-full");
            }
        }

    });

  }, []);

  return (
    <div className="w-full fixed top-5 z-99 flex justify-center items-center pointer-events-none ">
      <header id='nav' className="max-w-6xl p-6 transition-all duration-600 ease-out rounded-md w-full flex justify-between items-center pointer-events-auto">
       
       <Image src={grain} alt="grain" className="absolute opacity-5 inset-0 w-full h-full object-cover mix-blend-overlay pointer-events-none"
       fill

       ></Image>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-white font-bold text-xl tracking-widest mix-blend-difference"
        >
          <Link href="/">INTERVUE.AI</Link>
        </motion.div>

        {/* Right actions */}
        <div className="flex flex-wrap gap-4">
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
      return `
        px-6 py-2 rounded-full
        border border-white/20
        bg-white text-black
        text-xs uppercase tracking-widest
        backdrop-blur-md
        hover:bg-white/50 transition-colors
      `;
    case "outline":
      return `
        px-6 py-2 rounded-full
        border border-white/20
        text-white
        text-xs uppercase tracking-widest
        backdrop-blur-md
        hover:bg-white/15 hover:border-white transition-colors
      `;
    case "ghost":
      return `
        px-6 py-2 rounded-full
        text-white/80
        text-xs uppercase tracking-widest
        hover:text-white transition-colors
      `;
  }
}
