"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, PlusCircle, Camera, User } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { FamilyHeadForm } from "./family-head-form";
import { SpouseForm } from "./spouse-form";
import { DependentForm } from "./dependent-form";
import { DependentItem } from "./dependent-item";

import {
  FamilyHeadFormValues,
  SpouseFormValues,
  DependentFormValues,
  Dependent,
  MaritalStatus,
  Religion,
} from "../types";

import { getInitials } from "../utils/helpers";
import { useProfileData } from "../hooks/useProfileData";
import { useConfirmationDialog } from "../hooks/useConfirmationDialog";
import {
  handleFamilyHeadSubmit,
  handleSpouseSubmit,
  handleAddDependent,
  handleUpdateDependent,
  handleDeleteDependent,
} from "./profile-handlers";

import { AccountInfoCard } from "./account-info-card";
import { UmatProfileContent } from "./umat-profile-content";

// Berdasarkan README.md:
// Submenu Profil - Hanya role "Umat" yang dapat memperbarui data profil
const ROLE_ACCESS_MAP = {
  SUPER_USER: {
    canView: true,
    canEdit: false,
    message: "Anda melihat data profil sebagai Super User",
  },
  KETUA: {
    canView: true,
    canEdit: false,
    message: "Anda melihat data profil sebagai Ketua",
  },
  WAKIL_KETUA: {
    canView: true,
    canEdit: false,
    message: "Anda melihat data profil sebagai Wakil Ketua",
  },
  BENDAHARA: {
    canView: true,
    canEdit: false,
    message: "Anda melihat data profil sebagai Bendahara",
  },
  WAKIL_BENDAHARA: {
    canView: true,
    canEdit: false,
    message: "Anda melihat data profil sebagai Wakil Bendahara",
  },
  SEKRETARIS: {
    canView: true,
    canEdit: false,
    message: "Anda melihat data profil sebagai Sekretaris",
  },
  WAKIL_SEKRETARIS: {
    canView: true,
    canEdit: false,
    message: "Anda melihat data profil sebagai Wakil Sekretaris",
  },
  UMAT: {
    canView: true,
    canEdit: true,
    message: "Anda dapat memperbarui data profil keluarga Anda",
  },
};

export default function ProfileContent() {
  const { userRole, userId } = useAuth();

  // Ambil konfigurasi akses berdasarkan role
  const roleAccess = ROLE_ACCESS_MAP[userRole as keyof typeof ROLE_ACCESS_MAP];

  // Gunakan custom hook untuk data profil
  const { profileData, isLoading, isSaving, setIsSaving, refreshProfileData } =
    useProfileData(userId);

  // Gunakan custom hook untuk dialog konfirmasi
  const {
    showConfirmDialog,
    setShowConfirmDialog,
    confirmDialogProps,
    showConfirmationDialog,
    handleConfirm,
  } = useConfirmationDialog();

  // State untuk tanggungan yang sedang diedit
  const [editingDependent, setEditingDependent] = useState<Dependent | null>(
    null
  );

  const [showDependentForm, setShowDependentForm] = useState<boolean>(false);

  // Nilai default untuk tab
  const [activeTab, setActiveTab] = useState<string>("kepala-keluarga");

  // Simulasi upload gambar
  const handleImageUpload = async (
    entityType: "familyHead" | "spouse" | "dependent",
    id?: string | number
  ) => {
    // Cek apakah pengguna memiliki izin untuk memperbarui data
    if (!roleAccess.canEdit) {
      toast.error(
        `Hanya pengguna dengan role Umat yang dapat memperbarui data`
      );
      return;
    }

    // Buka file picker
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) return;

      const file = target.files[0];
      if (!file) return;

      try {
        setIsSaving(true);
        const toastId = toast.loading("Sedang mengunggah foto...", {
          duration: 10000, // 10 detik
        });

        // Konversi file ke FormData untuk dikirim ke server
        const formData = new FormData();
        formData.append("file", file);
        formData.append("entityType", entityType);

        if (id) {
          formData.append("id", id.toString());
        }

        // Upload file ke server
        const response = await fetch("/api/profile/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Gagal mengunggah foto");
        }

        // Refresh data profil setelah berhasil upload
        await refreshProfileData();

        toast.success(
          `Foto ${
            entityType === "familyHead"
              ? "profil"
              : entityType === "spouse"
              ? "pasangan"
              : "tanggungan"
          } berhasil diperbarui`,
          {
            id: toastId,
            duration: 3000,
          }
        );
      } catch (error) {
        console.error(error);
        toast.error(
          "Gagal mengunggah foto. Pastikan ukuran file tidak terlalu besar dan format file didukung (jpg, png, webp)."
        );
      } finally {
        setIsSaving(false);
      }
    };

    input.click();
  };

  // Handler untuk form kepala keluarga
  const onFamilyHeadSubmit = (values: FamilyHeadFormValues) => {
    // Cek apakah pengguna memiliki izin untuk memperbarui data
    if (!roleAccess.canEdit) {
      toast.error(
        `Hanya pengguna dengan role Umat yang dapat memperbarui data`
      );
      return;
    }

    // Tampilkan dialog konfirmasi
    showConfirmationDialog(
      "Simpan Data Kepala Keluarga",
      "Apakah Anda yakin ingin menyimpan perubahan data Kepala Keluarga?",
      async () => {
        if (!userId) return;
        await handleFamilyHeadSubmit(
          userId,
          values,
          setIsSaving,
          refreshProfileData
        );
      }
    );
  };

  // Handler untuk form pasangan
  const onSpouseSubmit = (values: SpouseFormValues) => {
    // Cek apakah pengguna memiliki izin untuk memperbarui data
    if (!roleAccess.canEdit) {
      toast.error(
        `Hanya pengguna dengan role Umat yang dapat memperbarui data`
      );
      return;
    }

    // Tampilkan dialog konfirmasi
    showConfirmationDialog(
      "Simpan Data Pasangan",
      "Apakah Anda yakin ingin menyimpan perubahan data Pasangan?",
      async () => {
        if (!userId) return;
        await handleSpouseSubmit(
          userId,
          values,
          setIsSaving,
          refreshProfileData
        );
      }
    );
  };

  // Handler untuk menambah tanggungan
  const onAddDependent = (values: DependentFormValues) => {
    // Cek apakah pengguna memiliki izin untuk memperbarui data
    if (!roleAccess.canEdit) {
      toast.error(
        `Hanya pengguna dengan role Umat yang dapat memperbarui data`
      );
      return;
    }

    // Tampilkan dialog konfirmasi
    showConfirmationDialog(
      "Tambah Data Tanggungan",
      "Apakah Anda yakin ingin menambah data Tanggungan?",
      async () => {
        if (!userId) return;
        const success = await handleAddDependent(
          userId,
          values,
          setIsSaving,
          refreshProfileData
        );
        if (success) {
          setShowDependentForm(false);
          setEditingDependent(null);
        }
      }
    );
  };

  // Handler untuk mengupdate tanggungan
  const onUpdateDependent = (values: DependentFormValues) => {
    // Cek apakah pengguna memiliki izin untuk memperbarui data
    if (!roleAccess.canEdit) {
      toast.error(
        `Hanya pengguna dengan role Umat yang dapat memperbarui data`
      );
      return;
    }

    if (!editingDependent || !userId) return;

    // Tampilkan dialog konfirmasi
    showConfirmationDialog(
      "Perbarui Data Tanggungan",
      "Apakah Anda yakin ingin memperbarui data Tanggungan?",
      async () => {
        const success = await handleUpdateDependent(
          userId,
          editingDependent.id as string,
          values,
          setIsSaving,
          refreshProfileData
        );

        if (success) {
          setShowDependentForm(false);
          setEditingDependent(null);
        }
      }
    );
  };

  // Handler untuk menghapus tanggungan
  const onDeleteDependent = (dependent: Dependent) => {
    // Cek apakah pengguna memiliki izin untuk memperbarui data
    if (!roleAccess.canEdit) {
      toast.error(
        `Hanya pengguna dengan role Umat yang dapat memperbarui data`
      );
      return;
    }

    // Tampilkan dialog konfirmasi
    showConfirmationDialog(
      "Hapus Data Tanggungan",
      `Apakah Anda yakin ingin menghapus data tanggungan ${dependent.name}?`,
      async () => {
        if (!userId) return;
        await handleDeleteDependent(
          userId,
          dependent,
          setIsSaving,
          refreshProfileData
        );
      }
    );
  };

  // Handler untuk membuka form edit tanggungan
  const onEditDependent = (dependent: Dependent) => {
    // Cek apakah pengguna memiliki izin untuk memperbarui data
    if (!roleAccess.canEdit) {
      toast.error(
        `Hanya pengguna dengan role Umat yang dapat memperbarui data`
      );
      return;
    }

    setEditingDependent(dependent);
    setShowDependentForm(true);
  };

  // Handler untuk membatalkan form tanggungan
  const onCancelDependentForm = () => {
    setShowDependentForm(false);
    setEditingDependent(null);
  };

  // Wrapper untuk handle submit dari form tanggungan
  const onDependentSubmit = (values: DependentFormValues) => {
    if (editingDependent) {
      onUpdateDependent(values);
    } else {
      onAddDependent(values);
    }
  };

  // Render alert banner untuk informasi role dan akses
  const renderRoleAccessAlert = () => {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs sm:text-sm">
          {roleAccess.message}
        </AlertDescription>
      </Alert>
    );
  };

  // Render konten berdasarkan role
  const renderContent = () => {
    // Jika role adalah UMAT dan profileData tersedia
    if (userRole === "UMAT" && profileData) {
      return (
        <Tabs
          defaultValue={activeTab}
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger
              value="kepala-keluarga"
              className="py-2 text-xs sm:text-sm data-[state=active]:font-medium"
            >
              Kepala Keluarga
            </TabsTrigger>
            {profileData.familyHead.maritalStatus === MaritalStatus.MARRIED && (
              <TabsTrigger
                value="pasangan"
                className="py-2 text-xs sm:text-sm data-[state=active]:font-medium"
              >
                Pasangan
              </TabsTrigger>
            )}
            <TabsTrigger
              value="tanggungan"
              className="py-2 text-xs sm:text-sm data-[state=active]:font-medium"
            >
              Tanggungan
            </TabsTrigger>
          </TabsList>

          {/* Tab Kepala Keluarga */}
          <TabsContent value="kepala-keluarga" className="space-y-4">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="h-28 w-28 border-4 border-primary/10">
                    {profileData.familyHead.imageUrl ? (
                      <AvatarImage
                        src={profileData.familyHead.imageUrl}
                        alt={profileData.familyHead.fullName}
                      />
                    ) : (
                      <AvatarFallback className="text-3xl">
                        {getInitials(profileData.familyHead.fullName)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {roleAccess.canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-background border border-border shadow"
                      onClick={() => handleImageUpload("familyHead")}
                    >
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Ubah Foto</span>
                    </Button>
                  )}
                </div>
                <h3 className="mt-2 font-medium text-lg">
                  {profileData.familyHead.fullName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {profileData.familyHead.phoneNumber}
                </p>
              </div>

              <div className="w-full">
                <FamilyHeadForm
                  defaultValues={{
                    ...profileData.familyHead,
                    religion: profileData.familyHead.religion as Religion,
                  }}
                  onSubmit={onFamilyHeadSubmit}
                  isSubmitting={isSaving}
                  readOnly={!roleAccess.canEdit}
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab Pasangan */}
          {profileData.familyHead.maritalStatus === MaritalStatus.MARRIED && (
            <TabsContent value="pasangan" className="space-y-4">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="h-28 w-28 border-4 border-primary/10">
                      {profileData.spouse?.imageUrl ? (
                        <AvatarImage
                          src={profileData.spouse.imageUrl}
                          alt={profileData.spouse?.fullName || ""}
                        />
                      ) : (
                        <AvatarFallback className="text-3xl">
                          {profileData.spouse ? (
                            getInitials(profileData.spouse.fullName)
                          ) : (
                            <User className="h-10 w-10" />
                          )}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {roleAccess.canEdit && profileData.spouse && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-background border border-border shadow"
                        onClick={() => handleImageUpload("spouse")}
                      >
                        <Camera className="h-4 w-4" />
                        <span className="sr-only">Ubah Foto</span>
                      </Button>
                    )}
                  </div>
                  {profileData.spouse && (
                    <>
                      <h3 className="mt-2 font-medium text-lg">
                        {profileData.spouse.fullName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {profileData.spouse.phoneNumber}
                      </p>
                    </>
                  )}
                </div>

                <div className="w-full">
                  <SpouseForm
                    defaultValues={profileData.spouse || undefined}
                    onSubmit={onSpouseSubmit}
                    isSubmitting={isSaving}
                    readOnly={!roleAccess.canEdit}
                  />
                </div>
              </div>
            </TabsContent>
          )}

          {/* Tab Tanggungan */}
          <TabsContent value="tanggungan" className="space-y-4">
            {showDependentForm ? (
              <div className="bg-background/80 p-3 border rounded-lg">
                <DependentForm
                  defaultValues={editingDependent || undefined}
                  onSubmit={onDependentSubmit}
                  onCancel={onCancelDependentForm}
                  isSubmitting={isSaving}
                />
              </div>
            ) : (
              <>
                {profileData.dependents.length === 0 ? (
                  <div className="text-center py-8 px-4 border rounded-lg">
                    <p className="text-muted-foreground mb-3">
                      Belum ada data tanggungan
                    </p>
                    {roleAccess.canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDependentForm(true)}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Tanggungan
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-medium">
                        Daftar Tanggungan
                      </h3>
                      {roleAccess.canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => setShowDependentForm(true)}
                        >
                          <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                          <span className="text-xs">Tambah</span>
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {profileData.dependents.map((dependent) => (
                        <DependentItem
                          key={dependent.id}
                          dependent={dependent}
                          onEdit={onEditDependent}
                          onDelete={onDeleteDependent}
                          onImageUpload={handleImageUpload}
                          readOnly={!roleAccess.canEdit}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      );
    }

    // Untuk role non-UMAT atau jika profileData belum tersedia, hanya tampilkan informasi akun
    return (
      <Card className="mb-4">
        <CardHeader className="p-3 pb-2 sm:p-4 sm:pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base sm:text-lg">
              Informasi Akun
            </CardTitle>
            <Badge className="text-xs h-5">{userRole}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 shrink-0 border-2 border-primary/10">
              {profileData?.familyHead.imageUrl ? (
                <AvatarImage
                  src={profileData.familyHead.imageUrl}
                  alt={profileData.familyHead.fullName}
                />
              ) : (
                <AvatarFallback className="text-base">
                  {profileData?.familyHead.fullName ? (
                    getInitials(profileData.familyHead.fullName)
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0">
              <h3 className="text-base font-semibold truncate">
                {profileData?.familyHead.fullName}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {profileData?.familyHead.address}
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                <p className="text-xs text-muted-foreground">
                  {profileData?.familyHead.phoneNumber}
                </p>
                {profileData?.familyHead.email && (
                  <p className="text-xs text-muted-foreground truncate">
                    {profileData.familyHead.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div
            className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-primary rounded-full mb-2"
            aria-hidden="true"
          ></div>
          <p className="text-sm text-muted-foreground">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-2" />
          <p className="text-destructive">Gagal memuat data profil</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tampilkan pesan akses berdasarkan role */}
      {renderRoleAccessAlert()}

      {/* Render konten berdasarkan role */}
      {userRole === "UMAT" ? (
        <UmatProfileContent
          profileData={profileData}
          isSaving={isSaving}
          onFamilyHeadSubmit={onFamilyHeadSubmit}
          onSpouseSubmit={onSpouseSubmit}
          onDependentSubmit={onDependentSubmit}
          onEditDependent={onEditDependent}
          onDeleteDependent={onDeleteDependent}
          onImageUpload={handleImageUpload}
          canEdit={roleAccess.canEdit}
        />
      ) : (
        <AccountInfoCard userRole={userRole} profileData={profileData} />
      )}

      {/* Dialog Konfirmasi */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialogProps.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialogProps.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
