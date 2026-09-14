"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/authClient";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  // Ambil User session Better-auth
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const userRole = user?.role || "USER";

  // Close dropdown if clicked outside it
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown when route changed
  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
          router.refresh();
        },
      },
    });
  };

  // Navigation links array
  const navLinks = [{ name: "Home", href: "/" }];

  const roleBadgeStyles: Record<string, string> = {
    AUTHOR: "bg-purple-100 text-purple-700 border border-purple-200", // Ungu untuk Author
    USER: "bg-blue-100 text-blue-700 border border-blue-200", // Biru untuk User biasa
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Brand */}
          <div className="flex shrink-0">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Daily Hot News
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8 ml-auto mr-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-300 py-2 ${
                    isActive
                      ? "font-semibold text-blue-600 border-b-2 border-blue-600 pb-2"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* User Auth section for Desktop */}
          <div className="hidden md:flex items-center">
            {isPending ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              /* Logged In: Profile Picture + Dropdown */
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
                  aria-expanded={isUserMenuOpen}
                >
                  {/* Profile Pic or Fallback (initials) */}
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "User Avatar"}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                      {user.name ? user.name.charAt(0) : "U"}
                    </div>
                  )}
                  {/* Dropdown Icon */}
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black/5 py-1 z-50 divide-y divide-gray-100">
                    {/* User & Role */}
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate mb-1">
                        {user.email}
                      </p>
                      {/* Badge Role */}
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full ${
                          roleBadgeStyles[userRole] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {userRole}
                      </span>
                    </div>
                    {/* Menu Item Links */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-gray-900 transition-colors"
                      >
                        Profil Akun
                      </Link>
                      {/* Exclusive menu for AUTHOR role */}
                      {userRole === "AUTHOR" && (
                        <div>
                          <Link
                            href="/articles/create"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-gray-900 transition-colors"
                          >
                            Tulis Artikel Baru
                          </Link>
                          <Link
                            href={`/authors/${user.id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-gray-900 transition-colors"
                          >
                            Author Dashboard
                          </Link>
                        </div>
                      )}
                    </div>
                    {/* Logout Button*/}
                    <div className="py-1">
                      <button
                        onClick={handleSignOut}
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Not Logged In: Show Log In Button */
              <Link
                href="/sign-in"
                className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-50 border-t border-gray-200 px-4 pt-3 pb-5 space-y-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-gray-100 hover:text-blue-600 ${
                  isActive
                    ? "bg-blue-50 font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          {/* User Profile on Mobile Drawer */}
          <div className="pt-3 border-t border-gray-200">
            {user ? (
              <div className="space-y-2 ">
                <div className="flex items-center gap-3 px-3 py-2">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {user.name ? user.name.charAt(0) : "U"}
                    </div>
                  )}
                  <div>
                    <p className="px-1 text-sm font-semibold text-gray-900">
                      {user.name}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full ${
                        roleBadgeStyles[userRole] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {userRole}
                    </span>
                  </div>
                </div>
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profil Akun
                  </Link>
                  {userRole === "AUTHOR" && (
                    <div>
                      <Link
                        href="/articles/create"
                        className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Tulis Artikel Baru
                      </Link>
                      <Link
                        href={`/authors/${user.id}`}
                        className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Author Dashboard
                      </Link>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="border-t border-gray-200 w-full text-left pt-5 px-3 text-sm text-red-600 hover:bg-red-50 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="block text-center bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
