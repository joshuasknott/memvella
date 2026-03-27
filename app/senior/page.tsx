"use client";

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { Mic } from 'lucide-react';

export default function SeniorHomePage() {
  return (
    <main className="flex h-full w-full overflow-hidden">
      {/* Left Column (40%) */}
      <section className="w-[40%] h-full flex flex-col justify-between p-12 border-r border-outline-variant/10 bg-surface-container-low/30">
        
        {/* Branding */}
        <BrandLogo className="mb-8" />

        {/* Time and Date */}
        <div className="grow flex flex-col justify-center">
          {/* Radical Accessibility Greeting */}
          <p className="font-headline text-slate-500 font-semibold text-4xl mb-4">
            Good Afternoon, Mom
          </p>
          <h1 className="font-headline font-extrabold text-7xl text-slate-900 tracking-tighter mb-2">
            2:14 PM
          </h1>
          <p className="font-headline text-5xl font-bold mb-12 text-slate-900">Today is Wednesday, October 25th</p>

          {/* Current Update Card */}
          <div className="bg-surface-container-lowest p-10 rounded-4xl shadow-md border border-slate-200 border-l-12 border-l-secondary relative overflow-hidden">
            <div className="flex items-start gap-6">
              <div>
                <p className="font-headline text-3xl font-bold text-on-surface leading-tight">
                  Emily is coming over for tea at 3:00 PM.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Action Button */}
        <div className="mt-12">
          <Link href="/senior/voice" className="block text-center bg-linear-to-br from-primary to-secondary w-full py-10 px-8 rounded-full shadow-xl active:scale-95 transition-transform duration-200">
            <div className="flex items-center justify-center gap-6">
              <Mic className="text-white shrink-0" size={48} strokeWidth={2.5} />
              <span className="text-white font-headline font-bold text-3xl">Tap to talk to Memvella</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Right Column (60%) */}
      <section className="w-[60%] h-full p-12 overflow-y-auto bg-surface relative">
        <header className="mb-12 flex justify-between items-end">
          <h2 className="font-headline text-5xl font-extrabold text-on-surface">Memory Gallery</h2>
        </header>

        {/* Bento-style Gallery Grid */}
        <div className="grid grid-cols-2 gap-12 pb-12">
          
          {/* Polaroid 1 */}
          <div className="flex flex-col gap-4 -rotate-2">
            <div className="bg-white p-4 pb-12 rounded-sm border border-slate-200 shadow-md">
              <div className="aspect-4/3 overflow-hidden rounded-sm bg-surface-container">
                <img alt="David's graduation" className="w-full h-full object-cover grayscale-20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8q1VtfiVpAR-JbAD8EzJ-m83AUrGV0bLEHKXcBfWHJK_QEbnT0iflKWonxsGNZS6YgdQ9TMvWneEQIBjxa4gZH7gPuNo2Xcw0LKasa_YyOp7vuGLDHA1Qrc9vQXk0mx7IKF9w2AvFz6qNvnkbTJx3bEjo5AF0Y_AnXlZb2GLCyy4OqwuvjHCVxiR5XS-nifAhf0Ssl-aWLlPeAqKcF98y6cIW3uKdX7RsX8M1kZtXeBCU4Hq6OtyNwRswzuWf_4BdgPPNYVfgDkxh" />
              </div>
            </div>
            <p className="font-headline text-2xl font-bold text-on-surface text-center tracking-tight">David&apos;s graduation, 2019</p>
          </div>

          {/* Polaroid 2 */}
          <div className="flex flex-col gap-4 rotate-2 mt-8">
            <div className="bg-white p-4 pb-12 rounded-sm border border-slate-200 shadow-md">
              <div className="aspect-4/3 overflow-hidden rounded-sm bg-surface-container">
                <img alt="Emily's first dog" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm_vFkMyECviGwV9MXJTfrB6ZeD3JcAsVLTRGZq_0ASQhhjCH1NF29pM7-fXXeYT9yyMrY8STndZZDDxSTLZ3w92i3XJNfXfCiMeACBdp6uqnWJ2as_6FoMTZy5qvzkIZLftS1opUkX1ZZW8uyAy-inL1TSmD0OszIeTBV6gwPyII34rSd25F1ov3_srj6xLT097I6zmLqcP8mtCCYrvhArbbJQhat6LXbZGS00qzUqPqYPNbU2mm3srzkgTtTsNCL37LNDmTdvDST" />
              </div>
            </div>
            <p className="font-headline text-2xl font-bold text-on-surface text-center tracking-tight">Emily&apos;s first dog, 2017</p>
          </div>

          {/* Polaroid 3 */}
          <div className="flex flex-col gap-4 -rotate-2">
            <div className="bg-white p-4 pb-12 rounded-sm border border-slate-200 shadow-md">
              <div className="aspect-square overflow-hidden rounded-sm bg-surface-container">
                <img alt="Family picnic" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTbrz4I95KZs11et0SE7_q9AB8kqoRWB7SCQQb28MCTEuat_3RR4TOv0huujPvQCG7Vz6prGK0b37mj1rLGEKRv8il56Q4GPRy7Vqu-NpGNO3Y7_pP-XPhZvi_kGjrQ8MlMTtk7ECdGL-HHc9ot4CpnoydlLm6eFGF7G0NMsqSIlmUUz7P0bqKYt-i7iwE3UoMC147kzDkxYoch6pxnNVVDOk2v-kwbV3hooagbLeHpHhAGvnzzBO4rzIfb714-Vhc4B-pkTm1Y59e" />
              </div>
            </div>
          </div>

          {/* Polaroid 4 */}
          <div className="flex flex-col gap-4 rotate-2 -mt-12">
            <div className="bg-white p-4 pb-12 rounded-sm border border-slate-200 shadow-md">
              <div className="aspect-3/4 overflow-hidden rounded-sm bg-surface-container">
                <img alt="Garden flowers" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE6CkzJcT545t6EbbI5Sol-bva5Ml6M9-_LberbUAxMIK0DYSc3YMeHVqRD6iwC34hBlRCbz9SNlSM7RNrbAvNsZ__WJrITHY2nqJVkSvfaHRIOHL5p1ygAq34cmjIuFUyw8x-a2RboVTqSD2NHDBU4-DoC6F05MRSHqL3fnQ9Th3JlqfoBSn_ou2l6TXYsp66aAmSaEIPYtjERcSXNp8UP4GYWKKueNh6tgbS0Jj76HFaypSO5UQ7tSlMYUvB3TmMRxjpYdZgMVcd" />
              </div>
            </div>
          </div>

          {/* Polaroid 5 (Large Span) */}
          <div className="flex flex-col gap-4 col-span-2 items-center mt-4">
            <div className="bg-white p-4 pb-12 rounded-sm w-[70%] -rotate-2 border border-slate-200 shadow-md">
              <div className="aspect-video overflow-hidden rounded-sm bg-surface-container">
                <img alt="Old wedding photo" className="w-full h-full object-cover grayscale brightness-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqzdoylzjVT-zhy6osZx44ezojtyntwvN74R16YilWurYDVxXKB0rVEcJxJ_HP15FnbO46h8Q1J0zpmb_t0XT0Bu09lOClzFoRo8GzvapiK_rNbN4nsyw3xMuvUAmqc8PbQklSZ0PQKh9DJ9GA3futxkCGGm_adbA7vBSbN9daRt1XGyEXp2r13I_ILJDW4E_fsE2WDNCO3biBnm43wYs9udMDjmzeulqvGYTnz6QcZU7uVI6hyoARbSKhWgVqDjOXcBTrb_DWbs3J" />
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
