"use client";

import { sendBroadcastEmail } from "@/actions/admin/send-broadcast-email";
import type { BroadcastEmailActionState } from "@/actions/admin/send-broadcast-email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

const recipientRoles = ["BASIC", "PREMIUM"] as const;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? "Sending..." : "Send broadcast"}
    </Button>
  );
}

export function BroadcastEmailForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    sendBroadcastEmail,
    null as BroadcastEmailActionState | null,
  );

  useEffect(function () {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="recipientRole">Recipient role</Label>
          <select
            id="recipientRole"
            name="recipientRole"
            defaultValue="BASIC"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            {recipientRoles.map(function (role) {
              return (
                <option key={role} value={role}>
                  {role}
                </option>
              );
            })}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            name="subject"
            placeholder="Enter the email subject"
            maxLength={120}
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="htmlBody">HTML body</Label>
        <Textarea
          id="htmlBody"
          name="htmlBody"
          placeholder="<p>Write your HTML email body here.</p>"
          className="min-h-56 font-mono text-sm"
        />
      </div>

      {state ? (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            state.success
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          {state.success ? (
            <p>
              Broadcast sent to {state.sentCount} recipient{state.sentCount === 1 ? "" : "s"}.
            </p>
          ) : (
            <p>{state.error}</p>
          )}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Each recipient gets an individual email for privacy.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}