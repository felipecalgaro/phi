import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Privacy() {
  return (
    <div className='flex flex-col justify-center items-center w-full gap-20 pb-20'>
      <nav className="w-full border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>
      <div className='flex flex-col items-start justify-center gap-16 max-w-7xl px-12'>
        <h1 className="text-6xl font-bold text-foreground mb-4 self-center">
          Privacy Policy
        </h1>
        <p className='text-muted-foreground'>
          Last updated: October 3rd, 2025
        </p>
        <p className='max-w-6xl'>
          This Privacy Policy describes how Phiblog collects, uses, and shares personal information of users of our website, https://www.phiblog.com. We are committed to protecting your privacy and ensuring the security of your personal information.
        </p>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            1. Information We Collect
          </h2>
          <p>
            We collect the following types of information:
          </p>
          <ul className='list-disc list-inside'>
            <li>
              Email Address: When you subscribe to our newsletter, we collect your email address to send you updates and exclusive content related to Studienkolleg programs.
            </li>
            <li>
              Log Data: Like many website operators, we collect information that your browser sends whenever you visit our website. This Log Data may include information such as your computer&apos;s Internet Protocol (IP) address, browser type, browser version, the pages of our website that you visit, the time and date of your visit, the time spent on those pages, and other statistics.
            </li>
            <li>
              Cookies: We use cookies to collect information about your browsing behavior and preferences. Cookies are small files stored on your device that help us improve your experience on our website.
            </li>
          </ul>
        </div>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            2. How We Use Your Information
          </h2>
          <p>
            We use your information for the following purposes:
          </p>
          <ul className='list-disc list-inside'>
            <li>
              To Provide and Maintain Our Service: We use your information to operate and improve our website, personalize your experience, and provide you with relevant content.
            </li>
            <li>
              To Send Newsletters: We use your email address to send you newsletters containing updates, promotional material, and other content related to Studienkolleg programs.
            </li>
            <li>
              To Analyze Website Usage: We use Log Data and cookies to analyze how users interact with our website, identify trends, and improve our services.
            </li>
            <li>
              To Respond to Inquiries: If you contact us through our contact form, we will use your information to respond to your inquiries and provide support.
            </li>
          </ul>
        </div>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            3. Sharing Your Information
          </h2>
          <p>
            We do not share your personal information with third parties except in the following circumstances:
          </p>
          <ul className='list-disc list-inside'>
            <li>
              Service Providers: We may share your information with third - party service providers who assist us in operating our website, sending newsletters, or analyzing website usage.These service providers are contractually obligated to protect your information and use it only for the purposes for which we disclose it to them.
            </li>
            <li>
              Legal Requirements: We may disclose your information if required to do so by law or in response to a valid legal request, such as a subpoena or court order.
            </li>
            <li>
              Business Transfers: In the event of a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of the transaction.We will notify you via email and / or a prominent notice on our website of any change in ownership or uses of your personal information, as well as any choices you may have regarding your personal information.
            </li>
          </ul>
        </div>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            4. Cookies
          </h2>
          <p>
            We use cookies to enhance your experience on our website.You can control the use of cookies at the individual browser level.If you reject cookies, you may still use our website, but your ability to use some features or areas of our website may be limited.
          </p>
          <p>
            We use the following types of cookies:
          </p>
          <ul className='list-disc list-inside'>
            <li>
              Essential Cookies: These cookies are necessary for the operation of our website and enable you to navigate our site and use its features.
            </li>
            <li>
              Analytics Cookies: These cookies allow us to analyze website usage and improve our services.
            </li>
            <li>
              Functional Cookies: These cookies allow us to remember your preferences and personalize your experience on our website.
            </li>
          </ul>
        </div>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            5. Security
          </h2>
          <p>
            We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. These measures include:
          </p>
          <ul className='list-disc list-inside'>
            <li>
              Using secure server software (SSL) to encrypt sensitive information during transmission.
            </li>
            <li>
              Implementing firewalls and intrusion detection systems to protect our network.
            </li>
            <li>
              Limiting access to personal information to authorized personnel only.
            </li>
          </ul>
          <p>
            However, no method of transmission over the Internet or method of electronic storage is 100 % secure.Therefore, we cannot guarantee the absolute security of your information.
          </p>
        </div>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            6. Your Rights
          </h2>
          <p>
            You have the following rights regarding your personal information:
          </p>
          <ul className='list-disc list-inside'>
            <li>
              Access: You have the right to access the personal information we hold about you.
            </li>
            <li>
              Rectification: You have the right to request that we correct any inaccurate or incomplete personal information we hold about you.
            </li>
            <li>
              Erasure: You have the right to request that we delete your personal information, subject to certain exceptions.
            </li>
            <li>
              Objection: You have the right to object to the processing of your personal information for certain purposes, such as direct marketing.
            </li>
            <li>
              Portability: You have the right to request that we transfer your personal information to another organization, where technically feasible.
            </li>
          </ul>
          <p>
            To exercise these rights, please contact us at contact@phi.com. We will respond to your request within a reasonable timeframe.
          </p>
        </div>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            7. Children&apos;s Privacy
          </h2>
          <p>
            Our website is not directed to children under the age of 13, and we do not knowingly collect personal information from children under the age of 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us at contact@phi.com. If we become aware that we have collected personal information from a child under the age of 13, we will take steps to delete the information as soon as possible.
          </p>
        </div>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            8. Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on our website. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </div>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            9. Contact Information
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at contact@phi.com.
          </p>
        </div>
      </div>
    </div>
  )
}

