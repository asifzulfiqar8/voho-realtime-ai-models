import Image from "next/image";
import UVLogo from "@/public/Voho.svg";
import { ReactNode } from "react";

type StellaLayoutProps = {
  children: ReactNode;
};

const StellaLayout = ({ children }: StellaLayoutProps) => {
  return (
    <section className="w-full h-full">
      <header className="bg-[#f6f8fc]">
        <div className="flex mx-auto items-center justify-between max-w-6xl py-4">
          <Image src={UVLogo} alt="Voho logo and wordmark" width={140} />
          <a href="https://cal.com/voho-ai/15min">
            <button className="hover:bg-[#5c6bc0] px-6 py-2 border-2 border-[#5c6bc0] rounded-full text-[#5c6bc0] hover:text-white transition-all duration-150 w-40 mb-2">
              Get In Touch
            </button>
          </a>
        </div>
      </header>
      <main>{children}</main>
    </section>
  );
};

export default StellaLayout;
