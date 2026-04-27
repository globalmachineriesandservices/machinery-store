import prisma from '@/lib/prisma'
import FAQsClient from './FAQsClient'

export const metadata = { title: 'FAQs' }

export default async function AdminFAQsPage() {
  const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } })
  return (
    <div className='space-y-6'>
      <div>
        <h1
          className='text-2xl font-bold'
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          FREQUENTLY ASKED QUESTIONS
        </h1>
        <p className='text-sm text-muted-foreground'>{faqs.length} FAQs</p>
      </div>
      <FAQsClient initialFaqs={JSON.parse(JSON.stringify(faqs))} />
    </div>
  )
}
