"use client";

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { FamilyHeadFormDialog } from "./family-head-form-dialog"
import { FamilyHeadsTable } from "./family-heads-table"
import { ImportDialog } from "./import-dialog"
import { FamilyHead, FamilyHeadWithDetails, FamilyHeadFormValues } from "../types"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { AlertCircle, PlusIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { exportFamilyHeadTemplate } from "../utils/export-template"
import { addFamilyHead, getAllFamilyHeadsWithDetails, markFamilyAsDeceased, markFamilyAsMoved, markFamilyMemberAsDeceased, updateFamilyHead, permanentDeleteFamilyHead } from "../actions"

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import { CalendarDays, Users, AlertTriangle, CheckCircle, XCircle, Settings } from "lucide-react"
// import { format } from "date-fns"
// import { id } from "date-fns/locale"
// import { previewInactiveUmatData } from "../actions"

interface DataUmatContentProps {
    initialFamilyHeads?: FamilyHeadWithDetails[];
}

// Komponen untuk monitoring cronjob penghapusan otomatis
// function AutoDeleteMonitor() {
//     const [preview, setPreview] = useState<any>(null);
//     const [isLoading, setIsLoading] = useState(false);

//     const loadPreview = async () => {
//         try {
//             setIsLoading(true);
//             const data = await previewInactiveUmatData();
//             setPreview(data);
//         } catch (error) {
//             toast.error("Gagal memuat preview data");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadPreview();
//     }, []);

//     return (
//         <Card className="mb-6">
//             <CardHeader>
//                 <div className="flex items-center gap-2">
//                     <Settings className="h-5 w-5" />
//                     <CardTitle>Monitor Cronjob Penghapusan Otomatis</CardTitle>
//                 </div>
//                 <CardDescription>
//                     Sistem akan menghapus otomatis data umat dengan status 'Pindah' atau 'Meninggal (Seluruh Keluarga)' 
//                     setiap tanggal 1 jam 01:00 WIB. Data yang dihapus adalah yang diperbarui pada bulan sebelumnya.
//                 </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//                 <div className="flex gap-2">
//                     <Button
//                         onClick={loadPreview}
//                         disabled={isLoading}
//                         variant="outline"
//                         size="sm"
//                     >
//                         <CalendarDays className="h-4 w-4 mr-2" />
//                         {isLoading ? "Memuat..." : "Refresh Preview"}
//                     </Button>
//                 </div>

//                 {/* {preview && (
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <Card>
//                             <CardHeader className="pb-2">
//                                 <CardTitle className="text-sm font-medium">Keluarga Pindah</CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 <div className="text-2xl font-bold text-orange-600">
//                                     {preview.movedFamilies.length}
//                                 </div>
//                                 <p className="text-xs text-muted-foreground">
//                                     keluarga yang akan dihapus
//                                 </p>
//                             </CardContent>
//                         </Card>

//                         <Card>
//                             <CardContent>
//                                 <div className="text-2xl font-bold text-red-600">
//                                     {preview.deceasedFamilies.length}
//                                 </div>
//                                 <p className="text-xs text-muted-foreground">
//                                     keluarga yang akan dihapus
//                                 </p>
//                             </CardContent>
//                         </Card>

//                         <Card>
//                             <CardHeader className="pb-2">
//                                 <CardTitle className="text-sm font-medium">Total Anggota</CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 <div className="text-2xl font-bold text-blue-600">
//                                     {preview.totalMembers}
//                                 </div>
//                                 <p className="text-xs text-muted-foreground">
//                                     anggota yang akan dihapus
//                                 </p>
//                             </CardContent>
//                         </Card>
//                     </div>
//                 )} */}

//                 {preview && (preview.movedFamilies.length > 0 || preview.deceasedFamilies.length > 0) && (
//                     <div className="space-y-3">
//                         <Separator />
//                         <h4 className="font-medium">Detail Data yang Akan Dihapus:</h4>
                        
//                         {preview.movedFamilies.length > 0 && (
//                             <div>
//                                 <div className="space-y-1">
//                                     {preview.movedFamilies.map((family: any) => (
//                                         <div key={family.id} className="flex justify-between items-center text-sm bg-orange-50 p-2 rounded">
//                                             <span>{family.namaKepalaKeluarga}</span>
//                                             <div className="flex items-center gap-2">
//                                                 <Badge variant="outline">{family.jumlahAnggota} anggota</Badge>
//                                                 <span className="text-xs text-muted-foreground">
//                                                     {format(new Date(family.tanggalKeluar), "dd MMM yyyy", { locale: id })}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}

//                         {preview.deceasedFamilies.length > 0 && (
//                             <div>
//                                 <div className="space-y-1">
//                                     {preview.deceasedFamilies.map((family: any) => (
//                                         <div key={family.id} className="flex justify-between items-center text-sm bg-red-50 p-2 rounded">
//                                             <span>{family.namaKepalaKeluarga}</span>
//                                             <div className="flex items-center gap-2">
//                                                 <Badge variant="outline">{family.jumlahAnggota} anggota</Badge>
//                                                 <span className="text-xs text-muted-foreground">
//                                                     {format(new Date(family.tanggalMeninggal), "dd MMM yyyy", { locale: id })}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {preview && preview.totalFamilies === 0 && (
//                     <div className="text-center py-4 text-muted-foreground">
//                         <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
//                         <p>Tidak ada data umat yang akan dihapus pada periode ini</p>
//                     </div>
//                 )}
//             </CardContent>
//         </Card>
//     );
// }

export default function DataUmatContent({ initialFamilyHeads = [] }: DataUmatContentProps) {
    const { userRole } = useAuth()
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
    const [selectedFamilyHead, setSelectedFamilyHead] = useState<FamilyHeadWithDetails | undefined>()
    const [familyHeads, setFamilyHeads] = useState<FamilyHeadWithDetails[]>(initialFamilyHeads)
    const [isLoading, setIsLoading] = useState(initialFamilyHeads.length === 0)

    // Cek apakah pengguna memiliki hak akses
    const hasAccess = userRole ? [
        'SUPER_USER',
        'KETUA',
        'WAKIL_KETUA',
        'SEKRETARIS',
        'WAKIL_SEKRETARIS',
    ].includes(userRole) : false;

    // Redirect jika tidak memiliki akses
    useEffect(() => {
        if (userRole && !hasAccess) {
            toast.error("Anda tidak memiliki akses ke halaman ini")
            router.push("/dashboard")
        }
    }, [hasAccess, router, userRole])

    // Cek akses untuk edit dan hapus data
    const canModifyData = userRole ? [
        'SUPER_USER',
        'SEKRETARIS',
        'WAKIL_SEKRETARIS',
    ].includes(userRole) : false;

    // Fetch data keluarga umat
    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true)
                const data = await getAllFamilyHeadsWithDetails();
                setFamilyHeads(data);
            } catch (error) {
                console.error("Error fetching family heads:", error);
                toast.error("Gagal mengambil data keluarga umat");
            } finally {
                setIsLoading(false)
            }
        }

        // Hanya fetch data jika tidak ada initial data
        if (initialFamilyHeads.length === 0) {
            fetchData();
        }
    }, [initialFamilyHeads.length]);

    const handleAddFamilyHead = async (values: FamilyHeadFormValues) => {
        if (!canModifyData) {
            toast.error("Anda tidak memiliki izin untuk menambah data")
            return
        }

        try {
            // Konversi tanggal dari null ke undefined
            const formattedValues = {
                ...values,
                nomorTelepon: values.nomorTelepon || undefined,
                tanggalKeluar: values.tanggalKeluar === null ? undefined : values.tanggalKeluar,
                tanggalMeninggal: values.tanggalMeninggal === null ? undefined : values.tanggalMeninggal
            };

            await addFamilyHead(formattedValues);
            
            // Refresh data
            const data = await getAllFamilyHeadsWithDetails();
            setFamilyHeads(data);
            toast.success("Berhasil menambahkan data keluarga baru");
            setIsFormDialogOpen(false);
        } catch (error) {
            console.error("Error adding family head:", error);
            toast.error("Gagal menambahkan data keluarga");
        }
    }

    const handleEditFamilyHead = async (values: FamilyHeadFormValues) => {
        if (!selectedFamilyHead || !canModifyData) {
            if (!canModifyData) toast.error("Anda tidak memiliki izin untuk mengubah data")
            return
        }

        try {
            // Konversi tanggal dari null ke undefined
            const formattedValues = {
                ...values,
                nomorTelepon: values.nomorTelepon || undefined,
                tanggalKeluar: values.tanggalKeluar === null ? undefined : values.tanggalKeluar,
                tanggalMeninggal: values.tanggalMeninggal === null ? undefined : values.tanggalMeninggal
            };

            await updateFamilyHead(selectedFamilyHead.id, formattedValues);
            
            // Refresh data
            const data = await getAllFamilyHeadsWithDetails();
            setFamilyHeads(data);
            toast.success("Berhasil mengupdate data keluarga");
            setIsFormDialogOpen(false);
        } catch (error) {
            console.error("Error updating family head:", error);
            toast.error("Gagal mengupdate data keluarga");
        }
    }

    const handleDeleteFamilyHead = async (id: string, reason: "moved" | "deceased" | "member_deceased", memberName?: string) => {
        if (!canModifyData) {
            toast.error("Anda tidak memiliki izin untuk menghapus data")
            return
        }

        try {
            if (reason === "moved") {
                await markFamilyAsMoved(id);
                toast.success("Status keluarga berhasil diubah menjadi Pindah");
            } else if (reason === "deceased") {
                await markFamilyAsDeceased(id);
                toast.success("Status keluarga berhasil diubah menjadi Meninggal");
            } else if (reason === "member_deceased" && memberName) {
                await markFamilyMemberAsDeceased(id, memberName);
                toast.success(`Status ${memberName} berhasil diubah menjadi Meninggal`);
            }
            
            // Refresh data
            const data = await getAllFamilyHeadsWithDetails();
            setFamilyHeads(data);
        } catch (error) {
            console.error("Error deleting family head:", error);
            toast.error("Gagal memperbarui status keluarga");
        }
    }

    const handlePermanentDeleteFamilyHead = async (id: string) => {
        // Only SUPER_USER can perform permanent delete
        if (userRole !== 'SUPER_USER') {
            toast.error("Anda tidak memiliki izin untuk menghapus data secara permanen")
            return
        }

        try {
            await permanentDeleteFamilyHead(id);
            
            // Refresh data
            const data = await getAllFamilyHeadsWithDetails();
            setFamilyHeads(data);
            toast.success("Data keluarga berhasil dihapus secara permanen dari sistem");
        } catch (error) {
            console.error("Error permanently deleting family head:", error);
            toast.error("Gagal menghapus data keluarga secara permanen");
        }
    }

    const handleDownloadTemplate = () => {
        if (!canModifyData) {
            toast.error("Anda tidak memiliki izin untuk mengunduh template")
            return
        }

        exportFamilyHeadTemplate();
    }

    const handleImportData = () => {
        if (!canModifyData) {
            toast.error("Anda tidak memiliki izin untuk mengimpor data")
            return
        }

        setIsImportDialogOpen(true);
    }

    const handleImportComplete = async (newFamilyHeads: FamilyHead[]) => {
        // Refresh data setelah import
        try {
            const data = await getAllFamilyHeadsWithDetails();
            setFamilyHeads(data);
            toast.success(`Berhasil mengimpor ${newFamilyHeads.length} data keluarga`);
        } catch (error) {
            console.error("Error refreshing data after import:", error);
        }
    };

    if (userRole === undefined) {
        return <div className="flex justify-center items-center h-64">Memeriksa akses...</div>
    }

    if (!hasAccess && userRole !== null) {
        return <div className="flex justify-center items-center h-64">Anda tidak memiliki akses ke halaman ini</div>
    }

    return (
        <div className="space-y-6">
            {/* Monitor Cronjob - hanya untuk SUPER_USER */}
            {/* {userRole === 'SUPER_USER' && <AutoDeleteMonitor />} */}

            {!canModifyData && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Mode Hanya Baca</AlertTitle>
                    <AlertDescription>
                        Anda hanya dapat melihat data umat. Untuk menambah, mengubah, atau menghapus data, hubungi Sekretaris atau Wakil Sekretaris.
                    </AlertDescription>
                </Alert>
            )}

            <h2 className="text-2xl font-bold">Data Umat</h2>
            <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4 mb-2">
                {canModifyData && (
                    <Button
                        onClick={() => {
                            setSelectedFamilyHead(undefined)
                            setIsFormDialogOpen(true)
                        }}
                        size="sm"
                        className="w-full sm:w-auto"
                    >
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Tambah Data
                    </Button>
                )}
            </div>

            <FamilyHeadsTable
                familyHeads={familyHeads}
                isLoading={isLoading}
                onEdit={(familyHead) => {
                    if (!canModifyData) {
                        toast.error("Anda tidak memiliki izin untuk mengubah data")
                        return
                    }
                    setSelectedFamilyHead(familyHead)
                    setIsFormDialogOpen(true)
                }}
                onDelete={handleDeleteFamilyHead}
                onPermanentDelete={handlePermanentDeleteFamilyHead}
                onExportTemplate={handleDownloadTemplate}
                onImportData={handleImportData}
                canModifyData={canModifyData}
            />

            <FamilyHeadFormDialog
                open={isFormDialogOpen}
                onOpenChange={setIsFormDialogOpen}
                familyHead={selectedFamilyHead}
                onSubmit={selectedFamilyHead ? handleEditFamilyHead : handleAddFamilyHead}
            />

            <ImportDialog
                open={isImportDialogOpen}
                onOpenChange={setIsImportDialogOpen}
                onImportComplete={handleImportComplete}
                existingDataCount={familyHeads.length}
            />
        </div>
    )
}