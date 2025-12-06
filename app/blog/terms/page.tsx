import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Terms() {
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
          Terms and Conditions
        </h1>
        <p className='text-muted-foreground'>
          Last updated: October 3rd, 2025
        </p>
        <p className='max-w-6xl'>
          Welcome to PhiBlog! These terms and conditions outline the rules and regulations for the use of PhiBlog&apos;s website. By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use PhiBlog&apos;s website if you do not accept all of the terms and conditions stated on this page.
        </p>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            1. Intellectual Property Rights
          </h2>
          <p>
            Unless otherwise stated, PhiBlog and/or its licensors own the intellectual property rights for all material on PhiBlog. All intellectual property rights are reserved. You may view and/or print pages from https://www.phiblog.com for your own personal use subject to restrictions set in these terms and conditions.
          </p>
          <p>You must not:</p>
          <ul className='list-disc list-inside'>
            <li>Republish material from https://www.phiblog.com</li>
            <li>Sell, rent, or sub-license material from https://www.phiblog.com</li>
            <li>Reproduce, duplicate, or copy material from https://www.phiblog.com</li>
            <li>Redistribute content from PhiBlog (unless content is specifically made for redistribution).</li>
          </ul>
        </div>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            2. User Comments
          </h2>
          <p>
            This Agreement shall begin on the date hereof.
          </p>
          <ul className='list-disc list-inside'>
            <li>
              Certain parts of this website offer the opportunity for users to post and exchange opinions, information, material, and data (‘Comments&apos;) in areas of the website. PhiBlog does not screen, edit, publish, or review Comments prior to their appearance on the website, and Comments do not reflect the opinions or views of PhiBlog, its agents, or affiliates. Comments reflect the view and opinion of the person who posts such view or opinion. To the extent permitted by applicable laws, PhiBlog shall not be responsible or liable for the Comments or for any loss cost, liability, damages, or expenses caused or suffered as a result of any use of and/or posting of and/or appearance of the Comments on this website.
            </li>
            <li>
              PhiBlog reserves the right to monitor all Comments and to remove any Comments which it considers in its absolute discretion to be inappropriate, offensive, or otherwise in breach of these Terms and Conditions.
            </li>
          </ul>
          <p>
            You warrant and represent that:
          </p>
          <ul className='list-disc list-inside'>
            <li>
              You are entitled to post the Comments on our website and have all necessary licenses and consents to do so;
            </li>
            <li>
              The Comments do not infringe any intellectual property right, including without limitation copyright, patent, or trademark, or other proprietary right of any third party;
            </li>
            <li>
              The Comments do not contain any defamatory, libelous, offensive, indecent, or otherwise unlawful material or material which is an invasion of privacy.
            </li>
            <li>
              The Comments will not be used to solicit or promote business or custom or present commercial activities or unlawful activity.
            </li>
          </ul>
          <p>
            You hereby grant to PhiBlog a non-exclusive royalty-free license to use, reproduce, edit, and authorize others to use, reproduce, and edit any of your Comments in any and all forms, formats, or media.
          </p>
        </div>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            3. Newsletter subscription
          </h2>
          <p>
            By subscribing to our newsletter, you agree to receive emails from PhiBlog containing updates, promotional material, and other content related to Studienkolleg programs.You can unsubscribe from the newsletter at any time by clicking the unsubscribe link provided in each email.We respect your privacy and will not share your email address with third parties without your consent, except as described in our Privacy Policy.
          </p>
        </div>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            4. Hyperlinking to our Content
          </h2>
          <p>
            The following organizations may link to our website without prior written approval:
          </p>
          <ul className='list-disc list-inside'>
            <li>
              Government agencies;
            </li>
            <li>
              Search engines;
            </li>
            <li>
              News organizations;
            </li>
            <li>
              Online directory distributors when they list us in the directory may link to our website in the same manner as they hyperlink to the websites of other listed businesses; and
            </li>
            <li>
              Systemwide Accredited Businesses except soliciting non - profit organizations, charity shopping malls, and charity fundraising groups which may not hyperlink to our website.
            </li>
          </ul>
          <p>
            These organizations may link to our home page, to publications, or to other website information so long as the link:
          </p>
          <ul className='list-disc list-inside'>
            <li>
              is not in any way misleading;
            </li>
            <li>
              does not falsely imply sponsorship, endorsement, or approval of the linking party and its products or services; and
            </li>
            <li>
              fits within the context of the linking party&apos;s site.
            </li>
          </ul>
          <p>
            We may consider and approve in our sole discretion other link requests from the following types of organizations:
          </p>
          <ul className='list-disc list-inside'>
            <li>
              commonly - known consumer and / or business information sources such as Chambers of Commerce, American Automobile Association, Consumers Union;
            </li>
            <li>
              dot.com community sites;
            </li>
            <li>
              associations or other groups representing charities, including charity giving sites,
            </li>
            <li>
              online directory distributors;
            </li>
            <li>
              internet portals;
            </li>
            <li>
              accounting, law, and consulting firms whose primary clients are businesses; and
            </li>
            <li>
              educational institutions and trade associations.
            </li>
          </ul>
          <p>
            We will approve link requests from these organizations if we determine that:
          </p>
          <ul className='list-disc list-inside'>
            <li>
              the link would not reflect unfavorably on us or our accredited businesses (for example, trade associations or other organizations representing inherently suspect types of business, such as work - at - home opportunities, shall not be allowed to link);
            </li>
            <li>
              the organization does not have an unsatisfactory record with us;
            </li>
            <li>
              the benefit to us from the visibility associated with the hyperlink outweighs the absence of PhiBlog; and
            </li>
            <li>
              where the link is in the context of general resource information or is otherwise consistent with the editorial content in a newsletter or similar product furthering the mission of the organization.
            </li>
            <li>
              If you are among the organizations listed in paragraph 2 above and are interested in linking to our website, you must notify us by sending an email to phimath.channel@gmail.com. Please include your name, your organization name, contact information (such as a phone number and / or email address) as well as the URL of your site, a list of any URLs from which you intend to link to our website, and a list of the URL(s) on our site to which you would like to link.Allow 2 - 3 weeks for a response.
            </li>
          </ul>
          <p>
            Approved organizations may hyperlink to our website as follows:
          </p>
          <ul className='list-disc list-inside'>
            <li>
              By use of our corporate name; or
            </li>
            <li>
              By use of the uniform resource locator (web address) being linked to; or
            </li>
            <li>
              By use of any other description of our website or material being linked to that makes sense within the context and format of content on the linking party&apos;s site.
            </li>
          </ul>
          <p>
            No use of PhiBlog&apos;s logo or other artwork will be allowed for linking absent a trademark license agreement.
          </p>
        </div>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            5. Iframes
          </h2>
          <p>
            Without prior approval and express written permission, you may not create frames around our web pages or use other techniques that alter in any way the visual presentation or appearance of our website.
          </p>
        </div>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            6. Reservation of Rights
          </h2>
          <p>
            We reserve the right at any time and in its sole discretion to request that you remove all links or any particular link to our website.You agree to immediately remove all links to our website upon such request.We also reserve the right to amend these terms and conditions and its linking policy at any time.By continuing to link to our website, you agree to be bound to and abide by these linking terms and conditions.
          </p>
        </div>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            7. Removal of links from our website
          </h2>
          <p>
            If you find any link on our website or any linked website objectionable for any reason, you may contact us about this.We will consider requests to remove links but will have no obligation to do so or to respond directly to you.
          </p>
          <p>
            Whilst we endeavor to ensure that the information on this website is correct, we do not warrant its completeness or accuracy; nor do we commit to ensuring that the website remains available or that the material on the website is kept up to date.
          </p>
        </div>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            8. Disclaimer
          </h2>
          <p>
            To the maximum extent permitted by applicable law, we exclude all representations, warranties, and conditions relating to our website and the use of this website (including, without limitation, any warranties implied by law in respect of satisfactory quality, fitness for purpose, and / or the use of reasonable care and skill).Nothing in this disclaimer will:
          </p>
          <ul className='list-disc list-inside'>
            <li>limit or exclude our or your liability for death or personal injury resulting from negligence;</li>
            <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
            <li>limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
            <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
          </ul>
          <p>The limitations and prohibitions of liability set out in this Section and elsewhere in this disclaimer:
          </p>
          <ul className='list-disc list-inside'>
            <li>
              are subject to the preceding paragraph; and
            </li>
            <li>
              govern all liabilities arising under the disclaimer or in relation to the subject matter of this disclaimer, including liabilities arising in contract, in tort (including negligence), and for breach of statutory duty.
            </li>
            <p>
              To the extent that the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.
            </p>
          </ul>
        </div>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            9. Governing Law
          </h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of Germany and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </div>
        <div className='max-w-6xl flex flex-col gap-4'>
          <h2 className='text-start text-2xl font-semibold'>
            10. Contact Information
          </h2>
          <p>
            If you have any questions about these Terms and Conditions, please contact us at phimath.channel@gmail.com.
          </p>
        </div>
      </div>
    </div>
  )
}



