import { NewsletterSubscriber } from "./types";

export async function getDummySubscribers(): Promise<NewsletterSubscriber[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: "cuid-001",
      email: "budi.santoso@example.com",
      isActive: true,
      subscribedAt: new Date("2024-01-15T08:30:00Z"),
      unsubscribedAt: null,
    },
    {
      id: "cuid-002",
      email: "siti.aminah@example.com",
      isActive: true,
      subscribedAt: new Date("2024-02-10T14:45:00Z"),
      unsubscribedAt: null,
    },
    {
      id: "cuid-003",
      email: "joko.widodo@example.com",
      isActive: false,
      subscribedAt: new Date("2024-03-05T09:15:00Z"),
      unsubscribedAt: new Date("2024-05-20T10:00:00Z"),
    },
    {
      id: "cuid-004",
      email: "rachel.vennya@example.com",
      isActive: true,
      subscribedAt: new Date("2024-04-12T11:20:00Z"),
      unsubscribedAt: null,
    },
    {
      id: "cuid-005",
      email: "ahmad.dhani@example.com",
      isActive: false,
      subscribedAt: new Date("2024-05-01T16:05:00Z"),
      unsubscribedAt: new Date("2024-06-15T08:30:00Z"),
    },
    {
      id: "cuid-006",
      email: "lisa.blackpink@example.com",
      isActive: true,
      subscribedAt: new Date("2024-06-20T13:40:00Z"),
      unsubscribedAt: null,
    },
    {
      id: "cuid-007",
      email: "deddy.corbuzier@example.com",
      isActive: true,
      subscribedAt: new Date("2024-07-08T07:50:00Z"),
      unsubscribedAt: null,
    },
    {
      id: "cuid-008",
      email: "raditya.dika@example.com",
      isActive: true,
      subscribedAt: new Date("2024-08-14T19:25:00Z"),
      unsubscribedAt: null,
    },
    {
      id: "cuid-009",
      email: "agnes.mo@example.com",
      isActive: false,
      subscribedAt: new Date("2024-09-02T10:10:00Z"),
      unsubscribedAt: new Date("2024-09-10T15:00:00Z"),
    },
    {
      id: "cuid-010",
      email: "raffi.ahmad@example.com",
      isActive: true,
      subscribedAt: new Date("2024-09-11T08:00:00Z"),
      unsubscribedAt: null,
    },
  ];
}
