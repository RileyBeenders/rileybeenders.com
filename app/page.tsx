import resumeData from "@/data/resumeData";
import { InteractiveResume } from "@/components/InteractiveResume";

export default function Home() {
  return <InteractiveResume data={resumeData} />;
}
