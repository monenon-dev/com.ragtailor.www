import { LessonLayout } from "@/components/lesson/lesson-layout";

export default function TitanicHomeLayout({ children }: { children: React.ReactNode }) {
  return <LessonLayout active="titanic">{children}</LessonLayout>;
}
