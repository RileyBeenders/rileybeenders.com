import resumeData from "@/data/resume.json";
import { InteractiveResume } from "@/components/InteractiveResume";
import type { ResumeData } from "@/types/resume";

export default function Home() {
  return <InteractiveResume data={resumeData as ResumeData} />;
}
