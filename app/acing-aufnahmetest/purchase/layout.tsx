import { MoveLeft } from 'lucide-react';
import Link from 'next/link';

export default function PaymentResultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='min-h-screen relative w-full flex flex-col justify-start items-center'>
      <header className="h-12 flex items-center sm:px-20 xs:px-8 px-4 gap-3 shrink-0 justify-between max-w-4xl w-full">
        <Link href="/acing-aufnahmetest" className="flex items-center gap-2">
          <MoveLeft className="size-5" />
        </Link>
        <span className="text-sm font-semibold text-foreground tracking-tight">
          Acing Aufnahmetest
        </span>
        <div className='size-5' />
      </header>
      <hr className='border-b border-border w-full' />
      {children}
    </div>
  );
}