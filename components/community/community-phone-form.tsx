"use client";

import { savePhoneNumber } from "@/actions/community/save-phone-number";
import { PhoneInput } from "@/components/reui/phone-input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

type CommunityPhoneFormProps = {
  initialPhoneNumber: string | null;
};

export function CommunityPhoneForm({
  initialPhoneNumber,
}: CommunityPhoneFormProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber ?? "");
  const savePhoneNumberMutation = useMutation({
    mutationFn: async (submittedPhoneNumber: string) => {
      return savePhoneNumber({
        phoneNumber: submittedPhoneNumber,
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Phone number saved. You can join the community now.");
      } else {
        toast.error(result.error);
      }

      return result;
    },
    onError: () => {
      toast.error("Something went wrong while saving your phone number.");
    },
  });

  const savedPhoneNumber =
    savePhoneNumberMutation.data?.success
      ? savePhoneNumberMutation.data.data?.phoneNumber ?? ""
      : initialPhoneNumber ?? "";
  const trimmedPhoneNumber = phoneNumber.trim();
  const canSave = trimmedPhoneNumber.length > 0 && !savePhoneNumberMutation.isPending;
  const canJoin =
    savedPhoneNumber.trim().length > 0 && savedPhoneNumber === phoneNumber;

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          savePhoneNumberMutation.mutate(phoneNumber);
        }}
        className="text-left space-y-3"
      >
        <Label htmlFor="phone" className="text-sm font-medium">
          Your WhatsApp
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <PhoneInput
            id="phone"
            value={phoneNumber}
            onChange={(value) => setPhoneNumber(value.toString())}
            defaultCountry="DE"
            international
            placeholder="+49 170 1234567"
            className="min-w-0 flex-1"
            inputMode="tel"
            disabled={savePhoneNumberMutation.isPending}
          />
          <Button
            type="submit"
            disabled={!canSave}
            className="h-12 px-5 font-medium sm:h-9 sm:self-end bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
          >
            {savePhoneNumberMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>

      {canJoin ? (
        <Link className={cn(buttonVariants(), "w-full mt-5 rounded-full h-12 bg-foreground text-background hover:bg-foreground/90 font-medium")} target="_blank" href="https://chat.whatsapp.com/LKgcSHx5aQB744gULUSs5d?s=sh&p=a&ilr=2&amv=2">Join community</Link>
      ) : (
        <Button
          disabled
          className="w-full mt-5 rounded-full h-12 bg-foreground text-background hover:bg-foreground/90 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Join community
        </Button>
      )}
    </>
  );
}
