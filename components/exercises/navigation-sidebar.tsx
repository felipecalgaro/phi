import { Navigation, Calculator, FileText, Target, LayoutPanelLeft } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar'
import Link from 'next/link'

const items = [
  {
    title: "Math",
    url: "/exercises/math",
    icon: Calculator,
  },
  {
    title: "C-Test",
    url: "/exercises/c-test",
    icon: FileText,
  },
  {
    title: "Home",
    url: "/exercises",
    icon: LayoutPanelLeft,
  },
  {
    title: "Acing Aufnahmetest",
    url: "/acing-aufnahmetest",
    icon: Target,
  },
]

export function NavigationSidebar() {

  return (
    <Sidebar side='right'>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className='mb-2 md:hidden'>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href='/'>
              <Navigation />
              <span>Guide to Studienkolleg</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  )
}