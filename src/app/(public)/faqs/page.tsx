import prisma from "@/lib/prisma";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HelpCircle, MessageSquare } from "lucide-react";

export const metadata = { title: "FAQs" };

export default async function FAQsPage() {
  const faqs = await prisma.fAQ.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      {/* Hero */}
      <section
        className='py-20 relative overflow-hidden'
        style={{ background: 'hsl(var(--primary))' }}
      >
        <div
          className='absolute inset-0'
          style={{
            backgroundImage:
              'radial-gradient(circle at 70% 50%, rgba(249,115,22,0.15) 0%, transparent 60%)',
          }}
        />
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <p className='text-orange-400 text-sm font-bold uppercase tracking-widest mb-3'>
            Help Center
          </p>
          <h1
            className='text-5xl sm:text-6xl font-extrabold text-white mb-4'
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className='text-white/70 text-lg max-w-xl mx-auto'>
            Find answers to the most common questions about our products and
            services.
          </p>
        </div>
      </section>

      <section className='py-20'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
          {faqs.length === 0 ? (
            <div className='text-center py-16 text-muted-foreground'>
              <HelpCircle className='w-16 h-16 mx-auto mb-4 opacity-20' />
              <p className='text-lg'>No FAQs available yet. Check back soon.</p>
            </div>
          ) : (
            <Accordion type='single' collapsible className='space-y-3'>
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className='border rounded-xl px-6 bg-white shadow-sm data-[state=open]:shadow-md transition-shadow'
                >
                  <AccordionTrigger className='text-left font-semibold hover:no-underline py-5'>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className='text-muted-foreground leading-relaxed pb-5'>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {/* Still have questions CTA */}
          <div className='mt-16 rounded-2xl p-8 text-center border-2 border-dashed'>
            <MessageSquare className='w-10 h-10 mx-auto mb-3 text-muted-foreground/40' />
            <h3
              className='text-xl font-bold mb-2'
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              STILL HAVE QUESTIONS?
            </h3>
            <p className='text-muted-foreground text-sm mb-6'>
              Can&apos;t find the answer you&apos;re looking for? Our team is
              happy to help.
            </p>
            <Button asChild>
              <Link href='/contact'>Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
