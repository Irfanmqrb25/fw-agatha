"use client"

import { useState } from "react"
import { type LucideIcon, ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { MenuItem } from "@/types/menu"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function NavMain({
  items,
}: {
  items: MenuItem[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.label}>
              {item.children ? (
                <NestedMenuItem item={item} pathname={pathname} />
              ) : (
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.path}
                  className={cn(
                    "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors", 
                    pathname === item.path ? "sidebar-active-menu" : ""
                  )}
                >
                  <Link href={item.path || '#'}>
                    {item.icon && <item.icon className="size-4" />}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function NestedMenuItem({ 
  item, 
  pathname 
}: { 
  item: MenuItem 
  pathname: string 
}) {
  const isActive = item.children?.some(child => pathname === child.path)
  const [open, setOpen] = useState(isActive || false)
  
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <SidebarMenuButton
          className={cn(
            "justify-between",
            isActive && "text-sidebar-accent-foreground sidebar-active-menu"
          )}
        >
          <div className="flex items-center gap-2">
            {item.icon && <item.icon className="size-4" />}
            <span>{item.label}</span>
          </div>
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub className="pl-6">
          {item.children?.map((child) => (
            <SidebarMenuSubItem key={child.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === child.path}
                className={cn(
                  "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors",
                  pathname === child.path ? "sidebar-active-menu" : ""
                )}
              >
                <Link href={child.path || '#'}>
                  {child.icon && <child.icon className="size-4" />}
                  <span>{child.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}
