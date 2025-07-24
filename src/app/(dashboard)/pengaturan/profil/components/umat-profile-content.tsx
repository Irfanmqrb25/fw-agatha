import { useState } from "react"
import { Camera, PlusCircle, User } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "../utils/helpers"

import { FamilyHeadForm } from "./family-head-form"
import { SpouseForm } from "./spouse-form"
import { DependentForm } from "./dependent-form"
import { DependentItem } from "./dependent-item"

import { 
  ProfileData, 
  Dependent, 
  MaritalStatus 
} from "../types"

interface UmatProfileContentProps {
  profileData: ProfileData
  isSaving: boolean
  onFamilyHeadSubmit: (values: any) => void
  onSpouseSubmit: (values: any) => void
  onDependentSubmit: (values: any) => void
  onEditDependent: (dependent: Dependent) => void
  onDeleteDependent: (dependent: Dependent) => void
  onImageUpload: (entityType: 'familyHead' | 'spouse' | 'dependent', id?: number) => void
  canEdit: boolean
}

export function UmatProfileContent({
  profileData,
  isSaving,
  onFamilyHeadSubmit,
  onSpouseSubmit,
  onDependentSubmit,
  onEditDependent,
  onDeleteDependent,
  onImageUpload,
  canEdit
}: UmatProfileContentProps) {
  const [activeTab, setActiveTab] = useState<string>("kepala-keluarga")
  const [showDependentForm, setShowDependentForm] = useState<boolean>(false)
  const [editingDependent, setEditingDependent] = useState<Dependent | null>(null)

  // Handler untuk membatalkan form tanggungan
  const onCancelDependentForm = () => {
    setShowDependentForm(false)
    setEditingDependent(null)
  }

  // Handler untuk edit tanggungan
  const handleEditDependent = (dependent: Dependent) => {
    setEditingDependent(dependent)
    setShowDependentForm(true)
    onEditDependent(dependent)
  }

  return (
    <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3 h-auto">
        <TabsTrigger value="kepala-keluarga" className="py-2 text-xs sm:text-sm data-[state=active]:font-medium">
          Kepala Keluarga
        </TabsTrigger>
        {profileData.familyHead.maritalStatus === MaritalStatus.MARRIED && (
          <TabsTrigger value="pasangan" className="py-2 text-xs sm:text-sm data-[state=active]:font-medium">
            Pasangan
          </TabsTrigger>
        )}
        <TabsTrigger value="tanggungan" className="py-2 text-xs sm:text-sm data-[state=active]:font-medium">
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
                  <AvatarImage src={profileData.familyHead.imageUrl} alt={profileData.familyHead.fullName} />
                ) : (
                  <AvatarFallback className="text-3xl">
                    {getInitials(profileData.familyHead.fullName)}
                  </AvatarFallback>
                )}
              </Avatar>
              {canEdit && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-background border border-border shadow"
                  onClick={() => onImageUpload('familyHead')}
                >
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Ubah Foto</span>
                </Button>
              )}
            </div>
            <h3 className="mt-2 font-medium text-lg">{profileData.familyHead.fullName}</h3>
            <p className="text-sm text-muted-foreground">{profileData.familyHead.phoneNumber}</p>
          </div>
          
          <div className="w-full">
            <FamilyHeadForm 
              defaultValues={profileData.familyHead} 
              onSubmit={onFamilyHeadSubmit}
              isSubmitting={isSaving}
              readOnly={!canEdit}
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
                    <AvatarImage src={profileData.spouse.imageUrl} alt={profileData.spouse?.fullName || ''} />
                  ) : (
                    <AvatarFallback className="text-3xl">
                      {profileData.spouse ? getInitials(profileData.spouse.fullName) : <User className="h-10 w-10" />}
                    </AvatarFallback>
                  )}
                </Avatar>
                {canEdit && profileData.spouse && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-background border border-border shadow"
                    onClick={() => onImageUpload('spouse')}
                  >
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">Ubah Foto</span>
                  </Button>
                )}
              </div>
              {profileData.spouse && (
                <>
                  <h3 className="mt-2 font-medium text-lg">{profileData.spouse.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{profileData.spouse.phoneNumber}</p>
                </>
              )}
            </div>
            
            <div className="w-full">
              <SpouseForm 
                defaultValues={profileData.spouse || undefined} 
                onSubmit={onSpouseSubmit}
                isSubmitting={isSaving}
                readOnly={!canEdit}
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
                <p className="text-muted-foreground mb-3">Belum ada data tanggungan</p>
                {canEdit && (
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
                  <h3 className="text-base font-medium">Daftar Tanggungan</h3>
                  {canEdit && (
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
                      onEdit={handleEditDependent}
                      onDelete={onDeleteDependent}
                      onImageUpload={onImageUpload}
                      readOnly={!canEdit}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </TabsContent>
    </Tabs>
  )
} 