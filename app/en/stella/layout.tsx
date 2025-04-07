import Image from "next/image";
import UVLogo from "@/public/Voho.svg";
import { ReactNode } from "react";

type StellaLayoutProps = {
  children: ReactNode;
};

const StellaLayout = ({ children }: StellaLayoutProps) => {
  return (
    <section className="w-full h-full">
      <header className="bg-[#121212]">
        <div className="flex mx-auto items-center justify-between max-w-6xl">
          <Image src={UVLogo} alt="Voho logo and wordmark" width={140} />
          <a href="https://cal.com/voho-ai/15min">
            <button className="hover:bg-gray-700 px-6 py-2 border-2 border-white rounded-full text-white w-40 mb-2">
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
