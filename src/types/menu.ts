import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

export type MenuItem = {
    label: string
    path?: string
    icon?: LucideIcon
    children?: MenuItem[]
}
