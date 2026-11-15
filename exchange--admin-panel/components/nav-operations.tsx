"use client"

import { usePathname } from 'next/navigation'
import {
  IconChevronRight,
  type Icon,
} from "@tabler/icons-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

export function NavOperations({
  items,
  title = "Operaciones",
}: {
  items: {
    title: string
    url: string
    icon?: Icon
    items?: {
      title: string
      url: string
      items?: {
        title: string
        url: string
      }[]
    }[]
  }[]
  title?: string
}) {
  const pathname = usePathname()

  // Helper function to check if an item or its children match the current path
  const isItemActive = (item: any): boolean => {
    if (pathname === item.url) return true
    if (item.items) {
      return item.items.some((subItem: any) => {
        if (pathname === subItem.url) return true
        if (subItem.items) {
          return subItem.items.some((nestedItem: any) => pathname === nestedItem.url)
        }
        return false
      })
    }
    return false
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Si no tiene subitems, renderizar como enlace simple
          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          // Si tiene subitems, renderizar como collapsible
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isItemActive(item)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      // Si el subitem tiene sus propios items (nivel 3), renderizar como collapsible anidado
                      if (subItem.items && subItem.items.length > 0) {
                        const isSubItemActive = pathname === subItem.url || subItem.items.some((nested: any) => pathname === nested.url)
                        return (
                          <Collapsible
                            key={subItem.title}
                            asChild
                            defaultOpen={isSubItemActive}
                            className="group/collapsible-nested"
                          >
                            <SidebarMenuSubItem>
                              <CollapsibleTrigger asChild>
                                <SidebarMenuSubButton>
                                  <span>{subItem.title}</span>
                                  <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible-nested:rotate-90" />
                                </SidebarMenuSubButton>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <SidebarMenuSub>
                                  {subItem.items.map((nestedItem) => (
                                    <SidebarMenuSubItem key={nestedItem.title}>
                                      <SidebarMenuSubButton asChild>
                                        <a href={nestedItem.url}>
                                          <span>{nestedItem.title}</span>
                                        </a>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </SidebarMenuSubItem>
                          </Collapsible>
                        )
                      }
                      
                      // Si no tiene items anidados, renderizar como enlace simple
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
