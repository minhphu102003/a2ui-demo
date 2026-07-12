"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

const MOCK_COURSES: Record<string, any> = {
  "1": {
    title: "React Fundamentals",
    instructor: "John Doe",
    description: "Learn React from scratch with hands-on projects",
    thumbnail: "https://picsum.photos/seed/react/800/450",
    duration: "8 hours",
    level: "Beginner",
    rating: 4.8,
    students: 12500,
  },
  "2": {
    title: "Advanced React Patterns",
    instructor: "Jane Smith",
    description: "Master advanced React patterns and best practices",
    thumbnail: "https://picsum.photos/seed/advanced-react/800/450",
    duration: "12 hours",
    level: "Advanced",
    rating: 4.9,
    students: 8200,
  },
  "3": {
    title: "React Native Mobile Development",
    instructor: "Mike Johnson",
    description: "Build cross-platform mobile apps with React Native",
    thumbnail: "https://picsum.photos/seed/react-native/800/450",
    duration: "15 hours",
    level: "Intermediate",
    rating: 4.7,
    students: 9800,
  },
  "4": {
    title: "TypeScript for React Developers",
    instructor: "Sarah Wilson",
    description: "Learn TypeScript in the context of React development",
    thumbnail: "https://picsum.photos/seed/typescript/800/450",
    duration: "6 hours",
    level: "Intermediate",
    rating: 4.6,
    students: 15300,
  },
  "5": {
    title: "Next.js Full Stack Development",
    instructor: "David Brown",
    description: "Build full-stack applications with Next.js and React",
    thumbnail: "https://picsum.photos/seed/nextjs/800/450",
    duration: "20 hours",
    level: "Intermediate",
    rating: 4.8,
    students: 11200,
  },
};

export default function CourseDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const course = MOCK_COURSES[id];

  if (!course) {
    return (
      <div className="min-h-screen p-8">
        <p>Course not found</p>
        <button onClick={() => router.push("/")} className="text-blue-500 underline">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="p-4 border-b flex items-center gap-4">
        <button onClick={() => router.push("/")} className="text-blue-500">
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold">{course.title}</h1>
      </header>

      <div className="max-w-4xl mx-auto p-8">
        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-6">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex gap-4 text-sm text-gray-600 mb-4">
          <span>{course.instructor}</span>
          <span>|</span>
          <span>{course.duration}</span>
          <span>|</span>
          <span>{course.level}</span>
          <span>|</span>
          <span>{course.rating} ★</span>
          <span>|</span>
          <span>{course.students.toLocaleString()} students</span>
        </div>

        <p className="text-gray-700">{course.description}</p>
      </div>
    </div>
  );
}
