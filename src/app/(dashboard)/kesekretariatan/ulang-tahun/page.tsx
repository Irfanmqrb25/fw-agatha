import { Suspense } from "react";
import { getBirthdays } from "./actions";
import { BirthdayTable } from "./components/tables/birthday-table";
import { SkeletonTable } from "./components/skeleton-table";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ bulan?: string }>;
}) {
  const params = await searchParams;
  const defaultMonth = Number(params?.bulan) || new Date().getMonth() + 1;
  const dataPromise = getBirthdays(defaultMonth);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Daftar Ulang Tahun</h1>
      <Suspense fallback={<SkeletonTable />}>
        <BirthdayTable
          initialData={await dataPromise}
          initialMonth={defaultMonth}
        />
      </Suspense>
    </div>
  );
}
