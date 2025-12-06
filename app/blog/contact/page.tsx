import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>
      <div className="flex justify-center items-center flex-col px-4 sm:px-6 lg:px-8 py-16 w-full gap-24">
        <div className="text-center flex flex-col justify-center items-center gap-12">
          <h1 className="text-6xl font-bold text-foreground">Contact</h1>
          <p className="text-muted-foreground">
            Have any questions? Reach out and I&apos;ll be happy to help.
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg py-16 text-center max-w-3xl w-full">
          <Mail className="w-12 h-12 mx-auto mb-6 text-primary" />
          <p className="text-muted-foreground mb-2">Get in touch via email</p>
          <a
            href="mailto:contact@phi.com"
            className="text-2xl font-semibold text-foreground hover:text-primary transition-colors"
          >
            contact@phi.com
          </a>
        </div>
      </div>
    </div>
  );
};