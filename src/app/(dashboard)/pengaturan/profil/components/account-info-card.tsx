import { User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProfileData } from "../types"
import { getInitials } from "../utils/helpers"

interface AccountInfoCardProps {
  userRole: string | null
  profileData: ProfileData
}

export function AccountInfoCard({ userRole, profileData }: AccountInfoCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="p-3 pb-2 sm:p-4 sm:pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base sm:text-lg">Informasi Akun</CardTitle>
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
                {profileData?.familyHead.fullName ? getInitials(profileData.familyHead.fullName) : <User className="h-6 w-6" />}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0">
            <h3 className="text-base font-semibold truncate">{profileData?.familyHead.fullName}</h3>
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
  )
} 