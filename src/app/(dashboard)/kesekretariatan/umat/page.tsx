import { Suspense } from "react";
import LoadingSkeleton from "./components/loading-skeleton";
import DataUmatContent from "./components/data-umat-content";
import { getAllFamilyHeadsWithDetails } from "./actions";

export default async function DataUmatPage() {
  // Mengambil data dari server actions dengan detail tanggungan
  const familyHeadsData = await getAllFamilyHeadsWithDetails();
  
  return (
    <div className="p-2 md:p-4">
      <Suspense fallback={<LoadingSkeleton />}>
        <DataUmatContent initialFamilyHeads={familyHeadsData} />
      </Suspense>
    </div>
  )
} 