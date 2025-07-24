"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"

export default function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-24 w-full" />
          
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
            
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-1/3" />
            
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-1/3" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    </div>
  )
} 