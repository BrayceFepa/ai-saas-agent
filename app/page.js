import { Button } from "@/components/ui/button";
import { UserButton } from "@stackframe/stack";
import { PlayCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
// import CyanBg from "cyan-blue-bg.jpg"

export default function Home() {
  return (
    <div
      className="flex justify-center items-center flex-col gap-10 h-screen w-screen"
      style={{
        backgroundImage: "url('/cyan-blue-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div className="flex flex-col gap-5 items-center justify-center text-white">
        <h2 className="text-5xl font-black">Revolutionize Learning With</h2>
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">
          AI-Powered Voice
        </h2>
      </div>
      {/* <Button className="text-xl cursor-pointer"> */}
      <div className="flex flex-col gap-1">
        <Link href="/dashboard">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 cursor-pointer text-white rounded-full p-2 flex items-center justify-center">
            <PlayCircleIcon className="text-4xl" size={50} />
          </div>
        </Link>
        <span className="text-sm text-white">Get Started</span>
      </div>
      {/* </Button> */}
    </div>
  );
}
