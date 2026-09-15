import { NewsletterSubscriber } from "../types";

export function SubscriberList({
  subscribers,
}: {
  subscribers: NewsletterSubscriber[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
      <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-800">
          <tr>
            <th scope="col" className="px-6 py-4 font-semibold">
              Email
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              Status
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              Subscribed At
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              Unsubscribed At
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
          {subscribers.map((subscriber) => (
            <tr
              key={subscriber.id}
              className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                {subscriber.email}
              </td>
              <td className="px-6 py-4">
                {subscriber.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
                    Unsubscribed
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                {new Date(subscriber.subscribedAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                {subscriber.unsubscribedAt ? (
                  new Date(subscriber.unsubscribedAt).toLocaleDateString(
                    "id-ID",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )
                ) : (
                  <span className="text-gray-300 dark:text-gray-600">-</span>
                )}
              </td>
            </tr>
          ))}
          {subscribers.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
              >
                <div className="flex flex-col items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p>Belum ada subscriber.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
