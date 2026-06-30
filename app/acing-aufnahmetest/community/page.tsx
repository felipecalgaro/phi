import { Header } from '@/components/header';
import { CommunityPhoneForm } from '@/components/community/community-phone-form';
import { verifySession } from '@/lib/dal';
import prisma from '@/lib/prisma';
import { NO_INDEX_NO_FOLLOW } from '@/lib/seo';
import { MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: "STK Community",
  description: "Private Studienkolleg community access page for course members.",
  robots: NO_INDEX_NO_FOLLOW,
};

async function getCommunityUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      phoneNumber: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return user;
}

export default async function Community() {
  const { userId, userRole } = await verifySession();

  if (userRole === 'BASIC') {
    redirect("/login?redirect=purchase");
  }

  if (!userId) {
    redirect("/login");
  }

  const user = await getCommunityUser(userId);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className='px-6 pt-32 pb-12 h-full flex justify-center items-center'>
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-(--shadow-accent) text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5" style={{ background: "var(--gradient-accent)" }}>
              <MessageCircle className="w-7 h-7 text-foreground" />
            </div>

            <h1 className="text-3xl font-semibold mb-2">STK Community</h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              A space for future Studienkolleg students to share experiences, ask questions, and support each other through the application journey.
            </p>

            <CommunityPhoneForm initialPhoneNumber={user.phoneNumber} />
          </div>
        </div>
      </div>
    </main>
  );
}
