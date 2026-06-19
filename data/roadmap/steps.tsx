import {
  CheckCircle2,
  FileText,
  GraduationCap,
  Plane,
  Search,
  Send,
} from "lucide-react";
import Image from "next/image";

const YELLOW = "oklch(0.86 0.18 90)";
const ORANGE = "oklch(0.78 0.2 55)";
const RED = "oklch(0.7 0.21 30)";
const GREEN = "oklch(0.75 0.19 140)";

export const STEPS = [
  {
    key: "research",
    title: "Research Studienkolleg options",
    description: (
      <>
        <p>
          Pick where you want to apply and which course track (T, M, W, G, S)
          fits your future degree.
        </p>
        <ul>
          <li>
            Decide what you want to study later (e.g. engineering, medicine,
            business, humanities) and choose the matching Studienkolleg track.
          </li>
          <li>
            Research which <i>specific</i> Studienkollegs offer that track
            and in which cities (e.g. Studienkolleg München, FU Berlin
            Studienkolleg, etc.).
          </li>
          <li>
            <b>Personal recommendation:</b> Select{" "}
            <b>at least 4-5 different Studienkollegs</b> to increase your
            chances, because seats are limited and admission is competitive.
          </li>
        </ul>
      </>
    ),
    icon: Search,
    color: YELLOW,
    necessary: undefined,
  },
  {
    key: "understand",
    title: "Understand the application process",
    description: (
      <>
        <p>Spoiler: Each Studienkolleg has its own.</p>
        <ul>
          <li>
            Each Studienkolleg has its{" "}
            <b>own application process, documents and exact deadlines</b>,
            described in detail on its official website - always follow the
            instructions there.
          </li>
          <li>
            Typical deadlines for <i>public</i> Studienkollegs are around{" "}
            <b>December</b> (for summer semester) and <b>June</b> (for winter
            semester), but this can vary by state and institution.
          </li>
        </ul>
        <p>
          <b>Tips</b>
        </p>
        <ul>
          <li>
            If the website is unclear, email the Studienkolleg office and keep
            their written replies as reference.
          </li>
        </ul>
      </>
    ),
    icon: Send,
    color: ORANGE,
    necessary: true,
  },
  {
    key: "docs",
    title: "Prepare documents",
    description: (
      <>
        <p>Get all documents into the correct format.</p>
        <ul>
          <li>
            Collect the standard documents: passport, German language
            certificate, CV, biometric photos, high school diploma, plus any
            extra documents requested by each Studienkolleg.
          </li>
        </ul>
      </>
    ),
    icon: FileText,
    color: RED,
    necessary: true,
  },
  {
    key: "aps",
    title: "Get the APS certificate",
    description: (
      <>
        <p>Required if you&apos;re from India, China, Vietnam, or Mongolia.</p>
        <ul>
          <li>
            The <b>APS (Akademische Prüfstelle)</b> is an institution from
            Germany that verifies your academic documents are genuine. You need
            it to apply to Studienkollegs and for student visa.
          </li>
          <li>
            The certificate can be used for all your Studienkolleg applications
            - you only need one.
          </li>
        </ul>
        <p>
          <b>Tips</b>
        </p>
        <ul>
          <li>
            Processing takes multiple weeks depending on your country and
            season. Apply{" "}
            <b>
              at least 3-4 months before your Studienkolleg application
              deadline
            </b>
            .
          </li>
        </ul>
      </>
    ),
    icon: FileText,
    color: ORANGE,
    necessary: undefined,
  },
  {
    key: "apply",
    title: "Apply for Studienkolleg",
    description: (
      <>
        <p>Actually send your applications for all shortlisted options.</p>
        <ul>
          <li>
            Submit complete applications through the correct channel:
            uni-assist, university online portal, mail, etc. - depending on
            what each one requires.
          </li>
          <li>
            After submission there is usually a waiting period (often weeks)
            while they check your documents and eligibility.
          </li>
        </ul>
        <p>
          <b>Tips</b>
        </p>
        <ul>
          <li>
            Double-check that every uploaded document matches the{" "}
            <i>format</i> and <i>certification</i> requirements; missing a
            certified copy can mean your application is treated as
            &quot;incomplete&quot;.
          </li>
        </ul>
      </>
    ),
    icon: Send,
    color: YELLOW,
    necessary: true,
  },
  {
    key: "invitation",
    title: "Get invitation letter",
    description: (
      <>
        <p>
          If the document check is positive, you&apos;ll get invited to the
          Aufnahmeprüfung.
        </p>
        <ul>
          <li>
            The invitation letter usually contains the exam date and location
            (or online details).
          </li>
          <li>Remember to bring this letter on the day of your exam.</li>
        </ul>
        <p>
          <b>Tips</b>
        </p>
        <ul>
          <li>
            Save the invitation PDF and print at least one paper copy; you will
            have to use it also on your visa application process.
          </li>
        </ul>
      </>
    ),
    icon: FileText,
    color: ORANGE,
    necessary: true,
  },
  {
    key: "visa",
    title: "Apply for visa",
    description: (
      <>
        <p>
          In order to go to Germany and take the Aufnahmetest, you need the
          right visa and financial proof.
        </p>
        <ul>
          <li>
            For a visa for Studienkolleg, you usually need: invitation letter,
            blocked account (around €12,000), health insurance, and other
            documents defined by your embassy.
          </li>
          <li>
            Appointment waiting times at embassies can be long (often several
            weeks or months), so you must check your embassy&apos;s website and
            book as early as possible.
          </li>
        </ul>
      </>
    ),
    icon: Send,
    color: RED,
    necessary: undefined,
  },
  {
    key: "test",
    title: "Take the Aufnahmetest",
    description: (
      <>
        <p>
          This exam decides whether you actually get a place at the
          Studienkolleg.
        </p>
        <ul>
          <li>
            The Aufnahmetest usually has at least two parts: German (often at B2
            level) and subject-specific content such as mathematics for T/W
            courses or other subjects depending on the track.
          </li>
          <li>
            It takes place once per semester, and in many cases you can only
            repeat it a limited number of times.
          </li>
          <li>
            It&apos;s a highly competitive exam; prepare yourself very well! ;)
          </li>
        </ul>
        <p>
          <b>Tips</b>
        </p>
        <ul>
          <li>
            Study with <b>sample Aufnahmetests</b> from the websites of your
            target Studienkollegs and general preparation guides - this helps
            you get used to the format and difficulty.
          </li>
          <li>
            Plan to arrive in the city at least one day before the exam to avoid
            stress from travel delays; and on the day of your exam arrive at
            least 1-2 hours early.
          </li>
          <li>
            I have a complete guide video on YouTube for the Aufnahmetest! You
            can check it out here:
            <Image
              src="/at-guide-thumb.png"
              width={400}
              height={720}
              alt="Video thumbnail"
              className="mx-auto mt-4 rounded-xl"
            />
            <a
              href="https://youtu.be/GmE4nMI-OfY"
              className="mt-3 block text-center underline underline-offset-4"
            >
              https://youtu.be/GmE4nMI-OfY
            </a>
          </li>
        </ul>
      </>
    ),
    icon: Plane,
    color: ORANGE,
    necessary: true,
  },
  {
    key: "accept",
    title: "Accept place",
    description: (
      <>
        <p>If you pass, you still need to actively confirm your place.</p>
        <ul>
          <li>
            After the exam, candidates are ranked based on their results; offers
            are made according to this ranking and the number of available
            seats.
          </li>
          <li>
            If you pass with a high enough score, you receive a formal{" "}
            <b>admission letter</b> to the Studienkolleg with a deadline to
            accept the place.
          </li>
        </ul>
        <p>
          <b>Tips</b>
        </p>
        <ul>
          <li>
            Read the admission letter carefully: some Studienkollegs require you
            to confirm by email, pay a semester contribution, or submit
            additional documents before a fixed date.
          </li>
          <li>
            If you do not pass, note whether you are allowed to repeat the exam
            (some allow up to three attempts; others are stricter) and plan a
            new strategy.
          </li>
        </ul>
      </>
    ),
    icon: CheckCircle2,
    color: YELLOW,
    necessary: true,
  },
  {
    key: "enroll",
    title: "Enroll",
    description: (
      <>
        <p>
          Turn your admission into actual enrollment and get ready to start.
        </p>
        <ul>
          <li>
            Complete enrollment at the Studienkolleg by presenting your
            admission letter and remaining documents.
          </li>
          <li>
            Only after enrollment are you officially a Studienkolleg student and
            will receive your timetable and access to classes.
          </li>
        </ul>
        <p>
          <b>Tips</b>
        </p>
        <ul>
          <li>
            Keep both digital and paper copies of all important documents
            (passport, visa, admission letter, enrollment certificate, health
            insurance confirmation).
          </li>
          <li>
            Attend any orientation sessions; they are very helpful for
            understanding rules, grading, Feststellungsprüfung and next steps
            toward university.
          </li>
        </ul>
      </>
    ),
    icon: GraduationCap,
    color: GREEN,
    necessary: true,
  },
] as const;
