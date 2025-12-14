'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { EnvelopeSimple, LockSimple } from 'phosphor-react'
import { FormEvent, useEffect, useState } from 'react'
import {useRouter} from 'next/navigation'

export default function LoginPage() {
  const router = useRouter();
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
  const handleLogin = async(e : FormEvent<HTMLFormElement>) => {
    // handle login logic here
    e.preventDefault();
    if (!email || !password) {
      console.log('Please fill in all fields');
      return;
    }
    const url = `http://localhost:4000/api/auth/login`;
    try{
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({email, password }),
      });
      const data = await response.json();
      console.log('Login successful:', data);

      setTimeout(() => {
        window.dispatchEvent(new Event("login"));
        router.push("/dashboard");
    },1000);
    } catch (error) {
      console.error('Error during login:', error);
    }
  }
    useEffect(() => {
      console.log('Logging in with:', { email, password });
    }, [email, password])
  
  
  return (
    <div className="relative min-h-screen w-full bg-neutral-950 flex items-center justify-center overflow-hidden">
      {/* subtle gradient noise */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.15),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="
          relative z-10 w-full max-w-sm
          rounded-2xl border border-white/10
          bg-white/5 backdrop-blur-xl
          shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_40px_rgba(0,0,0,0.4)]
          p-6
        "
      >
        {/* header */}
        <div className="mb-6 space-y-1">
          <h1 className="text-xl font-semibold text-white">
            Welcome back
          </h1>
          <p className="text-sm text-white/60">
            Sign in to your account
          </p>
        </div>

        {/* form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          {/* email */}
          <div className="relative">
            <EnvelopeSimple
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="email"
              placeholder="Email"
              className="
                w-full rounded-lg bg-white/5
                pl-10 pr-3 py-2.5
                text-sm text-white placeholder:text-white/40
                outline-none
                ring-1 ring-white/10
                focus:ring-2 focus:ring-white/20
                transition
              "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
            />
          </div>

          {/* password */}
          <div className="relative">
            <LockSimple
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="password"
              placeholder="Password"
              className="
                w-full rounded-lg bg-white/5
                pl-10 pr-3 py-2.5
                text-sm text-white placeholder:text-white/40
                outline-none
                ring-1 ring-white/10
                focus:ring-2 focus:ring-white/20
                transition
              "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
            />
          </div>

          {/* actions */}
          <div className="flex items-center justify-between text-xs text-white/60">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="accent-white/80"
              />
              Remember me
            </label>
            <span className="hover:text-white transition cursor-pointer">
              Forgot password?
            </span>
          </div>

          {/* button */}
         <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="
              w-full mt-2 rounded-lg
              bg-white text-black
              py-2.5 text-sm font-medium
              shadow-lg shadow-white/20
              hover:bg-white/90
              transition
            "
            type="submit"
          >
            Sign in
          </motion.button>
        </form>

        {/* footer */}
        <p className="mt-6 text-center text-xs text-white/50">
          Don’t have an account?{' '}
          <Link href={'/register'} ><span className="text-white hover:underline cursor-pointer">
            Create one
          </span></Link>
        </p>
      </motion.div>
    </div>
  )
}
