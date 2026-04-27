import prisma from '@/lib/prisma'
import ContactForm from './ContactForm'
import { Mail, Phone, MapPin, Clock, Link2 } from 'lucide-react'

export const metadata = { title: 'Contact Us' }

export default async function ContactPage() {
  const company = await prisma.companyDetails.findFirst()

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
              'repeating-linear-gradient(-45deg, transparent, transparent 30px, rgba(255,255,255,0.02) 30px, rgba(255,255,255,0.02) 60px)',
          }}
        />
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <p className='text-orange-400 text-sm font-bold uppercase tracking-widest mb-3'>
            Reach Out
          </p>
          <h1
            className='text-5xl sm:text-6xl font-extrabold text-white mb-4'
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            CONTACT US
          </h1>
          <p className='text-white/70 text-lg max-w-xl mx-auto'>
            Have a question or need a quote? Our team is ready to help you find
            the right equipment.
          </p>
        </div>
      </section>

      <section className='py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-5 gap-12'>
            {/* Contact info */}
            <div className='lg:col-span-2 space-y-6'>
              <div>
                <h2
                  className='text-2xl font-extrabold mb-2'
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  GET IN TOUCH
                </h2>
                <p className='text-muted-foreground text-sm'>
                  We&apos;d love to hear from you. Send us a message and
                  we&apos;ll respond as soon as possible.
                </p>
              </div>

              <div className='space-y-4'>
                {company?.email && (
                  <div className='flex items-start gap-4 p-4 rounded-xl bg-muted/40 border'>
                    <div className='w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0'>
                      <Mail className='w-5 h-5 text-orange-600' />
                    </div>
                    <div>
                      <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                        Email
                      </p>
                      <a
                        href={`mailto:${company.email}`}
                        className='text-sm font-medium hover:text-primary transition-colors mt-0.5 block'
                      >
                        {company.email}
                      </a>
                    </div>
                  </div>
                )}
                {company?.phone && (
                  <div className='flex items-start gap-4 p-4 rounded-xl bg-muted/40 border'>
                    <div className='w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0'>
                      <Phone className='w-5 h-5 text-blue-600' />
                    </div>
                    <div>
                      <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                        Phone
                      </p>
                      <a
                        href={`tel:${company.phone}`}
                        className='text-sm font-medium hover:text-primary transition-colors mt-0.5 block'
                      >
                        {company.phone}
                      </a>
                    </div>
                  </div>
                )}
                {company?.address && (
                  <div className='flex items-start gap-4 p-4 rounded-xl bg-muted/40 border'>
                    <div className='w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0'>
                      <MapPin className='w-5 h-5 text-green-600' />
                    </div>
                    <div>
                      <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                        Address
                      </p>
                      <p className='text-sm font-medium mt-0.5'>
                        {company.address}
                      </p>
                    </div>
                  </div>
                )}
                <div className='flex items-start gap-4 p-4 rounded-xl bg-muted/40 border'>
                  <div className='w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0'>
                    <Clock className='w-5 h-5 text-purple-600' />
                  </div>
                  <div>
                    <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                      Business Hours
                    </p>
                    <p className='text-sm font-medium mt-0.5'>
                      Mon–Fri: 8:00 AM – 6:00 PM
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Saturday: 9:00 AM – 2:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Social links */}
              {company && (
                <div>
                  <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3'>
                    Follow Us
                  </p>
                  <div className='flex gap-2'>
                    {[
                      { label: 'Facebook', href: company.facebook },
                      { label: 'Twitter', href: company.twitter },
                      { label: 'tiktok', href: company.tiktok },
                      { label: 'Instagram', href: company.instagram },
                    ]
                      .filter(
                        (s): s is { label: string; href: string } => !!s.href,
                      )
                      .map(({ href, label }) => (
                        <a
                          key={label}
                          href={href}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-1 px-2 py-1 text-xs rounded border hover:bg-primary hover:text-white hover:border-primary transition-colors'
                        >
                          <Link2 className='w-3 h-3' />
                          {label}
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact form */}
            <div className='lg:col-span-3'>
              <div className='bg-white rounded-2xl border shadow-sm p-8'>
                <h2
                  className='text-xl font-bold mb-6'
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  SEND A MESSAGE
                </h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
