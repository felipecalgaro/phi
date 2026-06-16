import {
  CheckCircle2,
  FileText,
  GraduationCap,
  Plane,
  Search,
  Send,
} from "lucide-react";

const YELLOW = "oklch(0.86 0.18 90)";
const ORANGE = "oklch(0.78 0.2 55)";
const RED = "oklch(0.7 0.21 30)";
const GREEN = "oklch(0.75 0.19 140)";

export const STEPS = [
  {
    key: "research",
    title: "Research Studienkolleg options",
    description: `Pick where you want to apply and which course track (T, M, W, G, S) fits your future degree.

      - Decide what you want to study later (e.g. engineering, medicine, business, humanities) and choose the matching Studienkolleg track.
      - Research which _specific_ Studienkollegs offer that track and in which cities (e.g. Studienkolleg München, FU Berlin Studienkolleg, etc.).
      - **Personal recommendation:** Select **at least 4-5 different Studienkollegs** to increase your chances, because seats are limited and admission is competitive.`,
    icon: Search,
    color: YELLOW,
    necessary: undefined,
  },
  {
    key: "understand",
    title: "Understand the application process",
    description: `Spoiler: Each Studienkolleg has its own.
    
    - Each Studienkolleg has its **own application process, documents and exact deadlines**, described in detail on its official website — always follow the instructions there
    - Typical deadlines for _public_ Studienkollegs are around **December** (for summer semester) and **June** (for winter semester), but this can vary by state and institution.
    
    **Tips**
    
    - If the website is unclear, email the Studienkolleg office and keep their written replies as reference.`,
    icon: Send,
    color: ORANGE,
    necessary: true,
  },
  {
    key: "docs",
    title: "Prepare documents",
    description: `Get all documents into the correct format.

      - Collect the standard documents: passport, German language certificate, CV, biometric photos, high school diploma, plus any extra documents requested by each Studienkolleg.`,
    icon: FileText,
    color: RED,
    necessary: true,
  },
  {
    key: "aps",
    title: "Get the APS certificate",
    description: `Required if you're from India, China, Vietnam, or Mongolia.


    - The **APS (Akademische Prüfstelle)** is an institution from Germany that verifies your academic documents are genuine. You need it to apply to Studienkollegs and for student visa.
    - The certificate can be used for all your Studienkolleg applications — you only need one.

    **Tips**

    - Processing takes multiple weeks depending on your country and season. Apply **at least 3-4 months before your Studienkolleg application deadline**.`,
    icon: FileText,
    color: ORANGE,
    necessary: undefined,
  },
  {
    key: "apply",
    title: "Apply for Studienkolleg",
    description: `Actually send your applications for all shortlisted options.

      - Submit complete applications through the correct channel: uni-assist, university online portal, mail, etc. — depending on what each one requires.
      - After submission there is usually a waiting period (often weeks) while they check your documents and eligibility.

      **Tips**

      - Double-check that every uploaded document matches the _format_ and _certification_ requirements; missing a certified copy can mean your application is treated as “incomplete”.`,
    icon: Send,
    color: YELLOW,
    necessary: true,
  },
  {
    key: "invitation",
    title: "Get invitation letter",
    description: `If the document check is positive, you'll get invited to the Aufnahmeprüfung.

      - The invitation letter usually contains the exam date and location (or online details)
      - Remember to bring this letter on the day of your exam.

      **Tips**

      - Save the invitation PDF and print at least one paper copy; you will have to use it also on your visa application process`,
    icon: FileText,
    color: ORANGE,
    necessary: true,
  },
  {
    key: "visa",
    title: "Apply for visa",
    description: `In order to go to Germany and take the Aufnahmetest, you need the right visa and financial proof.

      - For a visa for Studienkolleg, you usually need: invitation letter, blocked account (around €12,000), health insurance, and other documents defined by your embassy.
      - Appointment waiting times at embassies can be long (often several weeks or months), so you must check your embassy’s website and book as early as possible.`,
    icon: Send,
    color: RED,
    necessary: undefined,
  },
  {
    key: "test",
    title: "Take the Aufnahmetest",
    description: `This exam decides whether you actually get a place at the Studienkolleg.

      - The Aufnahmetest usually has at least two parts: German (often at B2 level) and subject-specific content such as mathematics for T/W courses or other subjects depending on the track.
      - It takes place once per semester, and in many cases you can only repeat it a limited number of times.
      - It's a highly competitive exam; prepare yourself very well! ;)

      **Tips**

      - Study with **sample Aufnahmetests** from the websites of your target Studienkollegs and general preparation guides — this helps you get used to the format and difficulty.
      - Plan to arrive in the city at least one day before the exam to avoid stress from travel delays; and on the day of your exam arrive at least 1-2 hours early.
      - I have a complete guide video on YouTube for the Aufnahmetest! You can check it out here:
        <Image
          src="/thumb.png"
          width={400}
          height={720}
          alt="Video thumbnail"
          className="mx-auto"
        />
        <a href="https://youtu.be/GmE4nMI-OfY" className="text-center">
          https://youtu.be/GmE4nMI-OfY
        </a>`,
    icon: Plane,
    color: ORANGE,
    necessary: true,
  },
  {
    key: "accept",
    title: "Accept place",
    description: `If you pass, you still need to actively confirm your place.

      - After the exam, candidates are ranked based on their results; offers are made according to this ranking and the number of available seats.
      - If you pass with a high enough score, you receive a formal **admission letter** to the Studienkolleg with a deadline to accept the place.

      **Tips**

      - Read the admission letter carefully: some Studienkollegs require you to confirm by email, pay a semester contribution, or submit additional documents before a fixed date.
      - If you do not pass, note whether you are allowed to repeat the exam (some allow up to three attempts; others are stricter) and plan a new strategy.`,
    icon: CheckCircle2,
    color: YELLOW,
    necessary: true,
  },
  {
    key: "enroll",
    title: "Enroll",
    description: `Turn your admission into actual enrollment and get ready to start.

      - Complete enrollment at the Studienkolleg by presenting your admission letter and remaining documents.
      - Only after enrollment are you officially a Studienkolleg student and will receive your timetable and access to classes.

      **Tips**

      - Keep both digital and paper copies of all important documents (passport, visa, admission letter, enrollment certificate, health insurance confirmation).
      - Attend any orientation sessions; they are very helpful for understanding rules, grading, Feststellungsprüfung and next steps toward university.`,
    icon: GraduationCap,
    color: GREEN,
    necessary: true,
  },
] as const;
