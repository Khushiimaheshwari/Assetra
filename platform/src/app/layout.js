"use client";
import { usePathname } from "next/navigation";
import Providers from "./providers";
import Navbar from "./components/navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const hideNavbarRoutes = ["/login", "/signup", "/onboarding", "/unauthorized", "/redirectAfterLogin", "/qrRedirect"];

  const isAdminRoute = pathname.startsWith("/adminPanel");
  const isLabTechnicianRoute = pathname.startsWith("/lab_technicianPanel");
  const isFacultyRoute = pathname.startsWith("/facultyPanel");

  const shouldHideNavbar =
    hideNavbarRoutes.includes(pathname) ||
    isAdminRoute ||
    isLabTechnicianRoute ||
    isFacultyRoute;

  return (
    <html lang="en">
      <body> 
        <Providers>
          {!shouldHideNavbar && <Navbar />}
          {children}
          <ToastContainer position="top-right" autoClose={3000} pauseOnHover />
        </Providers>
      </body>
    </html>
  );
}
