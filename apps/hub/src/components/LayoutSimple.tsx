import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

/**
 * Simplified layout component with top navigation only
 * Using Tailwind CSS - matching legacy landing page design
 */
function LayoutSimple() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default LayoutSimple;
