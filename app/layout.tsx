// tani-link/app/layout.tsx
import Navbar from '@/components/Navbar'; // Import Navbar yang baru dibuat
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-gray-50">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
