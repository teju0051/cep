import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import BootstrapClient from "./components/BootstrapClient";

export const metadata = {
  title: "Seema Laundry Services",
  description:
    "Fresh clothes, hassle free. Premium cleaning and fast delivery at your doorstep.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body className="bg-white m-0 p-0 overflow-x-hidden">
        <BootstrapClient />
        <main className="w-100 min-vh-100">{children}</main>
      </body>
    </html>
  );
}
