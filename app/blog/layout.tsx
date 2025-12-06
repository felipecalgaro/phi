import Link from 'next/link';

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-foreground font-semibold text-lg mb-2">PhiBlog</p>
          <p className="text-muted-foreground text-sm mb-8">
            © {new Date().getFullYear()} PhiBlog. Empowering students on their German education journey.
          </p>
          <div className='flex justify-center items-center gap-x-4 gap-y-2 sm:flex-row flex-col'>
            <Link href="/privacy" className="text-sm text-muted-foreground">
              Privacy Policy
            </Link>
            <p className='text-muted-foreground sm:block hidden'>·</p>
            <Link href="/terms" className="text-sm text-muted-foreground">
              Terms of Service
            </Link>
            <p className='text-muted-foreground sm:block hidden'>·</p>
            <Link href="/contact" className="text-sm text-muted-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
