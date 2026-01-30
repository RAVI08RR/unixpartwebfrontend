import "./globals.css";
import { ThemeProvider } from "./ThemeContext";

export const metadata = {
  title: "Unixparts Dashboard",
  description: "Internal system for Unixparts inventory and operations",
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
      <body className="font-sans antialiased google-sans-regular">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
