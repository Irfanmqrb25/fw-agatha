import { NotificationClient } from "../components/notification-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail Notifikasi - Portal Administrasi Lingkungan St. Agatha",
  description: "Halaman detail notifikasi pada sistem administrasi lingkungan St. Agatha",
};

export default async function NotificationDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  return (
    <NotificationClient id={id} />
  );
} 