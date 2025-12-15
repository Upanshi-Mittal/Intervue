'use client'
import { motion } from 'framer-motion'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  Briefcase,
  Code,
  GraduationCap,
  SlidersHorizontal
} from 'phosphor-react'

export default function OnboardingPage() {
  const router = useRouter()

  const [role, setRole] = useState('')
  const [experience, setExperience] = useState('')
  const [techStack, setTechStack] = useState<string[]>([])
  const [goal, setGoal] = useState('')
  const [style, setStyle] = useState('neutral')

  const techOptions = [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'Java',
    'C++',
    'SQL',
    'MongoDB',
    'AWS',
    'Docker'
  ]

  const toggleTech = (tech: string) => {
    setTechStack(prev =>
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("User not logged in");
      return;
    }
    if (!role || !experience || techStack.length === 0) {
      console.log('Please complete required fields')
      return
    }

    console.log({
      role,
      experience,
      techStack,
      goal,
      interviewStyle: style
    })

    const url = `http://localhost:4000/api/auth/onboarding`;
    const payload = {
      userId,
      role,
      experience,
      tech_stack: techStack,
      goal,
      interview_style: style
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("Onboarding failed:", data.message);
        return;
      }

      router.push("/dashboard");

    } catch (error) {
      console.error('Error during onboarding:', error);
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-neutral-950 flex items-center justify-center overflow-hidden">
      {/* ambient gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.15),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="
          relative z-10 w-full max-w-md
          rounded-2xl border border-white/10
          bg-white/5 backdrop-blur-xl
          shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_40px_rgba(0,0,0,0.4)]
          p-6
        "
      >
        {/* header */}
        <div className="mb-6 space-y-1">
          <h1 className="text-xl font-semibold text-white">
            Interview setup
          </h1>
          <p className="text-sm text-white/60">
            Help us personalize your interview experience
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* role */}
          <div className="relative">
            <Briefcase
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <select
              className="w-full rounded-lg bg-white/5 pl-10 pr-3 py-2.5
              text-sm text-white outline-none ring-1 ring-white/10
              focus:ring-2 focus:ring-white/20 transition"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Target role *</option>
              <option>Frontend Developer</option>
              <option>Backend Developer</option>
              <option>Full Stack Developer</option>
              <option>Data Scientist</option>
              <option>ML Engineer</option>
              <option>DevOps Engineer</option>
              <option>Product Manager</option>
            </select>
          </div>

          {/* experience */}
          <div className="relative">
            <GraduationCap
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <select
              className="w-full rounded-lg bg-white/5 pl-10 pr-3 py-2.5
              text-sm text-white outline-none ring-1 ring-white/10
              focus:ring-2 focus:ring-white/20 transition"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              <option value="">Experience level *</option>
              <option>Student / Fresher</option>
              <option>0–1 years</option>
              <option>1–3 years</option>
              <option>3–5 years</option>
              <option>5+ years</option>
            </select>
          </div>

          {/* tech stack */}
          <div>
            <p className="mb-2 text-xs text-white/60">
              Primary technologies *
            </p>
            <div className="flex flex-wrap gap-2">
              {techOptions.map((tech) => (
                <button
                  type="button"
                  key={tech}
                  onClick={() => toggleTech(tech)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs transition
                    ${techStack.includes(tech)
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-white/70 ring-1 ring-white/10'}
                  `}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          {/* goal */}
          <div className="relative">
            <Code
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <select
              className="w-full rounded-lg bg-white/5 pl-10 pr-3 py-2.5
              text-sm text-white outline-none ring-1 ring-white/10
              focus:ring-2 focus:ring-white/20 transition"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              <option value="">Interview goal (optional)</option>
              <option>First job</option>
              <option>Internship</option>
              <option>Job switch</option>
              <option>FAANG preparation</option>
              <option>Mock interview</option>
            </select>
          </div>

          {/* style */}
          <div className="relative">
            <SlidersHorizontal
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <select
              className="w-full rounded-lg bg-white/5 pl-10 pr-3 py-2.5
              text-sm text-white outline-none ring-1 ring-white/10
              focus:ring-2 focus:ring-white/20 transition"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              <option value="friendly">Friendly & guiding</option>
              <option value="neutral">Neutral (real interview)</option>
              <option value="strict">Strict & challenging</option>
            </select>
          </div>

          {/* submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="
              w-full mt-3 rounded-lg
              bg-white text-black
              py-2.5 text-sm font-medium
              shadow-lg shadow-white/20
              hover:bg-white/90
              transition
            "
          >
            Start Interview
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
