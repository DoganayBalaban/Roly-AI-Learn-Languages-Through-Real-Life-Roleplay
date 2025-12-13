import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "How does RolyAI improve my speaking confidence?",
    answer:
      "Unlike traditional apps that focus on flashcards, RolyAI immerses you in real-life roleplay scenarios. You’ll practice speaking with an AI partner in situations like ordering coffee, job interviews, or casual chats. This helps you overcome the fear of speaking without the pressure of being judged by a human.",
  },
  {
    question: "What kind of feedback will I receive?",
    answer:
      "You get instant, detailed feedback after every message. Our AI analyzes your voice to correct your pronunciation (providing IPA guides) and highlights any grammar mistakes, suggesting more natural ways to express yourself.",
  },
  {
    question: "Is RolyAI suitable for beginners?",
    answer:
      "Absolutely! RolyAI adapts to your proficiency level. Whether you are just starting out or looking to polish your advanced fluency, the AI adjusts the conversation complexity and speed to match your skills.",
  },
  {
    question: "Is the app free to use?",
    answer:
      "Yes, you can start using RolyAI for free. We offer a generous free tier that allows you to try daily scenarios. For unlimited practice and advanced analytics, you can upgrade to RolyAI Premium anytime.",
  },
  {
    question: "Can I practice languages other than English?",
    answer:
      "Currently, RolyAI is specialized in English to provide the most accurate pronunciation and grammar analysis. However, we are working hard to add Spanish, French, and German in our upcoming updates!",
  },
];

const FAQ = () => {
  return (
    <section className="relative w-full py-24">
      {/* Only the background has reduced opacity; content stays opaque */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, #AFFC88 0%, transparent 70%)`,
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />
      <div className="relative z-10 max-w-3xl mx-auto px-6">
        {/* Başlık */}
        <div className="text-center mb-12 text-foreground">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-foreground/80">
            Everything you need to know about mastering English with RolyAI.
          </p>
        </div>

        {/* Accordion Listesi */}
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg font-medium text-foreground hover:text-green-600 transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/80 text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
