"use client";

import {
  sendBroadcastEmail,
  type BroadcastEmailRequest,
} from "@/actions/admin/send-broadcast-email";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

const recipientRoles = ["BASIC", "PREMIUM", "ADMIN"] as const;
type RecipientRole = (typeof recipientRoles)[number];

export function BroadcastEmailForm() {
  const [recipientRole, setRecipientRole] = useState<RecipientRole>("BASIC");
  const [
    sendToMarketingSubscribersOnly,
    setSendToMarketingSubscribersOnly,
  ] = useState(true);
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const sendBroadcastEmailMutation = useMutation({
    mutationFn: async (request: BroadcastEmailRequest) => {
      return sendBroadcastEmail(request);
    },
    onSuccess: (result) => {
      if (result.success) {
        setRecipientRole("BASIC");
        setSendToMarketingSubscribersOnly(true);
        setSubject("");
        setHtmlBody("");
      }

      return result;
    },
  });

  const result = sendBroadcastEmailMutation.data;
  const sentCount = result?.success ? result.data?.sentCount ?? 0 : 0;
  const canSubmit =
    subject.trim().length > 0 &&
    htmlBody.trim().length > 0 &&
    !sendBroadcastEmailMutation.isPending;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        sendBroadcastEmailMutation.mutate({
          recipientRole,
          sendToMarketingSubscribersOnly,
          subject,
          htmlBody,
        });
      }}
      className="space-y-6"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="recipientRole">Recipient role</Label>
          <select
            id="recipientRole"
            name="recipientRole"
            value={recipientRole}
            onChange={(event) => {
              setRecipientRole(event.target.value as RecipientRole);
            }}
            disabled={sendBroadcastEmailMutation.isPending}
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
            value={subject}
            onChange={(event) => {
              setSubject(event.target.value);
            }}
            placeholder="Enter the email subject"
            maxLength={120}
            className="h-10"
            disabled={sendBroadcastEmailMutation.isPending}
          />
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-border px-4 py-3">
        <Checkbox
          id="sendToMarketingSubscribersOnly"
          checked={sendToMarketingSubscribersOnly}
          onCheckedChange={(checked) => {
            setSendToMarketingSubscribersOnly(checked === true);
          }}
          disabled={sendBroadcastEmailMutation.isPending}
          className="mt-0.5"
        />
        <div className="space-y-1">
          <Label
            htmlFor="sendToMarketingSubscribersOnly"
            className="text-sm font-medium leading-none"
          >
            Send only to marketing subscribers
          </Label>
          <p className="text-sm text-muted-foreground">
            Uncheck to send to everyone with the selected role.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="htmlBody">HTML body</Label>
        <Textarea
          id="htmlBody"
          name="htmlBody"
          value={htmlBody}
          onChange={(event) => {
            setHtmlBody(event.target.value);
          }}
          placeholder="<p>Write your HTML email body here.</p>"
          className="min-h-56 font-mono text-sm"
          disabled={sendBroadcastEmailMutation.isPending}
        />
      </div>

      {result ? (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            result.success
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          {result.success ? (
            <p>
              Broadcast sent to {sentCount} recipient{sentCount === 1 ? "" : "s"}.
            </p>
          ) : (
            <p>{result.error}</p>
          )}
        </div>
      ) : null}

      {sendBroadcastEmailMutation.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Something went wrong while sending the broadcast.
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Each recipient gets an individual email for privacy.
        </p>
        <Button type="submit" className="w-full sm:w-auto" disabled={!canSubmit}>
          {sendBroadcastEmailMutation.isPending ? "Sending..." : "Send broadcast"}
        </Button>
      </div>
    </form>
  );
}
