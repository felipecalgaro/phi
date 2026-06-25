import "server-only";

import type {
  EmailOptions,
  EmailRepository,
} from "@/repositories/email-repository";

export class EmailService {
  constructor(private readonly emailRepository: EmailRepository) {}

  async sendEmail(emailOptions: EmailOptions): Promise<void> {
    await this.emailRepository.send(emailOptions);
  }
}
