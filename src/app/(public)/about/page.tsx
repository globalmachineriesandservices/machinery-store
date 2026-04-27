import prisma from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { FadeIn, StaggerContainer, StaggerItem } from '../HomeAnimations'
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Link2,
  Cog,
  ArrowRight,
  Shield,
  Zap,
  Headphones,
  Award,
  Users,
  Package,
  CheckCircle,
  TrendingUp,
  Wrench,
  Clock,
  Star,
} from 'lucide-react'

export const metadata = { title: 'About Us' }

const VALUES = [
  {
    icon: Shield,
    title: 'Reliability',
    desc: 'We supply only equipment that meets the highest reliability and safety standards for industrial and commercial use.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Award,
    title: 'Expertise',
    desc: 'Our team brings decades of combined technical knowledge across every product category we serve.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Users,
    title: 'Partnership',
    desc: 'We build lasting relationships — from the first inquiry through installation to ongoing after-sales support.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: TrendingUp,
    title: 'Innovation',
    desc: 'We stay ahead with the latest in energy generation, automation, and industrial machinery technology.',
    color: 'bg-purple-50 text-purple-600',
  },
]

const MILESTONES = [
  {
    year: '2008',
    event: 'Company founded with a focus on power generation equipment',
  },
  {
    year: '2012',
    event: 'Expanded into marine engines and agricultural machinery',
  },
  { year: '2016', event: 'Launched solar and renewable energy product line' },
  { year: '2020', event: 'Reached 1,000+ equipment deliveries nationwide' },
  {
    year: '2024',
    event: 'Full industrial and construction equipment catalogue launched',
  },
]

const COMMITMENTS = [
  'ISO-certified equipment from verified manufacturers',
  'OEM-authentic parts — no substitutes, ever',
  'Technical advisory available pre and post-purchase',
  'Transparent pricing — no hidden fees',
  'Nationwide delivery and logistics support',
  'After-sales service and warranty facilitation',
]

export default async function AboutPage() {
  const [company, totalProducts, totalCategories, totalInquiries] =
    await Promise.all([
      prisma.companyDetails.findFirst(),
      prisma.product.count(),
      prisma.category.count(),
      prisma.inquiry.count(),
    ])

  const socials = [
    { label: 'Facebook', href: company?.facebook },
    { label: 'Instagram', href: company?.instagram },
    { label: 'tiktok', href: company?.tiktok },
    { label: 'whatsApp', href: company?.whatsApp },
    { label: 'Twitter', href: company?.twitter },
  ].filter((s): s is { label: string; href: string } => !!s.href)

  const name = company?.name || 'MachineryStore'

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        className='relative py-28 overflow-hidden'
        style={{ background: 'hsl(var(--primary))' }}
      >
        <div className='absolute inset-0'>
          <div
            className='absolute inset-0'
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          <div
            className='absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-15'
            style={{
              background:
                'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)',
            }}
          />
        </div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <FadeIn>
            <p className='text-orange-400 text-sm font-bold uppercase tracking-widest mb-4'>
              Who We Are
            </p>
            <h1
              className='font-extrabold text-white mb-6'
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 'clamp(3rem,8vw,5.5rem)',
                lineHeight: 0.95,
              }}
            >
              ABOUT {name.toUpperCase()}
            </h1>
            <p className='text-white/65 text-lg leading-relaxed max-w-2xl mx-auto'>
              {company?.description ||
                'Your trusted partner for industrial machinery and power solutions. We connect businesses across the region with the equipment they need to operate at peak performance.'}
            </p>
            <div className='grid grid-cols-3 gap-6 max-w-xl mx-auto mt-12 pt-10 border-t border-white/10'>
              {[
                {
                  value: totalProducts > 0 ? `${totalProducts}+` : '500+',
                  label: 'Products',
                },
                {
                  value: totalCategories > 0 ? `${totalCategories}` : '10+',
                  label: 'Categories',
                },
                {
                  value: totalInquiries > 0 ? `${totalInquiries}+` : '1,000+',
                  label: 'Customers Served',
                },
              ].map((s) => (
                <div key={s.label}>
                  <p
                    className='text-4xl font-extrabold text-white'
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    {s.value}
                  </p>
                  <p className='text-white/50 text-sm mt-1'>{s.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Mission + Contact card ─────────────────────────────────── */}
      <section className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-start'>
            {/* Left */}
            <FadeIn direction='right'>
              <div className='flex items-center gap-4 mb-6'>
                {company?.logo ? (
                  <Image
                    src={company.logo}
                    alt={name}
                    width={64}
                    height={64}
                    className='rounded-2xl object-contain border'
                  />
                ) : (
                  <div
                    className='w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0'
                    style={{ background: 'hsl(var(--primary))' }}
                  >
                    <Cog className='w-8 h-8 text-white' />
                  </div>
                )}
                <div>
                  <h2
                    className='text-3xl font-extrabold'
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    {name.toUpperCase()}
                  </h2>
                  {company?.website && (
                    <a
                      href={company.website}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm text-primary hover:underline flex items-center gap-1 mt-0.5'
                    >
                      <Globe className='w-3.5 h-3.5' />
                      {company.website}
                    </a>
                  )}
                </div>
              </div>

              <p className='text-muted-foreground leading-relaxed mb-4'>
                {company?.description ||
                  'We are a leading supplier of industrial, agricultural, and commercial machinery. From generators and solar panels to marine engines and construction equipment — we source, supply, and support businesses that depend on reliable machinery.'}
              </p>
              <p className='text-muted-foreground leading-relaxed mb-8'>
                Founded on the principle that every business deserves access to
                quality equipment with full technical backing, we work directly
                with certified manufacturers to ensure every product meets
                international standards.
              </p>

              <div className='space-y-2.5 mb-8'>
                {COMMITMENTS.map((text) => (
                  <div key={text} className='flex items-center gap-3'>
                    <CheckCircle className='w-4 h-4 text-green-500 flex-shrink-0' />
                    <span className='text-sm'>{text}</span>
                  </div>
                ))}
              </div>

              {socials.length > 0 && (
                <div>
                  <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3'>
                    Follow Us Online
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {socials.map(({ href, label }) => (
                      <a
                        key={label}
                        href={href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-2 px-4 py-2 rounded-full border hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm font-medium'
                      >
                        <Link2 className='w-3.5 h-3.5' />
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </FadeIn>

            {/* Right — contact card */}
            <FadeIn direction='left' delay={0.15}>
              <div className='rounded-3xl border overflow-hidden shadow-sm'>
                <div
                  className='px-6 py-4'
                  style={{ background: 'hsl(var(--primary))' }}
                >
                  <p className='text-white font-bold text-sm uppercase tracking-widest'>
                    Contact Information
                  </p>
                </div>
                <div className='p-6 space-y-4 bg-muted/20'>
                  {[
                    {
                      icon: Mail,
                      bg: 'bg-orange-100',
                      iconColor: 'text-orange-600',
                      label: 'Email Address',
                      content: company?.email ? (
                        <a
                          href={`mailto:${company.email}`}
                          className='text-sm font-semibold hover:text-primary transition-colors'
                        >
                          {company.email}
                        </a>
                      ) : (
                        <span className='text-sm text-muted-foreground italic'>
                          Set via Admin → Company Settings
                        </span>
                      ),
                    },
                    {
                      icon: Phone,
                      bg: 'bg-blue-100',
                      iconColor: 'text-blue-600',
                      label: 'Phone Number',
                      content: company?.phone ? (
                        <a
                          href={`tel:${company.phone}`}
                          className='text-sm font-semibold hover:text-primary transition-colors'
                        >
                          {company.phone}
                        </a>
                      ) : (
                        <span className='text-sm text-muted-foreground italic'>
                          Set via Admin → Company Settings
                        </span>
                      ),
                    },
                    {
                      icon: MapPin,
                      bg: 'bg-green-100',
                      iconColor: 'text-green-600',
                      label: 'Physical Address',
                      content: company?.address ? (
                        <p className='text-sm font-semibold'>
                          {company.address}
                        </p>
                      ) : (
                        <span className='text-sm text-muted-foreground italic'>
                          Set via Admin → Company Settings
                        </span>
                      ),
                    },
                    {
                      icon: Clock,
                      bg: 'bg-purple-100',
                      iconColor: 'text-purple-600',
                      label: 'Business Hours',
                      content: (
                        <>
                          <p className='text-sm font-semibold'>
                            Mon – Fri: 8:00 AM – 6:00 PM
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            Saturday: 9:00 AM – 2:00 PM
                          </p>
                        </>
                      ),
                    },
                  ].map(({ icon: Icon, bg, iconColor, label, content }) => (
                    <div
                      key={label}
                      className='flex items-start gap-4 p-4 rounded-2xl bg-white border hover:border-primary/20 hover:shadow-sm transition-all'
                    >
                      <div
                        className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                      </div>
                      <div>
                        <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5'>
                          {label}
                        </p>
                        {content}
                      </div>
                    </div>
                  ))}

                  <Button
                    asChild
                    className='w-full h-12 font-semibold text-base rounded-xl'
                  >
                    <Link href='/contact'>
                      Send Us a Message <ArrowRight className='ml-2 w-4 h-4' />
                    </Link>
                  </Button>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Core Values ───────────────────────────────────────────── */}
      <section className='py-24 bg-muted/20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <FadeIn className='text-center mb-14'>
            <p className='text-orange-500 text-sm font-bold uppercase tracking-widest mb-3'>
              What Drives Us
            </p>
            <h2
              className='text-5xl font-extrabold'
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              OUR CORE VALUES
            </h2>
            <p className='text-muted-foreground mt-3 max-w-xl mx-auto'>
              These principles shape every decision we make and every product we
              supply.
            </p>
          </FadeIn>
          <StaggerContainer
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
            staggerDelay={0.1}
          >
            {VALUES.map(({ icon: Icon, title, desc, color }, i) => (
              <StaggerItem key={title}>
                <div className='bg-white rounded-2xl p-7 border hover:shadow-lg transition-all h-full flex flex-col'>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${color}`}
                  >
                    <Icon className='w-6 h-6' />
                  </div>
                  <div
                    className='w-8 h-1 rounded-full mb-4'
                    style={{ background: 'hsl(var(--accent))' }}
                  />
                  <h3
                    className='font-extrabold text-lg mb-3'
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    {title.toUpperCase()}
                  </h3>
                  <p className='text-sm text-muted-foreground leading-relaxed flex-1'>
                    {desc}
                  </p>
                  <p
                    className='mt-5 text-3xl font-extrabold text-muted-foreground/10'
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    0{i + 1}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Timeline ──────────────────────────────────────────────── */}
      <section className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-16 items-center'>
            <FadeIn direction='right'>
              <p className='text-orange-500 text-sm font-bold uppercase tracking-widest mb-3'>
                Our Story
              </p>
              <h2
                className='text-5xl font-extrabold mb-6'
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                BUILT ON YEARS
                <br />
                OF EXPERIENCE
              </h2>
              <p className='text-muted-foreground leading-relaxed mb-4'>
                What started as a small power equipment supplier has grown into
                a comprehensive industrial machinery company serving businesses
                across multiple sectors.
              </p>
              <p className='text-muted-foreground leading-relaxed'>
                Every year we&apos;ve expanded our product catalogue, deepened
                our manufacturer relationships, and strengthened our after-sales
                support to better serve our growing client base.
              </p>
            </FadeIn>
            <FadeIn direction='left' delay={0.15}>
              <div className='space-y-0'>
                {MILESTONES.map(({ year, event }, i) => (
                  <div key={year} className='flex gap-5 group'>
                    <div className='flex flex-col items-center'>
                      <div
                        className='w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0 z-10 group-hover:scale-110 transition-transform'
                        style={{
                          background:
                            i === MILESTONES.length - 1
                              ? 'hsl(var(--accent))'
                              : 'hsl(var(--primary))',
                        }}
                      >
                        {year.slice(2)}
                      </div>
                      {i < MILESTONES.length - 1 && (
                        <div
                          className='w-0.5 my-1'
                          style={{
                            background: 'hsl(var(--border))',
                            minHeight: '2rem',
                          }}
                        />
                      )}
                    </div>
                    <div className='pb-8 pt-1.5 flex-1'>
                      <p
                        className='font-extrabold'
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '1rem',
                        }}
                      >
                        {year}
                      </p>
                      <p className='text-sm text-muted-foreground mt-0.5'>
                        {event}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Why Work With Us ──────────────────────────────────────── */}
      <section
        className='py-24 relative overflow-hidden'
        style={{ background: 'hsl(var(--primary))' }}
      >
        <div
          className='absolute inset-0 opacity-5'
          style={{
            backgroundImage:
              'repeating-linear-gradient(-45deg,transparent,transparent 25px,white 25px,white 26px)',
          }}
        />
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <FadeIn className='text-center mb-14'>
            <p className='text-orange-400 text-sm font-bold uppercase tracking-widest mb-3'>
              The Difference
            </p>
            <h2
              className='text-5xl font-extrabold text-white'
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              WHY WORK WITH US
            </h2>
          </FadeIn>
          <StaggerContainer
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
            staggerDelay={0.09}
          >
            {[
              {
                icon: Shield,
                title: 'Certified Equipment',
                desc: 'Every product sourced from manufacturers holding valid ISO, CE, or industry-specific certifications.',
              },
              {
                icon: Zap,
                title: 'Fast Response',
                desc: 'Inquiries acknowledged within hours. Quotes delivered within 24 hours of your request.',
              },
              {
                icon: Headphones,
                title: 'Dedicated Support',
                desc: 'A real technical advisor handles your account — not a ticket system.',
              },
              {
                icon: Package,
                title: 'Full Catalogue',
                desc: 'Generators, solar, marine, pumps, construction, and agricultural — all under one roof.',
              },
              {
                icon: Wrench,
                title: 'After-Sales Care',
                desc: 'We remain your point of contact for servicing, spares, and warranty claims.',
              },
              {
                icon: Star,
                title: 'Trusted by Many',
                desc: 'Hundreds of businesses across the region rely on our equipment every day.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <StaggerItem key={title}>
                <div className='p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-orange-400/30 transition-all h-full'>
                  <div
                    className='w-12 h-12 rounded-xl flex items-center justify-center mb-4'
                    style={{ background: 'rgba(249,115,22,0.15)' }}
                  >
                    <Icon className='w-6 h-6 text-orange-400' />
                  </div>
                  <h3
                    className='font-bold text-white mb-2'
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '1.05rem',
                    }}
                  >
                    {title.toUpperCase()}
                  </h3>
                  <p className='text-sm text-white/55 leading-relaxed'>
                    {desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className='py-20 bg-white'>
        <div className='max-w-3xl mx-auto px-4 text-center'>
          <FadeIn>
            <p className='text-orange-500 text-sm font-bold uppercase tracking-widest mb-3'>
              Let&apos;s Work Together
            </p>
            <h2
              className='text-5xl font-extrabold mb-4'
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              READY TO GET STARTED?
            </h2>
            <p className='text-muted-foreground mb-10 text-lg leading-relaxed'>
              Reach out to our team for expert guidance on the right equipment
              for your operation. No obligation — just honest advice.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button
                asChild
                size='lg'
                className='h-13 px-10 text-base font-bold rounded-xl'
              >
                <Link href='/contact'>
                  Contact Us <ArrowRight className='ml-2 w-5 h-5' />
                </Link>
              </Button>
              <Button
                asChild
                size='lg'
                variant='outline'
                className='h-13 px-10 text-base font-semibold rounded-xl'
              >
                <Link href='/products'>Browse Products</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
