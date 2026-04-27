import prisma from '@/lib/prisma'
import CompanyForm from './CompanyForm'

export const metadata = { title: 'Company Settings' }

export default async function AdminCompanyPage() {
  const company = await prisma.companyDetails.findFirst()
  return (
    <div className='space-y-6'>
      <div>
        <h1
          className='text-2xl font-bold'
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          COMPANY SETTINGS
        </h1>
        <p className='text-sm text-muted-foreground'>
          Manage your company information shown on the website.
        </p>
      </div>
      <CompanyForm
        initialData={company ? JSON.parse(JSON.stringify(company)) : null}
      />
    </div>
  )
}
