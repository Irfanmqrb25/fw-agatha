"use client"

import { Suspense } from "react"
import ApprovalContent from "./components/approval-content"
import LoadingSkeleton from "./components/loading-skeleton"

export default function ApprovalPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Approval</h1>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <ApprovalContent />
      </Suspense>
    </div>
  )
} 