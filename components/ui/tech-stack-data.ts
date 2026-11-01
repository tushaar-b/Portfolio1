import { siPython, siReact, siNextdotjs, siJavascript, siNodedotjs, siFastapi, siExpress, siTypescript, siSupabase, siPostgresql, siMongodb, siCplusplus, siTensorflow, siFigma, siC, siHtml5, siCss, siGit, siArduino, siRaspberrypi } from "simple-icons";

export type TechItem = { id: string; name: string; icon?: { path: string; hex: string }; size: "lg" | "md" | "sm"; copies: number };
export const techStack: TechItem[] = [
  { id: "python", name: "Python", icon: siPython, size: "lg", copies: 2 },
  { id: "react", name: "React", icon: siReact, size: "lg", copies: 2 },
  { id: "nextjs", name: "Next.js", icon: siNextdotjs, size: "lg", copies: 2 },
  { id: "javascript", name: "JavaScript", icon: siJavascript, size: "lg", copies: 2 },
  { id: "nodejs", name: "Node.js", icon: siNodedotjs, size: "lg", copies: 2 },
  { id: "fastapi", name: "FastAPI", icon: siFastapi, size: "md", copies: 1 },
  { id: "express", name: "Express", icon: siExpress, size: "md", copies: 1 },
  { id: "typescript", name: "TypeScript", icon: siTypescript, size: "md", copies: 1 },
  { id: "supabase", name: "Supabase", icon: siSupabase, size: "md", copies: 1 },
  { id: "postgresql", name: "PostgreSQL", icon: siPostgresql, size: "md", copies: 1 },
  { id: "mongodb", name: "MongoDB", icon: siMongodb, size: "md", copies: 1 },
  { id: "cplusplus", name: "C++", icon: siCplusplus, size: "md", copies: 1 },
  { id: "tensorflow", name: "TensorFlow", icon: siTensorflow, size: "md", copies: 1 },
  { id: "figma", name: "Figma", icon: siFigma, size: "md", copies: 1 },
  { id: "c", name: "C", icon: siC, size: "sm", copies: 1 },
  { id: "html", name: "HTML", icon: siHtml5, size: "sm", copies: 1 },
  { id: "css", name: "CSS", icon: siCss, size: "sm", copies: 1 },
  { id: "git", name: "Git", icon: siGit, size: "sm", copies: 1 },
  { id: "arduino", name: "Arduino", icon: siArduino, size: "sm", copies: 1 },
  { id: "raspberrypi", name: "Raspberry Pi", icon: siRaspberrypi, size: "sm", copies: 1 },
];
