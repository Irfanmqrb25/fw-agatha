"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, RefreshCw } from "lucide-react";
import { FamilyHeadWithDetails } from "../types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getFamilyMembers, syncFamilyDependents } from "../actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FamilyMember {
  id: string;
  nama: string;
  jenis: 'KEPALA_KELUARGA' | 'PASANGAN' | 'ANAK' | 'KERABAT';
}

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyHead: FamilyHeadWithDetails | null;
  onConfirm: (id: string, reason: "moved" | "deceased" | "member_deceased", memberName?: string) => Promise<void>;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  familyHead,
  onConfirm
}: DeleteConfirmationDialogProps) {
  const [deleteReason, setDeleteReason] = useState<"moved" | "deceased" | "member_deceased">("moved");
  const [deceasedMemberName, setDeceasedMemberName] = useState("");
  const [deceasedType, setDeceasedType] = useState<"all" | "member">("all");
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch family members when dialog opens
  useEffect(() => {
    async function loadFamilyMembers() {
      if (open && familyHead && deceasedType === "member") {
        setIsLoading(true);
        try {
          const members = await getFamilyMembers(familyHead.id);
          
          // Check each type of member
          const kepalaKeluarga = members.filter(m => m.jenis === 'KEPALA_KELUARGA');
          const pasangan = members.filter(m => m.jenis === 'PASANGAN');
          const anak = members.filter(m => m.jenis === 'ANAK');
          const kerabat = members.filter(m => m.jenis === 'KERABAT');
          
          // Tampilkan peringatan jika ada ketidaksesuaian jumlah dengan data di UI
          if (familyHead.jumlahAnakTertanggung !== anak.length) {
            console.warn(
              "Inconsistency: familyHead.jumlahAnakTertanggung =", 
              familyHead.jumlahAnakTertanggung,
              "but actual anak count =", 
              anak.length
            );
          }
          
          setFamilyMembers(members);
        } catch (error) {
          console.error("Error fetching family members:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    loadFamilyMembers();
  }, [open, familyHead, deceasedType]);

  const handleReasonChange = (value: "moved" | "deceased" | "member_deceased") => {
    setDeleteReason(value);
    if (value === "moved") {
      setDeceasedMemberName("");
      setDeceasedType("all");
    }
  };

  const handleDeceasedTypeChange = (value: "all" | "member") => {
    setDeceasedType(value);
    setDeceasedMemberName("");
  };

  const handleSyncFamily = async () => {
    if (!familyHead) return;
    
    setIsSyncing(true);
    try {
      const result = await syncFamilyDependents(familyHead.id);
      
      if (result.success) {
        toast.success(result.message);
        // Reload family members data
        const members = await getFamilyMembers(familyHead.id);
        setFamilyMembers(members);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error syncing family data:", error);
      toast.error("Terjadi kesalahan saat menyinkronkan data");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfirm = async () => {
    if (!familyHead) return;
    
    const reason = deleteReason === "deceased" && deceasedType === "member" ? "member_deceased" : deleteReason;
    
    await onConfirm(
      familyHead.id, 
      reason, 
      (reason === "member_deceased") ? deceasedMemberName : undefined
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle>Ubah Status Kepala Keluarga</DialogTitle>
          <DialogDescription>
            Ubah status kepala keluarga {familyHead?.nama}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delete-reason">Alasan</Label>
            <Select 
              value={deleteReason} 
              onValueChange={(value: "moved" | "deceased" | "member_deceased") => handleReasonChange(value)}
            >
              <SelectTrigger id="delete-reason">
                <SelectValue placeholder="Pilih alasan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="moved">Pindah</SelectItem>
                <SelectItem value="deceased">Meninggal</SelectItem>
              </SelectContent>
            </Select>

            {deleteReason === "moved" && (
              <p className="text-sm text-muted-foreground mt-2">
                Memilih alasan "Pindah" akan mengubah status keluarga menjadi "Pindah" dan mencatat tanggal kepindahan.
              </p>
            )}
          </div>

          {deleteReason === "deceased" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status Meninggal untuk</Label>
                <RadioGroup 
                  value={deceasedType} 
                  onValueChange={(value: "all" | "member") => handleDeceasedTypeChange(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="cursor-pointer">Seluruh Keluarga</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="member" id="member" />
                    <Label htmlFor="member" className="cursor-pointer">Anggota Keluarga Tertentu</Label>
                  </div>
                </RadioGroup>
              </div>

              {deceasedType === "all" && (
                <p className="text-sm text-muted-foreground">
                  Seluruh anggota keluarga akan ditandai sebagai meninggal. Ini akan memengaruhi data total kepala keluarga dan jumlah jiwa.
                </p>
              )}

              {deceasedType === "member" && (
                <div className="space-y-2">
                  <Label htmlFor="deceased-member">Nama Anggota Keluarga</Label>
                  <Popover open={selectOpen} onOpenChange={setSelectOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={selectOpen}
                        className="w-full justify-between"
                        disabled={isLoading || familyMembers.length === 0}
                      >
                        {isLoading ? "Memuat..." : 
                          deceasedMemberName ? 
                            familyMembers.find(member => member.nama === deceasedMemberName)?.nama || deceasedMemberName : 
                            "Pilih anggota keluarga"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Cari anggota keluarga..." />
                        <CommandEmpty>Tidak ada anggota keluarga yang ditemukan.</CommandEmpty>
                        <CommandGroup>
                          <CommandList>
                            {familyMembers.map((member) => (
                              <CommandItem
                                key={member.id}
                                onSelect={() => {
                                  setDeceasedMemberName(member.nama);
                                  setSelectOpen(false);
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    deceasedMemberName === member.nama ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{member.nama}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {member.jenis === 'KEPALA_KELUARGA' ? 'Kepala Keluarga' : 
                                      member.jenis === 'PASANGAN' ? 'Pasangan/Istri' : 
                                      member.jenis === 'ANAK' ? 'Anak' : 'Kerabat'}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-sm text-muted-foreground">
                    Hanya anggota keluarga yang dipilih akan ditandai sebagai meninggal. Status keluarga secara keseluruhan tetap aktif.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex sm:flex-row gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Batal
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={(deleteReason === "deceased" && deceasedType === "member" && deceasedMemberName.trim() === "")}
            className="w-full sm:w-auto"
          >
            Konfirmasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 