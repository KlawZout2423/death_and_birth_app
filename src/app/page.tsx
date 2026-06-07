import { getSession } from "../lib/session";
import Link from "next/link";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-600 rounded-full mb-8">
              <span className="text-3xl font-bold text-white">BDRS</span>
            </div>
            <h1 className="text-5xl font-bold text-blue-900 dark:text-blue-100 mb-6 leading-tight">
              Birth & Death Registration System
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto mb-8 leading-relaxed">
              A secure, government-grade platform for managing vital records. Streamline birth and death registrations with role-based workflows, ensuring accuracy, compliance, and efficiency for authorized personnel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg"
                  >
                    🚀 Access Your Dashboard
                  </Link>
                  <form action="/api/logout" method="post" className="inline">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center px-8 py-4 bg-zinc-600 text-white font-semibold rounded-lg"
                    >
                      🔒 Logout
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg text-lg"
                >
                  🔐 Login to System
                </Link>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-blue-900 dark:text-blue-100 mb-12">
              Why Choose BDRS?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-blue-900">Secure & Compliant</h3>
                <p className="text-zinc-600">
                  End-to-end encryption, role-based access, and compliance with data protection standards. Only authorized personnel can access sensitive records.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-blue-900">Efficient Workflow</h3>
                <p className="text-zinc-600">
                  Streamlined submission, review, and approval process. Registrars submit, officers approve—reducing paperwork and errors.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-blue-900">Official Certificates</h3>
                <p className="text-zinc-600">
                  Generate verifiable birth and death certificates instantly upon approval. Track and manage all records in one place.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-blue-900 dark:text-blue-100 mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">1</div>
                <h4 className="font-semibold mb-2">Login</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Authorized users log in with secure credentials.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">2</div>
                <h4 className="font-semibold mb-2">Submit Records</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Registrars enter birth/death details and upload documents.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">3</div>
                <h4 className="font-semibold mb-2">Review & Approve</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Officers/Registrar General verify and approve records.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">4</div>
                <h4 className="font-semibold mb-2">Issue Certificates</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Approved records generate official certificates.</p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl mb-16">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Trusted by Government Agencies</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-blue-100">Records Processed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">99.9%</div>
                  <div className="text-blue-100">Uptime</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-blue-100">Secure Access</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center text-zinc-500 dark:text-zinc-400">
            <p>&copy; 2026 Birth & Death Registration System. Built for secure and efficient vital record management.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
