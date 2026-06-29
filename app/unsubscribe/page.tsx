import { unsubscribeFromMarketing } from "@/actions/unsubscribe-from-marketing";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

type UnsubscribePageProps = {
  searchParams: Promise<{
    status?: string;
    token?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Unsubscribe from Guide to Studienkolleg marketing emails.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UnsubscribePage({
  searchParams,
}: UnsubscribePageProps) {
  const { status, token } = await searchParams;
  const tokenValue = typeof token === "string" ? token : "";
  const isSuccess = status === "success";
  const isRateLimited = status === "rate-limited";
  const isError = status === "error";
  const isInvalid = status === "invalid" || tokenValue.length === 0;

  return (
    <main className="min-h-screen bg-background px-6 py-16 lg:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-xl items-center">
        <div className="w-full space-y-8 rounded-lg border bg-card p-6 shadow-sm sm:p-8">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Email preferences
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {isSuccess
                ? "You are unsubscribed"
                : isRateLimited
                  ? "Please try again later"
                  : isError
                    ? "Something went wrong"
                    : "Unsubscribe from marketing emails"}
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              {isSuccess
                ? "You will no longer receive broadcast marketing emails from Guide to Studienkolleg."
                : isRateLimited
                  ? "Too many unsubscribe attempts were made. Please wait a moment and try again."
                  : isError
                    ? "We could not update your email preferences right now. Please try again later."
                    : isInvalid
                      ? "This unsubscribe link is missing, invalid, or expired."
                      : "Confirm that you no longer want to receive broadcast marketing emails from Guide to Studienkolleg."}
            </p>
          </div>

          {isSuccess ? (
            <Link className={cn(buttonVariants())} href="/">
              Return home
            </Link>
          ) : isInvalid || isRateLimited || isError ? (
            null
          ) : (
            <form action={unsubscribeFromMarketing} className="space-y-5">
              <input type="hidden" name="token" value={tokenValue} />
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit">Unsubscribe</Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
