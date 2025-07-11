"use client";

export default function SuccessPage() {
  return (
    <main className="h-screen flex items-center justify-center bg-white font-sans">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          Report Submitted
        </h1>
        <p className="text-sm mb-6">
          Thank you for your submission. We will look into the matter.
        </p>
        <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-full">
          Back to Home
        </a>
      </div>
    </main>
  );
}
