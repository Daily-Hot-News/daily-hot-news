import { getDummySubscribers } from "@/features/newsletter/queries";
import { SubscriberList } from "@/features/newsletter/components/SubscriberList";

export const metadata = {
  title: "Newsletter Subscribers",
  description: "Manage newsletter subscribers",
};

export default async function NewslettersPage() {
  const subscribers = await getDummySubscribers();

  return (
    <main className="min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Newsletter Subscribers</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Kelola daftar email yang berlangganan newsletter harian.
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Dashboard Cards (Optional but adds to the premium feel) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">Total Subscribers</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{subscribers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">Active Subscribers</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {subscribers.filter(s => s.isActive).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">Unsubscribed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {subscribers.filter(s => !s.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">All Subscribers</h2>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg leading-5 bg-white dark:bg-neutral-800 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" 
                placeholder="Search emails..." 
              />
            </div>
          </div>
          
          <div className="p-0">
             <SubscriberList subscribers={subscribers} />
          </div>
        </div>
      </div>
    </main>
  );
}
