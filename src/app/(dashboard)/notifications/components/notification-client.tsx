"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Check, User, Link as LinkIcon, Delete } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { getNotificationById, markNotificationAsRead, deleteNotification } from "@/lib/notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function NotificationClient({ id }: { id: string }) {
    const router = useRouter();
    const [notification, setNotification] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotification = async () => {
            try {
                setLoading(true);
                setError(null);

                // Validasi ID terlebih dahulu
                if (!id || typeof id !== 'string') {
                    throw new Error("ID notifikasi tidak valid");
                }

                const data = await getNotificationById(id);

                if (!data) {
                    throw new Error("Notifikasi tidak ditemukan");
                }

                // Map data notifikasi sesuai dengan model di database
                setNotification({
                    id: data.id,
                    title: `Notifikasi #${data.id.substring(0, 8)}`, // Generate title dari ID
                    message: data.pesan,
                    type: data.type || "info", // Default ke "info" jika tidak ada
                    isRead: data.dibaca,
                    timestamp: new Date(data.createdAt),
                    senderId: data.senderId || "Sistem", 
                    relatedItemType: data.relatedItemType || null,
                    relatedItemId: data.relatedItemId || null
                });

                // Jika notifikasi belum dibaca, tandai sebagai dibaca
                if (!data.dibaca) {
                    await markNotificationAsRead(id);
                }
            } catch (error) {
                console.error("Error fetching notification:", error);
                const errorMessage = error instanceof Error 
                    ? error.message 
                    : "Gagal mengambil data notifikasi";
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchNotification();
    }, [id]);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            
            // Validasi ID terlebih dahulu
            if (!id || typeof id !== 'string') {
                throw new Error("ID notifikasi tidak valid");
            }
            
            const result = await deleteNotification(id);

            if (result.success) {
                toast.success("Notifikasi berhasil dihapus");
                router.push("/notifications");
            } else {
                toast.error(result.message || "Gagal menghapus notifikasi");
            }
        } catch (error) {
            console.error("Error deleting notification:", error);
            const errorMessage = error instanceof Error 
                ? error.message 
                : "Terjadi kesalahan saat menghapus notifikasi";
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    // Mendapatkan warna badge berdasarkan tipe notifikasi
    const getNotificationBadge = (type: string) => {
        switch (type) {
            case "success":
                return <Badge className="bg-green-500">Sukses</Badge>;
            case "error":
                return <Badge className="bg-red-500">Error</Badge>;
            case "warning":
                return <Badge className="bg-yellow-500">Peringatan</Badge>;
            default:
                return <Badge className="bg-blue-500">Info</Badge>;
        }
    };

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href="/notifications">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Daftar Notifikasi
                    </Link>
                </Button>
            </div>

            {loading ? (
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>
            ) : error ? (
                <Card>
                    <CardContent className="py-10 flex flex-col items-center">
                        <p className="text-lg font-medium mb-2">Error: {error}</p>
                        <p className="text-muted-foreground text-center mb-4">
                            Terjadi kesalahan saat mengambil data notifikasi
                        </p>
                        <Button asChild>
                            <Link href="/notifications">Kembali ke Daftar Notifikasi</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : notification ? (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">{notification.title}</CardTitle>
                                <CardDescription className="mt-1">
                                    {getNotificationBadge(notification.type)}
                                </CardDescription>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                <Delete className="h-4 w-4 mr-2" />
                                Hapus
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted rounded-md">
                            <p>{notification.message}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    {format(notification.timestamp, 'PPP pp', { locale: idLocale })}
                                </span>
                            </div>

                            {notification.senderId && (
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        Pengirim: {notification.senderId}
                                    </span>
                                </div>
                            )}

                            {notification.relatedItemType && notification.relatedItemId && (
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        Terkait dengan: {notification.relatedItemType} #{notification.relatedItemId}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-end">
                        <Button variant="outline" className="gap-2" disabled>
                            <Check className="h-4 w-4" />
                            {notification.isRead ? "Sudah Dibaca" : "Tandai Dibaca"}
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <Card>
                    <CardContent className="py-10 flex flex-col items-center">
                        <p className="text-lg font-medium mb-2">Notifikasi tidak ditemukan</p>
                        <p className="text-muted-foreground text-center mb-4">
                            Notifikasi yang Anda cari tidak tersedia atau telah dihapus
                        </p>
                        <Button asChild>
                            <Link href="/notifications">Kembali ke Daftar Notifikasi</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
