export type EmailRecipient = string | string[];

type EmailBody =
  | {
      html: string;
      text?: string;
    }
  | {
      html?: string;
      text: string;
    };

export type EmailOptions = EmailBody & {
  from: string;
  to: EmailRecipient;
  subject: string;
};

export abstract class EmailRepository {
  abstract send(emailOptions: EmailOptions): Promise<void>;
}
