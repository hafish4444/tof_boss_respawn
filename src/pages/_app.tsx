import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useAnalytics } from '@happykit/analytics';

export default function App({ Component, pageProps }: AppProps) {
  // Track page views
  useAnalytics({ publicKey: "analytics_pub_2e5826eb38" })
  return <Component {...pageProps} />
}
