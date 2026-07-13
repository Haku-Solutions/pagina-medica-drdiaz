import Image from "next/image"; 

export default function Card({
  imageSrc,
  imageAlt,
  title,
  description,
}: {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="w-72 h-100 rounded-2xl overflow-hidden shadow-md bg-[#A7C7E7] flex flex-col">
      <div className="relative h-[80%] w-full">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
        />
      </div>

      <div className="h-[30%] w-full flex flex-col justify-center px-4">
        <h3 className="text-l font-bold text-[##01000b] text-center ">
          {title}
        </h3>
        {description && (
          <p className="text-xs italic text-[#1C2B48] mt-1.5">{description}</p>
        )}
      </div>
    </div>
  );
}