"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, Camera } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Dependent, DependentType, Gender } from "../types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Pencil, User, Calendar, GraduationCap, Heart } from "lucide-react";

interface DependentItemProps {
  dependent: Dependent;
  onEdit: (dependent: Dependent) => void;
  onDelete: (dependent: Dependent) => void;
  onImageUpload: (
    entityType: "familyHead" | "spouse" | "dependent",
    id?: string | number
  ) => void;
  readOnly: boolean;
}

export function DependentItem({
  dependent,
  onEdit,
  onDelete,
  onImageUpload,
  readOnly,
}: DependentItemProps) {
  // Helper untuk mendapatkan inisial nama
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format tanggal
  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return format(date, "dd MMM yyyy", { locale: id });
  };

  return (
    <Card className="overflow-hidden border hover:border-primary/30 transition-all">
      <div className="flex flex-col">
        <div className="p-3 flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarImage
                src={dependent.imageUrl || ""}
                alt={dependent.name}
              />
              <AvatarFallback>{getInitials(dependent.name)}</AvatarFallback>
            </Avatar>
            {!readOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background border border-border"
                onClick={() => onImageUpload("dependent", dependent.id)}
              >
                <Camera className="h-3 w-3" />
                <span className="sr-only">Ubah foto</span>
              </Button>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate leading-tight">
              {dependent.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge
                variant={
                  dependent.dependentType === DependentType.CHILD
                    ? "default"
                    : "secondary"
                }
                className="text-[10px] px-1 py-0 h-4"
              >
                {dependent.dependentType === DependentType.CHILD
                  ? "Anak"
                  : "Kerabat"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(dependent.birthDate)}
              </span>
            </div>
          </div>
        </div>

        <CardContent className="p-3 pt-0 pb-0 border-t border-border/20">
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate text-muted-foreground">
                {dependent.education}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate text-muted-foreground">
                {dependent.religion}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate text-muted-foreground">
                {dependent.maritalStatus}
              </span>
            </div>
          </div>
        </CardContent>

        {!readOnly && (
          <CardFooter className="p-2 flex justify-end gap-1 border-t border-border/20">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onEdit(dependent)}
            >
              <Pencil className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              onClick={() => onDelete(dependent)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Hapus
            </Button>
          </CardFooter>
        )}
      </div>
    </Card>
  );
}
