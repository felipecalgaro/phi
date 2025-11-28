import { cn } from '@/lib/utils';
import { Check, MoveRight } from "lucide-react";
import Link from 'next/link';

export default function Home() {
  const benefits = [
    "Direct WhatsApp support for questions, documents, problems, and decisions",
    "Access to weekly materials covering each step: application, Aufnahmetest, visa, housing, insurance, German life",
    "Deadline alerts for your Studienkolleg(s)",
  ];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-b from-indigo-950 to-sky-950 px-8 max-[320px]:px-2 py-24 lg:px-12">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex xl:flex-nowrap flex-wrap justify-center items-center xl:max-w-7xl max-w-3xl gap-x-16 gap-y-24">
        {/* Left Column: Heading & Subheading */}
        <div className="flex flex-col justify-center space-y-2">

          <h1 className="animate-fade-in max-[400px]:text-4xl max-[320px]:text-3xl text-5xl font-black tracking-tight text-white drop-shadow-lg sm:text-7xl lg:text-8xl w-min">
            Your Guide to
            <span className="block w-min bg-linear-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent lg:h-28 sm:h-20 h-16 max-[320px]:h-12">
              Studienkolleg
            </span>
          </h1>

          <p className="animate-fade-in-delay-1 text-xl text-white/90 drop-shadow-md sm:text-3xl sm:max-w-lg">
            Tailor-made support from a former Studienkolleg student.
          </p>

          {/* CTA Button */}
          <div className="animate-fade-in-delay-3 mt-16 flex justify-start items-center sm:w-auto w-60">
            <Link href="https://docs.google.com/forms/d/e/1FAIpQLSfHAg5p9clAxRhXVQg98FL6Frb7ZFZuxfRPjgM3z7VTl2T1Ng/viewform" className={cn("sm:text-xl text-lg font-bold shadow-button hover:shadow-glow transition-all bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 sm:py-4 py-3")}>
              Apply Now
              <MoveRight className="ml-4 inline-block size-8" />
            </Link>
          </div>
        </div>

        {/* Right Column: Value Section, CTA, Trust Line */}
        <div className="flex flex-col justify-center space-y-8 xl:max-w-lg max-w-2xl">
          {/* Value Section */}
          <div className="animate-fade-in-delay-2 rounded-3xl bg-gradient-card max-[360px]:px-6 px-10 py-10 shadow-glow backdrop-blur-sm border border-white/20 bg-white/5 text-white">
            <h2 className="mb-8 max-[360px]:text-2xl text-3xl font-bold flex items-center gap-3">
              All you need for your STK admission
            </h2>

            {/* Benefits List */}
            <ul className="space-y-6 text-left">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start max-[320px]:gap-3 gap-4">
                  <div className="mt-0.5 flex max-[320px]:size-6 size-7 shrink-0 items-center justify-center max-[320px]:rounded-md rounded-lg bg-linear-to-r from-orange-500 to-orange-600 shadow-button">
                    <Check className="max-[320px]:size-4 size-5 text-white font-bold" />
                  </div>
                  <span className="text-lg leading-relaxed font-medium">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust Line */}
          <p className="animate-fade-in-delay-3 text-lg leading-relaxed text-white/90 font-medium drop-shadow-md backdrop-blur-sm rounded-2xl bg-white/5 p-6 border border-white/10">
            From someone who already lived the entire Studienkolleg admission process and is now
            living in Germany — making your admission to Studienkolleg as easy and secure as it can
            be.
          </p>
        </div>
      </div>
    </main>
  );
}
