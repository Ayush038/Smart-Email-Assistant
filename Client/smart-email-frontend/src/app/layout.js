import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="app-root">
        <AuthProvider>

          <div className="app-scroll scrollbar-glass">
            {children}
          </div>

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1f1f1f",
                color: "#fff",
                border: "1px solid #333",
              },
            }}
          />

        </AuthProvider>
      </body>
    </html>
  );
}