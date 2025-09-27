import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Restaurant Recommendations - Find Your Perfect Dining Experience',
  description: 'Discover amazing restaurants in Riyadh with our AI-powered recommendation system. Search by cuisine, price, events, and more.',
  keywords: 'restaurants, Riyadh, dining, food, recommendations, cuisine',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
