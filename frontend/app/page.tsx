"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Zap, Cpu, Network, Rocket, Code2 } from "lucide-react";

export default function Home() {
  const mesh1Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll reveal via IntersectionObserver
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    // Parallax on mesh gradient
    const handleScroll = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const scrolled = window.scrollY;
      if (mesh1Ref.current) {
        mesh1Ref.current.style.transform = `translateY(${scrolled * 0.15}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex-grow relative font-sans">
      {/* ── Mesh background gradient ── */}
      <div
        ref={mesh1Ref}
        className="mesh-gradient-1 pointer-events-none fixed inset-0 w-full h-full -z-10"
      />

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="reveal pt-32 pb-24 px-8 max-w-7xl mx-auto flex flex-col items-center text-center gap-16 min-h-[819px] relative z-10">
        {/* Hero text */}
        <div className="flex flex-col items-center gap-8 z-10">
          <h1 className="text-display-lg text-[#e2e8f0] max-w-4xl leading-[1.05]">
            Code at the speed of thought.
            <br />
            <span className="font-editorial italic font-normal text-[#cbd5e1] text-[1.15em] tracking-normal">
              AI-native learning.
            </span>
          </h1>
          <p className="text-body-lg text-white/70 max-w-2xl">
            The hyper-fast environment for modern developers. Instant compilation,
            real-time AI context, and sub-millisecond grading.
          </p>
          <div className="flex gap-4 flex-wrap justify-center pt-4">
            <Link
              href="/problems"
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-base no-underline transition-transform duration-200 hover:scale-105"
            >
              Problems <Rocket className="w-5 h-5" />
            </Link>
            <Link
              href="/doubts"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base border border-white/10 text-white no-underline backdrop-blur-md transition-colors duration-200 hover:bg-white/5"
            >
              Doubts
            </Link>
          </div>
        </div>

        {/* Floating code editor */}
        <div className="floating w-full max-w-4xl relative mt-8">
          {/* Glow halo */}
          <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-orange-500/20 to-indigo-500/20 blur-3xl rounded-3xl z-0" />

          {/* Editor window */}
          <div className="glass-card rounded-3xl overflow-hidden relative z-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-left">
            {/* Title bar */}
            <div className="bg-black/40 px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <span className="text-label-sm text-white/40 uppercase tracking-widest">
                binary_search.py
              </span>
            </div>

            {/* Code body */}
            <div className="p-8 bg-black/60 backdrop-blur-3xl overflow-x-auto">
              <pre className="text-code-md m-0 text-white/90 leading-[1.8] whitespace-pre tab-4">
                <span className="text-pink-400 font-bold">def</span>{" "}
                <span className="text-indigo-300">binary_search</span>
                {"(arr, target):\n    "}
                <span className="text-white/40 italic">
                  {"# AI analyzing complexity... O(log n) detected"}
                </span>
                {"\n    left, right = 0, "}
                <span className="text-indigo-300">len</span>
                {"(arr) - 1\n    "}
                <span className="text-orange-400 font-bold">while</span>
                {" left <= right:\n        mid = (left + right) // 2\n        "}
                <span className="text-orange-400 font-bold">if</span>
                {" arr[mid] == target:\n            "}
                <span className="text-pink-400 font-bold">return</span>
                {" mid\n        "}
                <span className="text-orange-400 font-bold">elif</span>
                {" arr[mid] < target:\n            left = mid + 1\n        "}
                <span className="text-orange-400 font-bold">else</span>
                {":\n            "}
                <span className="ghost-text" data-text="right = mid - 1">
                  right = mid - 1
                </span>
                {"\n    "}
                <span className="text-pink-400 font-bold">return</span>
                {" -1"}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── FEATURES ─────────────────────── */}
      <section className="reveal py-24 px-8 max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-20">
          <span className="text-label-sm block bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent uppercase tracking-widest mb-3">
            BUILT FOR SPEED
          </span>
          <h2 className="text-headline-lg text-white">
            Next-Gen Architecture.
          </h2>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="w-7 h-7" />}
            iconColor="text-pink-400"
            title="Multi-Language Editor & Grading"
            desc="Write in Python, JS, C++, or Java. Submit securely and get instant execution results against hidden test cases."
          />
          <FeatureCard
            icon={<Cpu className="w-7 h-7" />}
            iconColor="text-orange-400"
            title="AI Code Feedback"
            desc="Every submission triggers GPT-4o-mini analysis. Get instant, hyper-specific feedback on complexity and best practices."
          />
          <FeatureCard
            icon={<Network className="w-7 h-7" />}
            iconColor="text-indigo-400"
            title="Doubt Forum & Teacher Review"
            desc="Ask questions and get AI-drafted answers, verified by expert teachers to ensure highest quality learning."
          />
        </div>
      </section>

      {/* ─────────────────────────── SPEED LOOP ───────────────────── */}
      <section className="reveal py-24 px-8 bg-white/[0.02] border-y border-white/5 backdrop-blur-2xl relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-headline-lg text-white">
              The Speed Loop
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-12 relative">
            <StepCard
              num="1"
              gradient="from-pink-500 to-orange-500"
              title="Select Target"
              desc="Choose a high-performance challenge."
              delay="delay-100"
            />
            <StepCard
              num="2"
              gradient="from-orange-500 to-indigo-500"
              title="Execute Code"
              desc="Write and compile in sub-milliseconds."
              delay="delay-200"
            />
            <StepCard
              num="3"
              gradient="from-indigo-500 to-pink-500"
              title="AI Refine"
              desc="Instant neural feedback to hyper-optimize."
              delay="delay-300"
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────────── FOOTER ───────────────────────── */}
      <footer className="bg-black/80 backdrop-blur-3xl border-t border-white/5 mt-auto relative z-10">
        <div className="flex flex-wrap justify-between items-center p-12 max-w-7xl mx-auto gap-8">
          <div className="flex flex-col gap-2">
            <div className="text-headline-md text-white flex items-center gap-2 font-extrabold">
              <Code2 className="w-6 h-6 text-pink-500" />
              Codexa
            </div>
            <span className="text-body-md text-white/50 text-sm">
              Next-gen AI code acceleration.
            </span>
          </div>
          <div className="flex gap-8">
            {["Terms", "Privacy", "API", "Status"].map((label) => (
              <Link
                key={label}
                href={`/${label.toLowerCase()}`}
                className="text-label-sm text-white/40 uppercase tracking-widest no-underline hover:text-white transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="text-label-sm text-white/30 uppercase tracking-widest">
            © {new Date().getFullYear()} Codexa // V.2.0.1
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-components ── */

function FeatureCard({
  icon,
  iconColor,
  title,
  desc,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="glass-card reveal rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden cursor-default">
      <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${iconColor} backdrop-blur-md shrink-0`}>
        {icon}
      </div>
      <div>
        <h3 className="text-headline-md text-white mb-2">
          {title}
        </h3>
        <p className="text-body-md text-white/60">
          {desc}
        </p>
      </div>
    </div>
  );
}

function StepCard({
  num,
  gradient,
  title,
  desc,
  delay,
}: {
  num: string;
  gradient: string;
  title: string;
  desc: string;
  delay: string;
}) {
  return (
    <div className={`reveal ${delay} flex flex-col items-center text-center gap-6 max-w-[280px] w-full`}>
      <div className="w-24 h-24 rounded-3xl bg-black/50 border border-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
        <span className={`text-3xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {num}
        </span>
      </div>
      <div>
        <h4 className="text-headline-md text-white mb-2">
          {title}
        </h4>
        <p className="text-body-md text-white/60">
          {desc}
        </p>
      </div>
    </div>
  );
}
