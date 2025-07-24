import { MenuItem } from '@/types/menu'

import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    LogOut,
    ClipboardCheck,
    History,
    Home,
    Banknote,
    Trash2,
} from 'lucide-react'

export const navMain: Record<string, MenuItem[]> = {
    SUPER_USER: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        {
            label: 'Lingkungan',
            icon: Home,
            children: [
                { label: 'Kas Lingkungan', path: '/lingkungan/kas' },
                { label: 'Dana Mandiri', path: '/lingkungan/mandiri' },
            ],
        },
        { 
            label: 'IKATA', 
            icon: Banknote,
            children: [
                { label: 'Kas IKATA', path: '/ikata/kas' },
                { label: 'Monitoring Penunggak', path: '/ikata/monitoring' },
            ],
        },
        {
            label: 'Kesekretariatan',
            icon: Users,
            children: [
                { label: 'Data Umat', path: '/kesekretariatan/umat' },
                { label: 'Doa Lingkungan', path: '/kesekretariatan/doling' },
                { label: 'Kaleidoskop', path: '/kesekretariatan/kaleidoskop' },
                { label: 'Agenda', path: '/kesekretariatan/agenda' },
            ],
        },
        { label: 'Publikasi', path: '/publikasi', icon: FileText },
        { label: 'Approval', path: '/approval', icon: ClipboardCheck },
        { label: 'Histori Pembayaran', path: '/histori-pembayaran', icon: History },
        {
            label: 'Pengaturan',
            icon: Settings,
            children: [
                { label: 'Profil', path: '/pengaturan/profil' },
                { label: 'Ganti Password', path: '/pengaturan/password' },
                { label: 'Wipe Data', path: '/pengaturan/wipe', icon: Trash2 },
            ],
        },
    ],

    KETUA: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        {
            label: 'Kesekretariatan',
            icon: Users,
            children: [
                { label: 'Data Umat', path: '/kesekretariatan/umat' },
                { label: 'Doa Lingkungan', path: '/kesekretariatan/doling' },
                { label: 'Agenda', path: '/kesekretariatan/agenda' },
            ],
        },
        { label: 'Publikasi', path: '/publikasi', icon: FileText },
        {
            label: 'Pengaturan',
            icon: Settings,
            children: [
                { label: 'Ganti Password', path: '/pengaturan/password' },
            ],
        },
    ],

    WAKIL_KETUA: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        {
            label: 'Kesekretariatan',
            icon: Users,
            children: [
                { label: 'Data Umat', path: '/kesekretariatan/umat' },
                { label: 'Doa Lingkungan', path: '/kesekretariatan/doling' },
                { label: 'Agenda', path: '/kesekretariatan/agenda' },
            ],
        },
        { label: 'Publikasi', path: '/publikasi', icon: FileText },
        {
            label: 'Pengaturan',
            icon: Settings,
            children: [
                { label: 'Ganti Password', path: '/pengaturan/password' },
            ],
        },
    ],

    SEKRETARIS: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        {
            label: 'Kesekretariatan',
            icon: Users,
            children: [
                { label: 'Data Umat', path: '/kesekretariatan/umat' },
                { label: 'Doa Lingkungan', path: '/kesekretariatan/doling' },
                { label: 'Kaleidoskop', path: '/kesekretariatan/kaleidoskop' },
                { label: 'Agenda', path: '/kesekretariatan/agenda' },
            ],
        },
        { label: 'Publikasi', path: '/publikasi', icon: FileText },
        {
            label: 'Pengaturan',
            icon: Settings,
            children: [
                { label: 'Ganti Password', path: '/pengaturan/password' },
            ],
        },
    ],

    WAKIL_SEKRETARIS: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        {
            label: 'Kesekretariatan',
            icon: Users,
            children: [
                { label: 'Data Umat', path: '/kesekretariatan/umat' },
                { label: 'Doa Lingkungan', path: '/kesekretariatan/doling' },
                { label: 'Kaleidoskop', path: '/kesekretariatan/kaleidoskop' },
                { label: 'Agenda', path: '/kesekretariatan/agenda' },
            ],
        },
        { label: 'Publikasi', path: '/publikasi', icon: FileText },
        {
            label: 'Pengaturan',
            icon: Settings,
            children: [
                { label: 'Ganti Password', path: '/pengaturan/password' },
            ],
        },
    ],

    BENDAHARA: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        {
            label: 'Lingkungan',
            icon: Home,
            children: [
                { label: 'Kas Lingkungan', path: '/lingkungan/kas' },
                { label: 'Dana Mandiri', path: '/lingkungan/mandiri' },
            ],
        },
        { label: 'Approval', path: '/approval', icon: ClipboardCheck },
        {
            label: 'Kesekretariatan',
            icon: Users,
            children: [
                { label: 'Agenda', path: '/kesekretariatan/agenda' },
            ],
        },
        { label: 'Publikasi', path: '/publikasi', icon: FileText },
        {
            label: 'Pengaturan',
            icon: Settings,
            children: [
                { label: 'Ganti Password', path: '/pengaturan/password' },
            ],
        },
    ],

    WAKIL_BENDAHARA: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { 
            label: 'IKATA', 
            icon: Banknote,
            children: [
                { label: 'Kas IKATA', path: '/ikata/kas' },
                { label: 'Monitoring Penunggak', path: '/ikata/monitoring' },
            ],
        },
        {
            label: 'Kesekretariatan',
            icon: Users,
            children: [
                { label: 'Agenda', path: '/kesekretariatan/agenda' },
            ],
        },
        { label: 'Publikasi', path: '/publikasi', icon: FileText },
        {
            label: 'Pengaturan',
            icon: Settings,
            children: [
                { label: 'Ganti Password', path: '/pengaturan/password' },
            ],
        },
    ],

    UMAT: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        {
            label: 'Kesekretariatan',
            icon: Users,
            children: [
                { label: 'Agenda', path: '/kesekretariatan/agenda' },
            ],
        },
        { label: 'Publikasi', path: '/publikasi', icon: FileText },
        { label: 'Histori Pembayaran', path: '/histori-pembayaran', icon: History },
        {
            label: 'Pengaturan',
            icon: Settings,
            children: [
                { label: 'Profil', path: '/pengaturan/profil' },
                { label: 'Ganti Password', path: '/pengaturan/password' },
            ],
        },
    ],

    guest: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Masuk', path: '/login', icon: LogOut },
    ],
}