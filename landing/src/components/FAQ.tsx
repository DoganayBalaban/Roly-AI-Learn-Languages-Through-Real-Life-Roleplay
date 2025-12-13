import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { FAQS } from "../constants/FAQ";
gsap.registerPlugin(ScrollTrigger);

const FAQ = () => {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(containerRef);

      // başlangıç state
      gsap.set(q("h2, p, [data-faq-text]"), {
        opacity: 0,
        y: 20,
      });

      gsap.to(q("h2, p, [data-faq-text]"), {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power1.out",
        stagger: 0.06,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom", // section %75 ekrana girince
          once: true, // sadece 1 kez çalışsın
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="relative w-full py-24">
      {/* Background */}
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
          <h2 className="text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-foreground/80">
            Everything you need to know about mastering English with RolyAI.
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger
                data-faq-text
                className="text-left text-lg font-medium hover:text-green-600 transition-colors"
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent
                data-faq-text
                className="text-foreground/80 text-base leading-relaxed"
              >
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
