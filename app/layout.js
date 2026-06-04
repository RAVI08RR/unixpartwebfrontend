import "./globals.css";
import { ThemeProvider } from "./ThemeContext";
import ToastProvider from "./components/Toast";
import ConfirmProvider from "./components/ConfirmModal";
import PWARegistration from "./components/PWARegistration";

export const metadata = {
  title: "Unixparts Dashboard",
  description: "Internal system for Unixparts inventory and operations",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Unixparts",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/maskable-icon-192x192.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="font-sans antialiased google-sans-regular" suppressHydrationWarning>
        <ThemeProvider>
          <ToastProvider>
            <ConfirmProvider>
              <PWARegistration />
              {children}
            </ConfirmProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
