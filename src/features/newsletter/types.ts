export interface NewsletterSubscriber {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
}
