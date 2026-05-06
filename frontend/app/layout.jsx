import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider} from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Toaster } from "@/components/ui/sonner"
import { dark } from '@clerk/ui/themes';

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata = {
  title: 'ArchGen - AI Project Architect',
  description: 'Generate project architectures with AI',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ClerkProvider appearance={{theme: dark,}}>
          {children}
          <Analytics />
        </ClerkProvider>
        <Toaster/>
      </body>
    </html>
  )
}
