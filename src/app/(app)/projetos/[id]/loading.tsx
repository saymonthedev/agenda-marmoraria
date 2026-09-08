import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-9 w-24" />
      </div>
      <Skeleton className="h-56 rounded-xl" />
      <Skeleton className="h-10 w-80" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  )
}
