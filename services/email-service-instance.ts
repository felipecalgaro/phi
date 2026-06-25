import "server-only";

import { ResendEmailRepository } from "@/repositories/resend-email-repository";
import { EmailService } from "@/services/email-service";

export const emailService = new EmailService(new ResendEmailRepository());
