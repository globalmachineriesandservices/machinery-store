import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export const metadata = { title: { template: '%s | Admin — MachineryStore' } }

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/auth/login')

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <div className='flex flex-1 flex-col gap-4 p-4 md:p-6 bg-muted/30 overflow-y-auto'>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
