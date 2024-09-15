import Image from "next/image";
import localFont from "next/font/local";
import styles from "../styles/homepage.module.scss"
import FriendsIcon from "@/icons/friends";

import { useState } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {

  const [showModal, setShowModal] = useState(false);
  return (<>
    <div class={`${styles["header"]} w-screen h-screen bg-[#ede9e6] overflow-y-auto`}>
    <div class="flex flex-col justify-center py-12">
        <div class="self-center items-center flex flex-col sm:flex-row w-full md:w-5/6 px-4 sm:px-0">
            <div class="w-full text-center sm:text-left sm:w-1/3 py-12 sm:px-8">
                <h1 class="tracking-wide text-[#5a6087] text-2xl mb-6 font-bold">introducing</h1>
                <h2 class="font-bold tracking-widest text-4xl mb-6">THALAMUS</h2>
                {/* <span class={`${styles["content__container"]} block font-light text-browngray text-2xl my-6`}>
                    <ul class={`${styles["content__container__list"]}`}>
                        <li class={`${styles["content__container__list__item"]}`}>Mixtral</li>
                        <li class={`${styles["content__container__list__item"]}`}>Dolphin</li>
                        <li class={`${styles["content__container__list__item"]}`}>LLAMA Default</li>
                        <li class={`${styles["content__container__list__item"]}`}>GPT-4o</li>
                        <li class={`${styles["content__container__list__item"]}`}>Claude 3.5 Sonnet</li>
                        <li class={`${styles["content__container__list__item"]}`}>Gemini 1.5 Pro</li>
                        <li class={`${styles["content__container__list__item"]}`}>Custom Agents</li>
                    </ul>
                </span> */}
                <p class="tracking-widest text-4xl">The Brain Behind Sustainable AI
                </p>
            </div>
            <div class="w-full sm:w-2/3">
                <FriendsIcon />
            </div>
        </div>
    </div>
    <div class="absolute bottom-20 w-full flex items-center justify-center">
        <button class="px-10 py-2 text-gray-200 bg-[#5a6087] rounded-full shadow-md text-lg hover:bg-gray-800 hover:border-red"
          onClick={() => {
              setShowModal(true);
            }
          }
        >Get Started</button>
    </div>
</div>
    {showModal && (
    <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center" 
      onClick={() => {
        setShowModal(false);
      }}
    >
        <div class="bg-white p-12 rounded-lg">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Get Started</h2>
            <p class="text-gray-600 mb-10">What would you like to prioritize?</p>
            <button className="bg-[#5a6087] text-gray-200 px-4 py-2 mr-8 rounded-full shadow-md text-lg hover:bg-gray-800 hover:border-red"
              onClick={() => {
                window.location.replace("/chat?option=performance");
              }}
            >Performance</button>
            <button className="bg-[#5a6087] text-gray-200 px-4 py-2 ml-8 rounded-full shadow-md text-lg hover:bg-gray-800 hover:border-red"
              onClick={() => {
                window.location.replace("/chat?option=efficiency");
              }}
            >Efficiency</button>
        </div>     
    </div>)}
</>
  );
}
