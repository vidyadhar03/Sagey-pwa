import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold">Sagey</h1>
      <button className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
        Get Started
      </button>
    </div>
  );
}
