import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ProductCard from '@/components/shared/ProductCard'
import HeroEntrance, {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  CountUp,
} from './HomeAnimations'
import {
  ArrowRight,
  Zap,
  Shield,
  Headphones,
  Truck,
  ChevronRight,
  Star,
  Package,
  CheckCircle,
  Award,
  Users,
  TrendingUp,
  Wrench,
  Factory,
  Gauge,
  Battery,
  Anchor,
  Tractor,
  HardHat,
  Sun,
  Phone,
  Mail,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  BadgeCheck,
  Cog,
} from 'lucide-react'

export const metadata = {
  title: 'Industrial Machinery & Equipment Solutions',
}

async function getHomeData() {
  const [featuredProducts, categories, company, totalProducts, totalInquiries] =
    await Promise.all([
      prisma.product.findMany({
        where: { featured: true, inStock: true },
        include: {
          category: true,
          _count: { select: { reviews: true, inquiries: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 6,
      }),
      prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: 'asc' },
      }),
      prisma.companyDetails.findFirst(),
      prisma.product.count(),
      prisma.inquiry.count(),
    ])
  return {
    featuredProducts,
    categories,
    company,
    totalProducts,
    totalInquiries,
  }
}

const INDUSTRIES = [
  {
    icon: Factory,
    label: 'Manufacturing',
    desc: 'Heavy-duty equipment for production lines',
  },
  {
    icon: HardHat,
    label: 'Construction',
    desc: 'Reliable machinery for every build',
  },
  { icon: Anchor, label: 'Marine', desc: 'Engines and systems for watercraft' },
  {
    icon: Tractor,
    label: 'Agriculture',
    desc: 'Efficient machines for modern farming',
  },
  { icon: Sun, label: 'Energy', desc: 'Solar and power generation solutions' },
  {
    icon: Gauge,
    label: 'Industrial',
    desc: 'Pumps and systems for heavy industry',
  },
]

const TESTIMONIALS = [
  {
    quote:
      'The generator we sourced has been running our factory for two years without a single failure. Exceptional quality and prompt delivery.',
    name: 'Kwame Asante',
    role: 'Operations Manager, Asante Steel Works',
    rating: 5,
  },
  {
    quote:
      'Their solar panel installation cut our energy costs by 60%. The technical team walked us through every step of the process.',
    name: 'Fatima Al-Hassan',
    role: 'CEO, Al-Hassan Agro Industries',
    rating: 5,
  },
  {
    quote:
      'Outstanding marine engine supply with full specs and after-sales support. Exactly what our fishing fleet needed.',
    name: 'James Okafor',
    role: 'Fleet Manager, Okafor Marine Co.',
    rating: 5,
  },
]

const WHY_US = [
  {
    icon: ShieldCheck,
    title: 'Quality Guaranteed',
    desc: 'All equipment sourced from certified manufacturers meeting ISO and CE standards.',
  },
  {
    icon: Zap,
    title: 'Fast Turnaround',
    desc: 'Streamlined procurement and logistics — from inquiry to delivery in record time.',
  },
  {
    icon: Headphones,
    title: 'Expert Support',
    desc: 'Dedicated technical advisors available throughout your equipment lifecycle.',
  },
  {
    icon: BadgeCheck,
    title: 'Genuine Parts',
    desc: 'Only authentic, OEM-certified equipment and components — no substitutes.',
  },
]

export default async function HomePage() {
  const {
    featuredProducts,
    categories,
    company,
    totalProducts,
    totalInquiries,
  } = await getHomeData()

  return (
    <div className='overflow-hidden'>
      {/* ─────────────────────────────────────────────────────────────
          HERO
      ───────────────────────────────────────────────────────────── */}
      <section
        className='relative min-h-screen flex items-center overflow-hidden'
        style={{ background: 'hsl(var(--primary))' }}
      >
        {/* Background layers */}
        <div className='absolute inset-0'>
          {/* Grid */}
          <div
            className='absolute inset-0'
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          {/* Radial glow */}
          <div
            className='absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-20'
            style={{
              background:
                'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)',
            }}
          />
          <div
            className='absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-10'
            style={{
              background: 'radial-gradient(circle, white 0%, transparent 70%)',
            }}
          />
          {/* Diagonal stripe */}
          <div
            className='absolute inset-0 opacity-5'
            style={{
              backgroundImage:
                'repeating-linear-gradient(60deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)',
            }}
          />
        </div>

        <HeroEntrance>
          <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32'>
            <div className='grid lg:grid-cols-2 gap-16 items-center'>
              {/* LEFT */}
              <div>
                <div className='inline-flex items-center gap-2.5 rounded-full px-4 py-2 mb-8 text-xs font-semibold uppercase tracking-widest border border-orange-400/30 bg-orange-400/10 text-orange-300'>
                  <div className='w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse' />
                  Industrial Equipment Specialists
                </div>

                <h1
                  className='font-extrabold text-white leading-[0.92] mb-6'
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 'clamp(3.2rem, 8vw, 6rem)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  POWER YOUR
                  <br />
                  <span
                    style={{
                      color: 'hsl(var(--accent))',
                      WebkitTextStroke: '1px hsl(var(--accent))',
                    }}
                  >
                    OPERATIONS
                  </span>
                  <br />
                  WITH CONFIDENCE
                </h1>

                <p className='text-white/65 text-lg leading-relaxed max-w-lg mb-10'>
                  {company?.description ||
                    'Premium generators, solar systems, marine engines, pumps, and industrial machinery — delivered with expert support from inquiry to installation.'}
                </p>

                <div className='flex flex-wrap gap-4 mb-12'>
                  <Button
                    asChild
                    size='lg'
                    className='h-13 px-8 font-bold text-base rounded-xl bg-orange-500 hover:bg-orange-400 text-white border-0 shadow-lg shadow-orange-500/30'
                  >
                    <Link href='/products'>
                      Explore Products <ArrowRight className='ml-2 w-5 h-5' />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size='lg'
                    variant='outline'
                    className='h-13 px-8 font-semibold text-base rounded-xl border-white/20 bg-white/8 text-white hover:bg-white/15 hover:text-white hover:border-white/40'
                  >
                    <Link href='/contact'>Request a Quote</Link>
                  </Button>
                </div>

                {/* Trust badges */}
                <div className='flex flex-wrap gap-3'>
                  {[
                    'ISO Certified Products',
                    'OEM Authentic Parts',
                    '24/7 Technical Support',
                    'Nationwide Delivery',
                  ].map((badge) => (
                    <span
                      key={badge}
                      className='flex items-center gap-1.5 text-xs font-medium text-white/60 bg-white/8 border border-white/10 rounded-full px-3 py-1.5'
                    >
                      <CheckCircle className='w-3 h-3 text-green-400 flex-shrink-0' />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* RIGHT — Category mosaic */}
              <div className='hidden lg:block'>
                <div className='grid grid-cols-2 gap-3'>
                  {(categories.length > 0
                    ? categories.slice(0, 4)
                    : [
                        {
                          id: '1',
                          name: 'Generators',
                          image: null,
                          _count: { products: 0 },
                        },
                        {
                          id: '2',
                          name: 'Solar Panels',
                          image: null,
                          _count: { products: 0 },
                        },
                        {
                          id: '3',
                          name: 'Marine Engines',
                          image: null,
                          _count: { products: 0 },
                        },
                        {
                          id: '4',
                          name: 'Water Pumps',
                          image: null,
                          _count: { products: 0 },
                        },
                      ]
                  ).map(
                    (
                      cat: {
                        id: string
                        name: string
                        image: string | null
                        _count: { products: number }
                      },
                      i: number,
                    ) => (
                      <Link
                        key={cat.id}
                        href={`/products?categoryId=${cat.id}`}
                        className={`relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:border-orange-400/50 transition-all duration-300 ${i === 0 ? 'row-span-2 aspect-[4/5]' : 'aspect-square'}`}
                      >
                        {cat.image ? (
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            className='object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500'
                            sizes='220px'
                          />
                        ) : (
                          <div
                            className='absolute inset-0 flex items-center justify-center'
                            style={{
                              background: `hsl(${215 + i * 15} 40% ${18 + i * 4}%)`,
                            }}
                          >
                            <Cog className='w-14 h-14 text-white/10' />
                          </div>
                        )}
                        <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent' />
                        <div className='absolute bottom-0 left-0 right-0 p-4'>
                          <p
                            className='text-white font-extrabold leading-tight'
                            style={{
                              fontFamily: "'Barlow Condensed', sans-serif",
                              fontSize: '1.05rem',
                            }}
                          >
                            {cat.name.toUpperCase()}
                          </p>
                          <p className='text-white/50 text-xs mt-0.5'>
                            {cat._count.products} products
                          </p>
                        </div>
                        <div className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity'>
                          <div className='w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center'>
                            <ArrowUpRight className='w-3.5 h-3.5 text-white' />
                          </div>
                        </div>
                      </Link>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className='absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-white/30'>
              <span className='text-xs tracking-widest uppercase'>Scroll</span>
              <div className='w-px h-12 bg-gradient-to-b from-white/30 to-transparent' />
            </div>
          </div>
        </HeroEntrance>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          LIVE STATS BAR
      ───────────────────────────────────────────────────────────── */}
      <section className='bg-orange-500 py-5'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-6 text-white text-center'>
            {[
              {
                value: totalProducts,
                suffix: '+',
                label: 'Products Available',
              },
              {
                value: categories.length,
                suffix: '',
                label: 'Product Categories',
              },
              {
                value: totalInquiries,
                suffix: '+',
                label: 'Customer Inquiries',
              },
              { value: 24, suffix: '/7', label: 'Technical Support' },
            ].map(({ value, suffix, label }) => (
              <div key={label}>
                <p
                  className='font-extrabold text-3xl leading-none'
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  <CountUp end={value} suffix={suffix} />
                </p>
                <p className='text-white/75 text-sm mt-1'>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CATEGORIES SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className='py-24 bg-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <FadeIn>
              <div className='flex items-end justify-between mb-12'>
                <div>
                  <p className='text-orange-500 text-sm font-bold uppercase tracking-widest mb-2'>
                    Browse By Type
                  </p>
                  <h2
                    className='text-5xl font-extrabold'
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    EQUIPMENT CATEGORIES
                  </h2>
                  <p className='text-muted-foreground mt-2 max-w-lg'>
                    From power generation to agricultural machinery — find
                    exactly what your operation needs.
                  </p>
                </div>
                <Button asChild variant='outline' className='hidden sm:flex'>
                  <Link href='/products'>
                    All Products <ChevronRight className='ml-1 w-4 h-4' />
                  </Link>
                </Button>
              </div>
            </FadeIn>

            <StaggerContainer
              className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
              staggerDelay={0.07}
            >
              {categories.map((cat: (typeof categories)[0]) => (
                <StaggerItem key={cat.id}>
                  <Link
                    href={`/products?categoryId=${cat.id}`}
                    className='group flex flex-col rounded-2xl overflow-hidden border bg-muted/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300'
                  >
                    <div className='relative aspect-[4/3] overflow-hidden bg-muted'>
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          fill
                          className='object-cover group-hover:scale-105 transition-transform duration-500'
                          sizes='220px'
                        />
                      ) : (
                        <div
                          className='absolute inset-0 flex items-center justify-center'
                          style={{ background: 'hsl(var(--primary) / 0.06)' }}
                        >
                          <Package
                            className='w-10 h-10'
                            style={{ color: 'hsl(var(--primary) / 0.3)' }}
                          />
                        </div>
                      )}
                    </div>
                    <div className='p-4'>
                      <p
                        className='font-bold text-sm group-hover:text-primary transition-colors'
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '1rem',
                        }}
                      >
                        {cat.name.toUpperCase()}
                      </p>
                      <div className='flex items-center justify-between mt-1'>
                        <span className='text-xs text-muted-foreground'>
                          {cat._count.products} products
                        </span>
                        <ArrowUpRight className='w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all' />
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <div className='mt-6 sm:hidden text-center'>
              <Button asChild variant='outline'>
                <Link href='/products'>
                  View All Products <ChevronRight className='ml-1 w-4 h-4' />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          INDUSTRIES WE SERVE — diagonal bg
      ───────────────────────────────────────────────────────────── */}
      <section
        className='py-24 relative overflow-hidden'
        style={{ background: 'hsl(var(--primary))' }}
      >
        <div
          className='absolute inset-0 opacity-5'
          style={{
            backgroundImage:
              'repeating-linear-gradient(-45deg, transparent, transparent 30px, white 30px, white 31px)',
          }}
        />
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <FadeIn className='text-center mb-14'>
            <p className='text-orange-400 text-sm font-bold uppercase tracking-widest mb-3'>
              Who We Serve
            </p>
            <h2
              className='text-5xl font-extrabold text-white'
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              INDUSTRIES WE POWER
            </h2>
            <p className='text-white/55 mt-3 max-w-xl mx-auto'>
              Trusted by businesses across six major industries for reliable
              equipment supply and support.
            </p>
          </FadeIn>

          <StaggerContainer
            className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4'
            staggerDelay={0.08}
          >
            {INDUSTRIES.map(({ icon: Icon, label, desc }) => (
              <StaggerItem key={label}>
                <div className='group flex flex-col items-center text-center p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-orange-400/40 transition-all duration-300 cursor-default'>
                  <div
                    className='w-14 h-14 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform'
                    style={{ background: 'rgba(249,115,22,0.15)' }}
                  >
                    <Icon className='w-7 h-7 text-orange-400' />
                  </div>
                  <p
                    className='font-bold text-white text-sm'
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '0.95rem',
                    }}
                  >
                    {label.toUpperCase()}
                  </p>
                  <p className='text-white/40 text-xs mt-1 leading-relaxed'>
                    {desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          FEATURED PRODUCTS
      ───────────────────────────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className='py-24 bg-muted/20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <FadeIn>
              <div className='flex items-end justify-between mb-12'>
                <div>
                  <p className='text-orange-500 text-sm font-bold uppercase tracking-widest mb-2'>
                    Hand-Picked For You
                  </p>
                  <h2
                    className='text-5xl font-extrabold'
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    FEATURED EQUIPMENT
                  </h2>
                  <p className='text-muted-foreground mt-2'>
                    Our most sought-after products — built for performance,
                    built to last.
                  </p>
                </div>
                <Button asChild variant='outline' className='hidden sm:flex'>
                  <Link href='/products'>
                    View All <ChevronRight className='ml-1 w-4 h-4' />
                  </Link>
                </Button>
              </div>
            </FadeIn>

            <StaggerContainer
              className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              staggerDelay={0.1}
            >
              {featuredProducts.map((product: (typeof featuredProducts)[0]) => (
                <StaggerItem key={product.id}>
                  <ProductCard product={JSON.parse(JSON.stringify(product))} />
                </StaggerItem>
              ))}
            </StaggerContainer>

            <FadeIn className='mt-10 text-center sm:hidden'>
              <Button asChild>
                <Link href='/products'>
                  View All Products <ArrowRight className='ml-2 w-4 h-4' />
                </Link>
              </Button>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          WHY CHOOSE US — split layout
      ───────────────────────────────────────────────────────────── */}
      <section className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-16 items-center'>
            {/* Left — text */}
            <FadeIn direction='right'>
              <p className='text-orange-500 text-sm font-bold uppercase tracking-widest mb-3'>
                Our Commitment
              </p>
              <h2
                className='text-5xl font-extrabold mb-6'
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                WHY BUSINESSES
                <br />
                CHOOSE US
              </h2>
              <p className='text-muted-foreground leading-relaxed mb-8'>
                We don&apos;t just supply equipment — we build long-term
                relationships. From the first inquiry to ongoing after-sales
                support, our team is with you every step of the way.
              </p>
              <div className='space-y-4'>
                {WHY_US.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className='flex gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors'
                  >
                    <div
                      className='w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0'
                      style={{ background: 'hsl(var(--primary) / 0.08)' }}
                    >
                      <Icon
                        className='w-5 h-5'
                        style={{ color: 'hsl(var(--primary))' }}
                      />
                    </div>
                    <div>
                      <p
                        className='font-bold text-sm mb-0.5'
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '1rem',
                        }}
                      >
                        {title.toUpperCase()}
                      </p>
                      <p className='text-sm text-muted-foreground leading-relaxed'>
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Right — metric cards */}
            <FadeIn direction='left' delay={0.15}>
              <div className='grid grid-cols-2 gap-4'>
                {[
                  {
                    value: totalProducts,
                    suffix: '+',
                    label: 'Products in Stock',
                    icon: Package,
                    color: 'bg-blue-50 text-blue-600',
                  },
                  {
                    value: categories.length,
                    suffix: '',
                    label: 'Equipment Categories',
                    icon: Wrench,
                    color: 'bg-orange-50 text-orange-600',
                  },
                  {
                    value: totalInquiries,
                    suffix: '+',
                    label: 'Satisfied Customers',
                    icon: Users,
                    color: 'bg-green-50 text-green-600',
                  },
                  {
                    value: 100,
                    suffix: '%',
                    label: 'Genuine Equipment',
                    icon: Award,
                    color: 'bg-purple-50 text-purple-600',
                  },
                ].map(({ value, suffix, label, icon: Icon, color }) => (
                  <div
                    key={label}
                    className='p-6 rounded-2xl border bg-white hover:shadow-md transition-shadow'
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}
                    >
                      <Icon className='w-5 h-5' />
                    </div>
                    <p
                      className='text-4xl font-extrabold leading-none mb-1'
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      <CountUp end={value} suffix={suffix} />
                    </p>
                    <p className='text-sm text-muted-foreground'>{label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TESTIMONIALS
      ───────────────────────────────────────────────────────────── */}
      <section className='py-24 bg-muted/20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <FadeIn className='text-center mb-14'>
            <p className='text-orange-500 text-sm font-bold uppercase tracking-widest mb-3'>
              Client Stories
            </p>
            <h2
              className='text-5xl font-extrabold'
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              WHAT OUR CLIENTS SAY
            </h2>
            <p className='text-muted-foreground mt-3 max-w-lg mx-auto'>
              Real feedback from businesses that rely on our equipment every
              day.
            </p>
          </FadeIn>

          <StaggerContainer
            className='grid grid-cols-1 md:grid-cols-3 gap-6'
            staggerDelay={0.12}
          >
            {TESTIMONIALS.map(({ quote, name, role, rating }) => (
              <StaggerItem key={name}>
                <div className='bg-white rounded-2xl border p-7 flex flex-col gap-5 hover:shadow-lg transition-shadow h-full'>
                  {/* Stars */}
                  <div className='flex gap-0.5'>
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star
                        key={i}
                        className='w-4 h-4 fill-amber-400 text-amber-400'
                      />
                    ))}
                  </div>
                  {/* Quote */}
                  <blockquote className='text-sm leading-relaxed text-muted-foreground flex-1'>
                    &quot;{quote}&quot;
                  </blockquote>
                  {/* Author */}
                  <div className='flex items-center gap-3 pt-4 border-t'>
                    <div
                      className='w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0'
                      style={{ background: 'hsl(var(--primary))' }}
                    >
                      {name[0]}
                    </div>
                    <div>
                      <p className='font-semibold text-sm'>{name}</p>
                      <p className='text-xs text-muted-foreground'>{role}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          HOW IT WORKS
      ───────────────────────────────────────────────────────────── */}
      <section className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <FadeIn className='text-center mb-14'>
            <p className='text-orange-500 text-sm font-bold uppercase tracking-widest mb-3'>
              Simple Process
            </p>
            <h2
              className='text-5xl font-extrabold'
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              HOW IT WORKS
            </h2>
            <p className='text-muted-foreground mt-3 max-w-lg mx-auto'>
              Getting the right equipment for your business is straightforward
              with our streamlined process.
            </p>
          </FadeIn>

          <StaggerContainer
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative'
            staggerDelay={0.1}
          >
            {[
              {
                step: '01',
                title: 'Browse Products',
                desc: 'Explore our full catalogue and filter by category, availability, and specifications.',
                icon: Package,
              },
              {
                step: '02',
                title: 'Request Info',
                desc: 'Submit an inquiry directly on the product page — no account required.',
                icon: Mail,
              },
              {
                step: '03',
                title: 'Get a Quote',
                desc: 'Our team contacts you within 24 hours with pricing and technical details.',
                icon: Phone,
              },
              {
                step: '04',
                title: 'Take Delivery',
                desc: 'Confirm your order and we handle logistics to get equipment to you fast.',
                icon: Truck,
              },
            ].map(({ step, title, desc, icon: Icon }, i) => (
              <StaggerItem key={step}>
                <div className='relative flex flex-col gap-4 p-6 rounded-2xl border bg-muted/30 hover:bg-white hover:shadow-md transition-all'>
                  {/* Connector line */}
                  {i < 3 && (
                    <div className='hidden lg:block absolute top-10 -right-3 w-6 border-t-2 border-dashed border-muted-foreground/20 z-10' />
                  )}
                  <div className='flex items-center gap-3'>
                    <div
                      className='w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0'
                      style={{ background: 'hsl(var(--primary))' }}
                    >
                      <Icon className='w-5 h-5 text-white' />
                    </div>
                    <span
                      className='text-5xl font-extrabold text-muted-foreground/15 leading-none'
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      {step}
                    </span>
                  </div>
                  <div>
                    <h3
                      className='font-bold mb-1.5'
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '1.1rem',
                      }}
                    >
                      {title.toUpperCase()}
                    </h3>
                    <p className='text-sm text-muted-foreground leading-relaxed'>
                      {desc}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          COMPANY CONTACT STRIP (if company details exist)
      ───────────────────────────────────────────────────────────── */}
      {company && (
        <FadeIn>
          <section className='py-12 border-y bg-muted/30'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
              <div className='flex flex-col sm:flex-row items-center justify-between gap-6 text-sm'>
                <p
                  className='font-extrabold text-lg'
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {company.name.toUpperCase()}
                </p>
                <div className='flex flex-wrap items-center gap-6 text-muted-foreground'>
                  {company.phone && (
                    <a
                      href={`tel:${company.phone}`}
                      className='flex items-center gap-2 hover:text-primary transition-colors'
                    >
                      <Phone className='w-4 h-4 text-orange-500' />{' '}
                      {company.phone}
                    </a>
                  )}
                  {company.email && (
                    <a
                      href={`mailto:${company.email}`}
                      className='flex items-center gap-2 hover:text-primary transition-colors'
                    >
                      <Mail className='w-4 h-4 text-orange-500' />{' '}
                      {company.email}
                    </a>
                  )}
                  {company.address && (
                    <span className='flex items-center gap-2'>
                      <MapPin className='w-4 h-4 text-orange-500' />{' '}
                      {company.address}
                    </span>
                  )}
                </div>
                <Button asChild size='sm'>
                  <Link href='/contact'>Contact Us</Link>
                </Button>
              </div>
            </div>
          </section>
        </FadeIn>
      )}

      {/* ─────────────────────────────────────────────────────────────
          FINAL CTA BANNER
      ───────────────────────────────────────────────────────────── */}
      <section
        className='py-24 relative overflow-hidden'
        style={{ background: 'hsl(var(--primary))' }}
      >
        <div className='absolute inset-0'>
          <div
            className='absolute inset-0'
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 25px, rgba(255,255,255,0.02) 25px, rgba(255,255,255,0.02) 50px)',
            }}
          />
          <div
            className='absolute top-0 right-0 w-96 h-96 rounded-full opacity-15'
            style={{
              background:
                'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)',
            }}
          />
        </div>
        <div className='relative max-w-4xl mx-auto px-4 text-center'>
          <FadeIn>
            <div className='inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 rounded-full px-4 py-2 text-orange-300 text-xs font-bold uppercase tracking-widest mb-8'>
              <Zap className='w-3.5 h-3.5' /> Ready to Get Started?
            </div>
            <h2
              className='text-5xl sm:text-6xl font-extrabold text-white mb-6 leading-tight'
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              LET&apos;S POWER YOUR
              <br />
              <span style={{ color: 'hsl(var(--accent))' }}>NEXT PROJECT</span>
            </h2>
            <p className='text-white/65 text-lg mb-10 max-w-2xl mx-auto leading-relaxed'>
              Talk to our equipment specialists today. We&apos;ll help you find
              exactly what you need — with pricing, specs, and delivery
              timelines tailored to your requirements.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button
                asChild
                size='lg'
                className='h-14 px-10 text-base font-bold rounded-xl bg-orange-500 hover:bg-orange-400 text-white border-0 shadow-xl shadow-orange-500/30'
              >
                <Link href='/contact'>
                  Request a Quote <ArrowRight className='ml-2 w-5 h-5' />
                </Link>
              </Button>
              <Button
                asChild
                size='lg'
                variant='outline'
                className='h-14 px-10 text-base font-semibold rounded-xl border-white/20 bg-white/8 text-white hover:bg-white/15 hover:text-white hover:border-white/40'
              >
                <Link href='/products'>Browse All Products</Link>
              </Button>
            </div>

            {/* Bottom reassurances */}
            <div className='flex flex-wrap justify-center gap-6 mt-12 text-white/40 text-xs'>
              {[
                'No obligation quote',
                'Response within 24 hours',
                'Expert technical advice',
                'Competitive pricing',
              ].map((t) => (
                <span key={t} className='flex items-center gap-1.5'>
                  <CheckCircle className='w-3.5 h-3.5 text-green-400' /> {t}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
