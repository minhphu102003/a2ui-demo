"use client";

import { useRouter } from "next/navigation";

interface CourseCardProps {
  title: string;
  instructor: string;
  thumbnail: string;
  description: string;
  action?: {
    name: string;
    context: {
      url: string;
    };
  };
}

export function CourseCard({
  title,
  instructor,
  thumbnail,
  description,
  action,
}: CourseCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (action?.context?.url) {
      router.push(action.context.url);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="rounded-xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      <img src={thumbnail} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{instructor}</p>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{description}</p>
      </div>
    </div>
  );
}
