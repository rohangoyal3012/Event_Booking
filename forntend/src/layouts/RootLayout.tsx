import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { Toaster } from "react-hot-toast";
import { TOAST_DURATION } from "@/utils/constants";

export default function RootLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="mt-20 border-t border-gray-100 bg-white py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} EventBook. All rights reserved.
      </footer>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: TOAST_DURATION,
          style: { fontSize: "14px", maxWidth: "380px" },
        }}
      />
    </>
  );
}
