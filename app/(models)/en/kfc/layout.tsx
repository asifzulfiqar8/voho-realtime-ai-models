import { ReactNode } from "react";

type KfcLayoutProps = {
  children: ReactNode;
};

const KfcLayout = ({ children }: KfcLayoutProps) => {
  return (
    <div className="w-full bg-[#1b0b21] text-white relative">
      <header className="flex justify-between items-center px-6 py-4 bg-white">
        <div className="text-2xl text-red-600 font-bold">KFC</div>
        <button className="bg-red-600 px-4 py-2 rounded text-white">
          Join our Waitlist
        </button>
      </header>
      {children}
      <footer className="w-full p-4 text-center text-sm text-gray-400 bg-[#2d0f2e]">
        &copy; 2025 KFC Demo. Powered by Voho.ai.
      </footer>
    </div>
  );
};

export default KfcLayout;
