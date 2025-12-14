'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  User,
  EnvelopeSimple,
  LockSimple
} from 'phosphor-react'
import { useState, FormEvent, useEffect} from 'react'
import {useRouter} from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try{
    if (!username || !email || !password || !confirmPassword) {
      console.log("Please fill in all fields")
      return
    }
    if (password !== confirmPassword){
      console.log("Passwords do not match")
      return
    }
    const res = await fetch("http://localhost:4000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        username,
        email,
        password,
        confirm_password: confirmPassword,
      }),
    })
    const data = await res.json()
    console.log(data)
    if (res.ok) {
      console.log("Registration successful");
      setTimeout(() => {
        router.push("/dashboard")},1000);
    } else {
      console.log("Registration failed:", data.message)
    }

  } catch (error) {
    console.error("Error during registration:", error)
  }
  }
  useEffect(() => {
    console.log('Registering with:', { username, email, password, confirmPassword });
  }, [username, email, password, confirmPassword]);

  return (
    <div className="relative min-h-screen w-full bg-neutral-950 flex items-center justify-center overflow-hidden">
      {/* ambient gradient */}
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
            Create account
          </h1>
          <p className="text-sm text-white/60">
            Start building something cool
          </p>
        </div>

        {/* form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* name */}
          <div className="relative">
            <User
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="text"
              placeholder="Name"
              className="
                w-full rounded-lg bg-white/5
                pl-10 pr-3 py-2.5
                text-sm text-white placeholder:text-white/40
                outline-none
                ring-1 ring-white/10
                focus:ring-2 focus:ring-white/20
                transition
              "
              id="username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
          </div>

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
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
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
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          {/* confirm password */}
          <div className="relative">
            <LockSimple
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="password"
              placeholder="Confirm password"
              className="
                w-full rounded-lg bg-white/5
                pl-10 pr-3 py-2.5
                text-sm text-white placeholder:text-white/40
                outline-none
                ring-1 ring-white/10
                focus:ring-2 focus:ring-white/20
                transition
              "
              id="confirmPassword"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
            />
          </div>

          {/* terms */}
          <p className="text-xs text-white/50 leading-relaxed">
            By creating an account, you agree to our{' '}
            <span className="text-white hover:underline cursor-pointer">
              Terms
            </span>{' '}
            and{' '}
            <span className="text-white hover:underline cursor-pointer">
              Privacy Policy
            </span>.
          </p>

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
          >
            Create account
          </motion.button>
        </form>

        {/* footer */}
        <p className="mt-6 text-center text-xs text-white/50">
          Already have an account?{' '}
         <Link href="/login"> <span className="text-white hover:underline cursor-pointer">
            Sign in
          </span></Link>
        </p>
      </motion.div>
    </div>
  )
}

