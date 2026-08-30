"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Card.module.css";

interface CardProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description?: string;

  backTitle: string;
  backItems: string[];
}

export default function Card({
  imageSrc,
  imageAlt,
  title,
  description,
  backTitle,
  backItems,
}: CardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`${styles.scene} w-full max-w-[280px] aspect-[3/4] cursor-pointer`}
      onClick={() => setFlipped((prev) => !prev)}
    >
      <div
        className={styles.flipper}
        style={{
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* FRONT */}
        <div
          className={`${styles.face} rounded-2xl overflow-hidden shadow-md bg-[#A7C7E7] flex flex-col`}
        >
          <div className="relative h-[70%] w-full">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(min-width: 640px) 280px, 90vw"
              className="object-cover"
            />
          </div>

          <div className="flex h-[30%] flex-col justify-center px-4">
            <h3 className="text-center text-lg font-bold text-[#FFFFFF]">
              {title}
            </h3>

            {description && (
              <p className="mt-2 text-center text-xs italic text-[#1C2B48]">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* BACK */}
        <div
          className={`${styles.face} ${styles.back} rounded-2xl shadow-md bg-[#A7C7E7]`}
        >
          <div className="flex h-full flex-col justify-center p-6">
            <h2 className="mb-4 text-center text-lg font-bold text-[#FFFFFF]">
              {backTitle}
            </h2>

            <ul className="list-disc space-y-2 pl-5 text-sm text-[#1C2B48]">
              {backItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}