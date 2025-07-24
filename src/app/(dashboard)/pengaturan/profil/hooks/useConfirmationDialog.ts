import { useState } from "react"

interface ConfirmDialogProps {
  title: string
  description: string
}

export function useConfirmationDialog() {
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [confirmDialogProps, setConfirmDialogProps] = useState<ConfirmDialogProps>({
    title: "",
    description: ""
  })

  // Fungsi untuk menampilkan dialog konfirmasi
  const showConfirmationDialog = (
    title: string,
    description: string,
    action: () => void
  ) => {
    setConfirmDialogProps({
      title,
      description
    })
    setPendingAction(() => action)
    setShowConfirmDialog(true)
  }

  // Fungsi untuk melanjutkan aksi setelah konfirmasi
  const handleConfirm = () => {
    if (pendingAction) {
      pendingAction()
    }
    setShowConfirmDialog(false)
    setPendingAction(null)
  }

  return {
    showConfirmDialog,
    setShowConfirmDialog,
    confirmDialogProps,
    showConfirmationDialog,
    handleConfirm
  }
} 