import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { Table } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

interface SearchInputProps {
  table: Table<any>
  searchTerm: string
  setSearchTerm: (value: string) => void
  placeholder?: string
  columnId?: string
}

export function SearchInput({
  table,
  searchTerm,
  setSearchTerm,
  placeholder = "Cari...",
  columnId = "judul"
}: SearchInputProps) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-8 w-[200px]"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            table.getColumn(columnId)?.setFilterValue(e.target.value)
          }}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            className="absolute right-0 top-0 h-9 w-9 p-0"
            onClick={() => {
              setSearchTerm("")
              table.getColumn(columnId)?.setFilterValue("")
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {/* Display active search filter */}
      {searchTerm && (
        <Badge variant="outline" className="gap-1 px-2 py-1 w-fit">
          <span>Pencarian: {searchTerm}</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-1 h-4 w-4 p-0"
            onClick={() => {
              setSearchTerm("")
              table.getColumn(columnId)?.setFilterValue("")
            }}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear search</span>
          </Button>
        </Badge>
      )}
    </div>
  )
} 