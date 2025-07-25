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
    <div
      className="relative min-h-screen w-full bg-cover bg-center"
      style={{
        backgroundImage: "url(/birthday-bg2.jpg)",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* Overlay agar teks tetap terbaca */}
      <div className="absolute" />

      {/* Konten utama */}
      <div className="relative z-10 p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#E5164D]">🎉 Ulang Tahun</h1>
          <p className="text-[#D82D55] font-medium">
            Lihat daftar ulang tahun anggota St. Agatha pada setiap bulannya.
          </p>
        </div>
        <Suspense fallback={<SkeletonTable />}>
          <BirthdayTable
            initialData={await dataPromise}
            initialMonth={defaultMonth}
          />
        </Suspense>
      </div>
    </div>
  );
}
