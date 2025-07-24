
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PenunggakDanaMandiriTable } from "./penunggak-table"
import { PenunggakIkataTable } from "./penunggak-table"
import { PenunggakIkata } from "../types";
import { PenunggakDanaMandiri } from "../types";

interface DaftarPenunggakSectionProps {
    penunggakDanaMandiri: PenunggakDanaMandiri[];
    penunggakIkata: PenunggakIkata[];
}

export function DaftarPenunggakSection({ penunggakDanaMandiri, penunggakIkata }: DaftarPenunggakSectionProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Kepala Keluarga Yang Belum Melunasi</h2>
                <Tabs defaultValue="dana-mandiri" className="w-full">
                    <div className="mb-4">
                        <TabsList className="w-full sm:w-auto">
                            <TabsTrigger
                                value="dana-mandiri"
                                className="flex-1 sm:flex-initial"
                            >
                                Dana Mandiri
                            </TabsTrigger>
                            <TabsTrigger
                                value="ikata"
                                className="flex-1 sm:flex-initial"
                            >
                                IKATA
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="dana-mandiri" className="mt-0">
                        <PenunggakDanaMandiriTable data={penunggakDanaMandiri} />
                    </TabsContent>

                    <TabsContent value="ikata" className="mt-0">
                        <PenunggakIkataTable data={penunggakIkata} />
                    </TabsContent>
                </Tabs>
        </div>
    )
}
