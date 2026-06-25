import "server-only";

import { resend } from "@/lib/resend";
import {
  EmailRepository,
  type EmailOptions,
} from "@/repositories/email-repository";

export class ResendEmailRepository extends EmailRepository {
  async send(emailOptions: EmailOptions): Promise<void> {
    await resend.emails.send(emailOptions);
  }
}
