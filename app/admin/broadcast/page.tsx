import { BroadcastEmailForm } from "@/components/admin/broadcast-email-form";
import { NO_INDEX_NO_FOLLOW } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Broadcast Email",
  description: "Private admin broadcast email tool.",
  robots: NO_INDEX_NO_FOLLOW,
};

export default async function BroadcastPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 lg:px-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Admin tools
          </p>
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Broadcast email
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Send a private HTML email to all BASIC or PREMIUM users from a simple server-side form.
          </p>
        </div>

        <section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <BroadcastEmailForm />
        </section>
      </div>
    </main>
  );
}
