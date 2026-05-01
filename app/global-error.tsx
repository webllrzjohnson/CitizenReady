'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#F7F7F7] p-4 font-sans">
        <main className="card w-full max-w-md p-8 text-center">
          <h1 className="mb-3 text-2xl font-bold text-gray-900">Something went wrong</h1>
          {error?.digest && (
            <p className="mb-4 font-mono text-xs text-gray-400">Error ID: {error.digest}</p>
          )}
          <p className="mb-6 text-gray-600">
            An unexpected error occurred. Please try again or reload the page.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-full bg-[#E8192C] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#C41020] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8192C]"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
