import React from 'react';
import { Heart, Users, Tablet, Quote } from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';
import WaitlistForm from '@/components/ui/WaitlistForm';
import './waitlist.css';

export default function WaitlistPage() {
    return (
        <div className="bg-background font-body text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed-variant min-h-screen">
            {/* Top Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl transition-all duration-500 ease-in-out">
                <div className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
                    <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tighter font-headline">
                        Memvella
                    </div>
                    <div className="hidden md:flex gap-12">
                        <a className="text-zinc-500 dark:text-zinc-400 font-medium hover:text-purple-600 dark:hover:text-purple-200 transition-colors duration-300" href="#">Experience</a>
                        <a className="text-zinc-500 dark:text-zinc-400 font-medium hover:text-purple-600 dark:hover:text-purple-200 transition-colors duration-300" href="#">Philosophy</a>
                        <a className="text-purple-800 dark:text-purple-400 font-bold border-b-4 border-purple-500/20 transition-colors duration-300" href="#">Waitlist</a>
                    </div>
                    <button className="bg-primary hover:bg-primary-container text-on-primary px-8 py-3 rounded-full font-bold transition-all duration-300 shadow-ambient">
                        Get Access
                    </button>
                </div>
            </nav>

            {/* Main Content Canvas */}
            <main className="relative pt-32 overflow-hidden">
                {/* Background Aura */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="aura-glow absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full"></div>
                    <div className="aura-glow absolute top-1/2 -right-20 w-[800px] h-[800px] rounded-full" style={{ animationDelay: '-4s' }}></div>
                </div>

                {/* Hero Section */}
                <section className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-32 text-center">
                    <div className="mb-16 flex justify-center">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-ambient logo-heartbeat">
                            {/* SVG Logo Placeholder */}
                            <BrandLogo standalone animated />
                        </div>
                    </div>
                    <h1 className="font-headline font-extrabold text-5xl md:text-7xl lg:text-8xl text-on-surface mb-8 leading-[1.1] tracking-tight max-w-5xl mx-auto">
                        The intelligent memory companion <span className="text-[#6B21A8]">powered entirely by conversation.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-on-surface-variant max-w-3xl mx-auto leading-relaxed mb-6 font-medium">
                        Give them back their independence. Give yourself back your peace of mind.
                    </p>
                    <p className="text-lg md:text-xl text-on-surface-variant max-w-3xl mx-auto leading-relaxed mb-16 opacity-90">
                        Memvella turns the tablet they already own into a warm, voice-driven external brain that manages their routines, elegantly answers their questions, and keeps your family effortlessly connected.
                    </p>

                    {/* Waitlist Form */}
                    <div className="max-w-2xl mx-auto">
                        <WaitlistForm />
                        <p className="mt-6 text-sm text-on-surface-variant/60 font-medium">Join 2,400+ people in the Memvella waitlist.</p>
                    </div>

                    {/* Visual Placeholder */}
                    <div className="max-w-4xl mx-auto mt-16 relative aspect-video rounded-[30px] overflow-hidden shadow-ambient border border-zinc-300 dark:border-zinc-700 bg-zinc-200/80 dark:bg-zinc-800/80">
                        {/* 
                          When asset is ready, use next/image to prevent CLS:
                          <Image 
                            src="/images/hero-mockup.png" 
                            alt="iPad mockup running Memvella"
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 1024px"
                            className="object-cover"
                          />
                        */}
                        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm p-8">
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-center text-lg md:text-xl">
                                [ VISUAL PLACEHOLDER: High-quality mockup of an iPad/Android tablet running the Memvella app ]
                            </p>
                        </div>
                    </div>
                </section>

                {/* The Three Pillars Section */}
                <section className="relative z-10 py-32 bg-surface-container-low/50">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="text-center mb-20">
                            <h2 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface tracking-tight">The Three Pillars</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-start">
                            {/* Card 1 */}
                            <div className="bg-white rounded-[30px] p-6 shadow-ambient -rotate-2 transform hover:rotate-0 transition-all duration-500 hover:-translate-y-4">
                                <div className="bg-secondary-container rounded-[24px] p-8 min-h-[400px] flex flex-col justify-between">
                                    <div>
                                        <div className="bg-white/80 w-16 h-16 rounded-full flex items-center justify-center mb-10 shadow-sm">
                                            <Heart className="text-primary" size={32} />
                                        </div>
                                        <h3 className="font-headline font-extrabold text-3xl text-on-surface mb-6 leading-tight">Infinite Patience, Intelligent Guidance</h3>
                                        <p className="text-lg text-on-secondary-container leading-relaxed">Memvella understands the nuances of memory changes. When they ask the same question multiple times, Memvella answers warmly, then gracefully pivots to comforting family memories to help smoothly shift their focus and bring them peace.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-white rounded-[30px] p-6 shadow-ambient lg:mt-24 rotate-1 transform hover:rotate-0 transition-all duration-500 hover:-translate-y-4">
                                <div className="bg-secondary-container rounded-[24px] p-8 min-h-[400px] flex flex-col justify-between">
                                    <div>
                                        <div className="bg-white/80 w-16 h-16 rounded-full flex items-center justify-center mb-10 shadow-sm">
                                            <Users className="text-primary" size={32} />
                                        </div>
                                        <h3 className="font-headline font-extrabold text-3xl text-on-surface mb-6 leading-tight">A Circle of Support (Instant Relief for You)</h3>
                                        <p className="text-lg text-on-secondary-container leading-relaxed">Step out of the role of full-time calendar and back into the role of family. As a "Supporter," you can securely schedule their routines from your phone, drop fresh photos directly onto their screen, and receive quiet, reassuring insights that their day is going beautifully.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-white rounded-[30px] p-6 shadow-ambient lg:-mt-12 -rotate-1 transform hover:rotate-0 transition-all duration-500 hover:-translate-y-4">
                                <div className="bg-secondary-container rounded-[24px] p-8 min-h-[400px] flex flex-col justify-between">
                                    <div>
                                        <div className="bg-white/80 w-16 h-16 rounded-full flex items-center justify-center mb-10 shadow-sm">
                                            <Tablet className="text-primary" size={32} />
                                        </div>
                                        <h3 className="font-headline font-extrabold text-3xl text-on-surface mb-6 leading-tight">No New Hardware to Buy or Learn</h3>
                                        <p className="text-lg text-on-secondary-container leading-relaxed">We believe technology should seamlessly fit into their life. There are no confusing clinical devices to buy. Memvella is a beautiful software experience that lives natively on the Apple or Android tablet already sitting on their coffee table.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Honest Onboarding Section */}
                <section className="relative z-10 py-32 bg-white dark:bg-zinc-950">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            {/* Left Column (Text) */}
                            <div>
                                <h2 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface mb-8 tracking-tight">Honest Onboarding: Designed for Your Reality</h2>
                                <p className="text-xl text-on-surface-variant leading-relaxed mb-12">
                                    Every family's starting line is different. Memvella offers frictionless ways to begin, and adapts as your loved one's needs change:
                                </p>
                                
                                <div className="space-y-10">
                                    {/* Item 1 */}
                                    <div className="flex gap-6">
                                        <div className="w-12 h-12 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center text-primary font-bold text-xl">1</div>
                                        <div>
                                            <h3 className="font-headline font-bold text-2xl text-on-surface mb-3">The Supported Setup <span className="text-primary font-semibold text-xl block mt-1 sm:inline sm:mt-0">(For Guided Care)</span></h3>
                                            <p className="text-lg text-on-surface-variant leading-relaxed">
                                                You set up a "Circle" from your phone, generate a secure 6-digit code, and simply type it into their tablet. In under five minutes, you are fully connected, managing their routines, and effortlessly sharing family memories remotely.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Item 2 */}
                                    <div className="flex gap-6">
                                        <div className="w-12 h-12 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center text-primary font-bold text-xl">2</div>
                                        <div>
                                            <h3 className="font-headline font-bold text-2xl text-on-surface mb-3">The Independent Setup <span className="text-primary font-semibold text-xl block mt-1 sm:inline sm:mt-0">(For Autonomous Users)</span></h3>
                                            <p className="text-lg text-on-surface-variant leading-relaxed">
                                                If they are still confidently managing their own day, they can start their own account directly on their device using a simple, password-free Magic Link.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Item 3 */}
                                    <div className="flex gap-6">
                                        <div className="w-12 h-12 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center text-primary font-bold text-xl">3</div>
                                        <div>
                                            <h3 className="font-headline font-bold text-2xl text-on-surface mb-3">The Bridge <span className="text-primary font-semibold text-xl block mt-1 sm:inline sm:mt-0">(Growing the Circle)</span></h3>
                                            <p className="text-lg text-on-surface-variant leading-relaxed">
                                                Memvella adapts to their journey. An independent user can seamlessly invite you or other family members into their Circle at any time.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column (Visual Placeholder) */}
                            <div className="relative h-[600px] w-full bg-purple-50 dark:bg-purple-900/10 rounded-[40px] flex items-center justify-center overflow-hidden shadow-ambient border border-purple-100 dark:border-purple-800/30 text-center p-12">
                                {/* 
                                  When asset is ready, use next/image to prevent CLS:
                                  <Image 
                                    src="/images/zero-nav-interface.png" 
                                    alt="Split-screen Zero-Nav interface"
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover"
                                  />
                                */}
                                <p className="relative z-10 text-purple-600 dark:text-purple-400 font-medium text-xl md:text-2xl leading-relaxed">
                                    [ VISUAL PLACEHOLDER: Split-screen Zero-Nav interface showing the Logic Anchor (time/date) on the left and Emotional Anchor (photo gallery) on the right. ]
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Founder's Note Section */}
                <section className="relative z-10 py-48 px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-1 bg-surface-variant mb-12 rounded-full"></div>
                            <h2 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface mb-10 tracking-tight">Built from the burden we lived.</h2>
                            <div className="relative">
                                {/* Pull quote icon */}
                                <Quote className="absolute -top-12 -left-12 text-6xl text-primary/5 select-none" size={64} style={{ fill: "currentColor" }} />
                                <p className="text-xl md:text-2xl text-on-surface-variant leading-relaxed font-light italic mb-12 relative z-10">
                                    "Built from the burden we lived. We are currently opening Memvella's private beta to a small group of founding families. Join the waitlist to secure early access, share your feedback directly with our team, and help us build the dignified memory companion we all wish our families had."
                                </p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container relative">
                                    <div className="w-full h-full bg-slate-200" title="Founder Portrait Placeholder" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-on-surface">Elias Thorne</p>
                                    <p className="text-sm text-on-surface-variant">Founder, Memvella</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="relative z-10 pb-48 px-8">
                    <div className="max-w-5xl mx-auto bg-primary rounded-xl overflow-hidden shadow-2xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/50 to-primary pointer-events-none"></div>
                        <div className="relative z-20 p-12 md:p-24 text-center">
                            <h2 className="font-headline font-extrabold text-4xl md:text-6xl text-white mb-8">Ready to meet your new memory companion?</h2>
                            <p className="text-on-primary-container text-xl md:text-2xl mb-12 max-w-2xl mx-auto">Join the waitlist to secure early access for you and your family.</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <button className="bg-white text-primary font-bold h-[72px] px-12 rounded-full hover:shadow-2xl transition-all hover:scale-105 active:scale-95">
                                    Request Early Access for Your Family.
                                </button>
                                <button className="border-2 border-white/30 text-white font-bold h-[72px] px-12 rounded-full hover:bg-white/10 transition-all">
                                    Learn our Philosophy
                                </button>
                            </div>
                        </div>
                        {/* Abstract visual element */}
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mb-48 -mr-48"></div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="relative z-10 py-32 px-8 bg-surface-container-low/30">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface mb-12 text-center">Common Questions</h2>
                        <div className="space-y-4">
                            <details className="group bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800" open>
                                <summary className="font-bold text-lg text-on-surface cursor-pointer list-none flex justify-between items-center group-open:mb-4">
                                    My parent asks the same question repeatedly. Will they just get stuck in a loop talking to the AI?
                                    <span className="text-primary transform transition-transform group-open:rotate-180">↓</span>
                                </summary>
                                <p className="text-on-surface-variant leading-relaxed">
                                    No. Memvella utilizes an approach called Compassionate Redirection. If your loved one asks what time an appointment is, Memvella will answer warmly. If they ask a third time, Memvella still answers with infinite patience, but seamlessly introduces a comforting topic to ease their mind.
                                </p>
                            </details>
                            
                            <details className="group bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <summary className="font-bold text-lg text-on-surface cursor-pointer list-none flex justify-between items-center group-open:mb-4">
                                    Is Memvella always recording? Will my parent feel like they are being spied on?
                                    <span className="text-primary transform transition-transform group-open:rotate-180">↓</span>
                                </summary>
                                <p className="text-on-surface-variant leading-relaxed">
                                    Memvella fiercely protects your family's privacy. It does not use the tablet's camera, so it cannot see them. It uses "ambient audio gating"—meaning it briefly listens for general room noise so it knows not to speak to an empty room. It only processes what is spoken directly to it.
                                </p>
                            </details>
                            
                            <details className="group bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <summary className="font-bold text-lg text-on-surface cursor-pointer list-none flex justify-between items-center group-open:mb-4">
                                    Do I need to buy a $300 specialized smart clock?
                                    <span className="text-primary transform transition-transform group-open:rotate-180">↓</span>
                                </summary>
                                <p className="text-on-surface-variant leading-relaxed">
                                    No. Memvella is purely software. You just download the app to the iPad or Android tablet they already own and are comfortable with.
                                </p>
                            </details>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full py-12 bg-transparent opacity-80 hover:opacity-100 duration-300">
                <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-4 font-body text-sm">
                    <p className="text-zinc-400 dark:text-zinc-500">© 2026 Memvella.</p>
                    <div className="flex gap-8">
                        <a className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all" href="#">Privacy Policy</a>
                        <a className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all" href="#">Terms of Service</a>
                        <a className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all" href="#">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
