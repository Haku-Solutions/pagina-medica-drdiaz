"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Card.module.css";

export default function Card({
  imageSrc,
  imageAlt,
  title,
  description,
  back_description,
}: {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description?: string;
  back_description?: string;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`${styles.scene} w-72 h-96`}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={styles.flipper}
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* FRONT */}
        <div
          className={`${styles.face} rounded-2xl overflow-hidden shadow-md bg-[#A7C7E7] flex flex-col`}
        >
          <div className="relative h-[70%] w-full">
            <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
          </div>

          <div className="h-[30%] w-full flex flex-col justify-center px-4">
            <h3 className="text-l font-bold text-[#01000b] text-center">
              {title}
            </h3>
            {description && (
              <p className="text-xs italic text-[#1C2B48] mt-1.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* BACK */}
        <div
          className={`${styles.face} ${styles.back} rounded-2xl shadow-md bg-[#A7C7E7] flex items-center justify-center px-6 text-center`}
        >
          <p className="text-sm text-[#1C2B48]">{back_description}</p>
        </div>
      </div>
    </div>
  );
}