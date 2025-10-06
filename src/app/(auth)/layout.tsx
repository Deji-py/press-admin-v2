import Image from "next/image";
import React, { ReactNode } from "react";
import logo_full from "@/../public/branding/logo_full.svg";

function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-[26rem] flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <Image src={logo_full} alt="logo" className="w-28" />
        </a>
        {children}
      </div>
    </div>
  );
}

export default AppLayout;
