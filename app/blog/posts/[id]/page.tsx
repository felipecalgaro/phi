import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

const posts = [
  {
    id: "1",
    title: "Understanding the German Studienkolleg System",
    content: `The Studienkolleg is a preparatory course for international students who wish to study at German universities. It's an essential step for many students whose educational qualifications are not directly recognized in Germany.

## What is Studienkolleg?

Studienkolleg is a one-year preparatory course that prepares international students for university studies in Germany. The course focuses on both language skills and subject-specific knowledge required for your chosen field of study.

## Course Types

There are different Studienkolleg courses depending on your intended field of study:

- **T-Kurs**: For technical, mathematical and scientific subjects
- **M-Kurs**: For medical and biological studies
- **W-Kurs**: For business and social science studies
- **G-Kurs**: For humanities, German studies and arts
- **S-Kurs**: For language studies

## Entrance Requirements

To be admitted to a Studienkolleg, you typically need:

1. A recognized secondary school certificate
2. German language proficiency (usually B1-B2 level)
3. Pass the entrance examination (Aufnahmeprüfung)

## Duration and Structure

The course typically lasts two semesters (one academic year) and concludes with the Assessment Test (Feststellungsprüfung or FSP). Upon passing this exam, you'll receive a certificate that qualifies you to apply to German universities.

## Benefits of Studienkolleg

- Structured preparation for university studies
- Improvement of German language skills
- Understanding of the German education system
- Integration into student life in Germany
- Building a network with other international students

The Studienkolleg experience is invaluable for your academic success in Germany. It provides not only the necessary academic foundation but also helps you adapt to the German way of learning and living.`,
    date: "March 15, 2024",
    category: "Education",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop"
  },
  {
    id: "2",
    title: "Preparing for the Feststellungsprüfung",
    content: `The Feststellungsprüfung (FSP) is the final examination at the end of your Studienkolleg course. Passing this exam is crucial as it determines whether you can proceed to study at a German university.

## Understanding the FSP

The FSP tests both your language proficiency and subject-specific knowledge acquired during the Studienkolleg course. The exam format varies depending on your course type (T-Kurs, M-Kurs, W-Kurs, etc.).

## Exam Structure

The examination typically consists of:

- Written exams in your core subjects
- German language examination
- Mathematics (for relevant courses)
- Subject-specific tests

## Preparation Strategies

### Start Early
Begin your preparation at least 3-4 months before the exam date. Create a study schedule that covers all subjects systematically.

### Practice Past Papers
Obtain past examination papers from your Studienkolleg. These give you insight into the exam format and difficulty level.

### Form Study Groups
Collaborate with classmates to review difficult topics and quiz each other on key concepts.

### Focus on Weak Areas
Identify your weak subjects early and allocate more study time to them.

## Language Preparation

German language proficiency is tested extensively. Focus on:

- Academic vocabulary
- Essay writing
- Text comprehension
- Grammar accuracy

## Subject-Specific Preparation

Depending on your course:

- **T-Kurs**: Focus on mathematics, physics, and chemistry
- **W-Kurs**: Emphasize economics, mathematics, and social studies
- **M-Kurs**: Concentrate on biology, chemistry, and physics

## Final Tips

- Stay organized with your notes
- Attend all preparatory sessions
- Maintain a healthy sleep schedule
- Don't cram - consistent study is key
- Stay confident and trust your preparation

Success in the FSP opens the door to your university studies in Germany. With proper preparation and dedication, you can achieve excellent results.`,
    date: "March 12, 2024",
    category: "Exams",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop"
  },
  {
    id: "3",
    title: "Life as an International Student in Germany",
    content: `Living and studying in Germany as an international student is an exciting and enriching experience. This guide will help you navigate the practical aspects of student life in Germany.

## Accommodation

Finding accommodation is one of the first challenges you'll face:

### Student Dormitories (Studentenwohnheim)
- Most affordable option
- Apply early as spaces are limited
- Good opportunity to meet other students

### Private Apartments (WG - Wohngemeinschaft)
- Shared apartments are popular
- More expensive than dorms
- Greater independence and flexibility

## Cost of Living

Monthly expenses in Germany (approximate):

- Rent: €300-€600
- Food: €150-€250
- Health insurance: €110
- Transportation: €30-€80
- Miscellaneous: €100-€150

Total: €690-€1,190 per month

## Health Insurance

Health insurance is mandatory in Germany. As a student, you have two options:

1. **Public health insurance**: About €110 per month for students
2. **Private health insurance**: Can be cheaper but has limitations

## Transportation

Most cities offer student discounts on public transportation. The semester ticket (Semesterticket) often provides unlimited travel within the city and sometimes the entire state.

## Part-Time Work

International students can work:

- Up to 120 full days or 240 half days per year
- Without time limit for student assistant jobs
- Good opportunity to earn money and practice German

## Banking

Open a German bank account soon after arrival:

- Many banks offer free student accounts
- Required for receiving salary and paying rent
- Popular options: Deutsche Bank, Commerzbank, N26, Sparkasse

## Language and Culture

### Improve Your German
- Attend Tandem meetings
- Join university language courses
- Watch German TV and movies
- Practice with native speakers

### Cultural Integration
- Participate in university events
- Join student organizations
- Attend local festivals
- Try traditional German cuisine

## Academic Life

### University System
- More independent than school
- Emphasis on self-study
- Attend lectures and seminars regularly
- Use office hours to clarify doubts

### Time Management
- Balance study, work, and leisure
- Use semester breaks wisely
- Plan for exam periods

## Social Life

Germany offers rich cultural experiences:

- Museums and galleries
- Music festivals and concerts
- Sports clubs and activities
- Travel opportunities within Europe

## Dealing with Homesickness

It's normal to feel homesick:

- Stay connected with family through video calls
- Build friendships in Germany
- Join international student groups
- Maintain hobbies and interests

## Essential Apps

- DB Navigator: Train schedules
- Google Translate: Language help
- Lieferando: Food delivery
- WG-Gesucht: Apartment hunting
- Tandem: Language exchange

Life in Germany requires adjustment, but with an open mind and willingness to embrace new experiences, your time here will be incredibly rewarding.`,
    date: "March 10, 2024",
    category: "Student Life",
    readTime: "12 min read",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=600&fit=crop"
  }
];

export default async function Post({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const post = posts.find(p => p.id === id) || posts[0];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all posts
          </Link>
        </div>
      </nav>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {post.date}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </div>
          </div>
        </header>

        <div className="mb-12">
          <AspectRatio ratio={16 / 9}>
            <div className='bg-red-300 size-full'></div>
          </AspectRatio>
        </div>

        <div className="prose prose-lg max-w-none">
          {post.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={index} className="text-2xl font-bold text-foreground mt-8 mb-4">
                  {paragraph.replace('## ', '')}
                </h2>
              );
            } else if (paragraph.startsWith('### ')) {
              return (
                <h3 key={index} className="text-xl font-semibold text-foreground mt-6 mb-3">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            } else if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n');
              return (
                <ul key={index} className="list-disc list-inside space-y-2 my-4 text-foreground/90">
                  {items.map((item, i) => (
                    <li key={i}>{item.replace('- ', '')}</li>
                  ))}
                </ul>
              );
            } else if (paragraph.match(/^\d+\./)) {
              const items = paragraph.split('\n');
              return (
                <ol key={index} className="list-decimal list-inside space-y-2 my-4 text-foreground/90">
                  {items.map((item, i) => (
                    <li key={i}>{item.replace(/^\d+\.\s*/, '')}</li>
                  ))}
                </ol>
              );
            } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return (
                <p key={index} className="font-semibold text-foreground my-4">
                  {paragraph.replace(/\*\*/g, '')}
                </p>
              );
            } else {
              return (
                <p key={index} className="text-foreground/90 leading-relaxed my-4">
                  {paragraph}
                </p>
              );
            }
          })}
        </div>
      </article>
    </div>
  );
}