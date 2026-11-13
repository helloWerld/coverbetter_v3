import React from 'react';
import Navbar from '../components/Navbar';
import MobileNavbar from '../components/MobileNavbar';
import Footer from '../components/Footer';

const Privacy = () => {
	const privacy = `Effective Date: July 1st, 2023

This Privacy Policy governs the manner in which Cover Better collects, uses, maintains, and discloses information collected from users ("User" or "you") of the Cover Better web app ("Web App"). This Privacy Policy applies to the Web App and all products and services offered by Cover Better.

1. Information Collection

1.1 Login Information
To access and use the Web App, you are required to log in using your Google account. This process collects certain information associated with your Google account, such as your name and email address.

1.2 Resume Information
When using the Web App, you may submit a resume that includes personal information, such as your name, contact details, employment history, and education. This information is collected and retained by Cover Better.

1.3 Job Description Information
In order to generate customized cover letters, you may submit a description of the job you are applying for. This job description information is collected and retained by Cover Better.

1.4 Cover Letter Information
Using the OpenAI API (gpt-3.5-turbo), Cover Better generates customized cover letters based on the information you provide. These cover letters may contain personal information from your resume and job description. The generated cover letters are retained by Cover Better.

1.5 Payment Information
For payment transactions, Cover Better utilizes Stripe, a third-party payment processing service. When making a payment, you provide certain information such as your name, email, and purchase details. However, Cover Better does not retain any payment details, such as credit card numbers, as all payment processing is handled securely by Stripe.

2. Information Usage

2.1 Service Provision
Cover Better uses the collected information to provide and improve its services, including generating customized cover letters based on your resume and job description.

2.2 Communication
Cover Better may use your email address to communicate with you regarding the Web App, including updates, notifications, and responses to inquiries.

2.3 Statistical Analysis
Cover Better may analyze aggregated, non-personal information for statistical purposes, such as analyzing usage patterns, trends, and demographics. This information is used to improve the Web App and enhance user experience.

3. Information Disclosure

3.1 Third-Party Service Providers
Cover Better may engage trusted third-party service providers to assist in operating the Web App and performing related services. These third parties have access to your personal information only to the extent necessary to perform the services on behalf of Cover Better and are obligated to maintain the confidentiality and security of your information.

3.2 Legal Requirements
Cover Better may disclose your personal information if required to do so by law or in response to valid legal requests, such as subpoenas or court orders.

4. Data Retention

Cover Better retains the information you provide, including resumes, job descriptions, and generated cover letters, for as long as necessary to fulfill the purposes outlined in this Privacy Policy. However, please note that Cover Better does not guarantee the permanence of any user-submitted information and recommends that you retain copies of your resume and cover letters.

5. Advertising and Third-Party Sharing

Cover Better reserves the right to use the information collected from users, including resumes, job descriptions, and cover letters, for advertising purposes or to share it with third parties at its discretion. However, Cover Better will never sell your personal information to third parties for direct marketing purposes without your explicit consent.

6. Security Measures

Cover Better implements appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information stored on its servers. However, please be aware that no data transmission over the internet or storage method is entirely secure. Therefore, Cover Better cannot guarantee the absolute security of your information.

7. Your Rights and Choices

You have the following rights and choices regarding your personal information:

7.1 Access and Update
You have the right to access and update your personal information stored by Cover Better. You can do this by accessing your account settings or by contacting us directly. We will make reasonable efforts to accommodate your request, subject to any legal or contractual obligations.

7.2 Data Portability
You have the right to request a copy of your personal information in a structured, commonly used, and machine-readable format. If feasible, we will provide the requested information or directly transfer it to another controller as requested by you.

7.3 Data Deletion
You can request the deletion of your personal information stored by Cover Better. However, please note that certain information may need to be retained for legal or legitimate business purposes, such as compliance with applicable laws or resolving disputes.

7.4 Marketing Communications
You have the option to opt out of receiving marketing communications from Cover Better. You can exercise this choice by following the unsubscribe instructions included in the communication or by contacting us directly.

7.5 Cookie Settings
Cover Better may use cookies and similar technologies to enhance your user experience. You have the ability to manage your cookie preferences through your web browser settings. Please note that disabling or rejecting cookies may affect the functionality and usability of the Web App.

8. Children's Privacy
The Web App is not intended for use by individuals under the age of 16 ("Children"). Cover Better does not knowingly collect personal information from Children. If you become aware that a Child has provided personal information without parental consent, please contact us, and we will take appropriate steps to remove the information from our systems.

9. Consent to OpenAI API Usage
By using the Web App, you acknowledge and agree that the information you provide, including resumes, job descriptions, and cover letters, will be transmitted to and processed by the OpenAI API (gpt-3.5-turbo) for the purpose of generating customized cover letters. Cover Better is not responsible for the data handling practices of OpenAI and recommends reviewing OpenAI's privacy policy for more information.

10. International Data Transfer
Cover Better operates in the United States, and the information collected through the Web App may be transferred to and processed in the United States or other countries where our service providers are located. These countries may have different data protection laws than your jurisdiction. By using the Web App, you consent to the transfer, processing, and storage of your information in these countries.

11. Third-Party Websites
The Web App may contain links to third-party websites or services. These websites or services are not under the control of Cover Better, and we are not responsible for their privacy practices. We encourage you to review the privacy policies of those third parties before providing any personal information.

12. Severability
If any provision of this Privacy Policy is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.

13. Changes to this Privacy Policy
Cover Better reserves the right to update or modify this Privacy Policy at any time. We will notify you of any material changes by posting the revised Privacy Policy on the Web App or by other means of communication. It is your responsibility to review this Privacy Policy periodically for any updates. Your continued use of the Web App after the posting of changes constitutes your acceptance of the revised Privacy Policy.

14. Contact Us
If you have any questions, concerns, or inquiries about this Privacy Policy or the privacy practices of Cover Better, please contact us at admin@coverbetter.io

15. Entire Agreement
This Privacy Policy constitutes the entire agreement between you and Cover Better regarding the collection, use, disclosure, and protection of your personal information through the Web App, superseding any prior agreements or understandings, whether oral or written, relating to the subject matter herein.

By using the Cover Better Web App, you signify your acceptance of this Privacy Policy.`;

	return (
		<div className="flex flex-col pb-48 w-full min-h-screen h-fit bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-300/70 via-blue-500 to-black items-center justify-start relative">
			<Navbar />
			<MobileNavbar />
			<div className="w-11/12 md:w-4/5 lg:w-2/3 2xl:w-1/2">
				<h1 className="text-2xl 2xl:text-3xl mt-40 font-semibold text-center">
					Privacy Policy
				</h1>
				<hr className="border-black/30 my-2" />
				<pre className="flex flex-col w-full h-4/5 justify-start mt-6 gap-5 whitespace-pre-wrap font-sans">
					{privacy}
				</pre>
			</div>
			<Footer />
		</div>
	);
};

export default Privacy;
