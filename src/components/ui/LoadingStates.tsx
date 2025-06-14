
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[80px] mb-2" />
            <Skeleton className="h-3 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </div>
    
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4 animate-fade-in">
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
        </CardHeader>
        <CardContent className="pl-2">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
      
      <Card className="col-span-3 animate-fade-in">
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-4 animate-fade-in">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-10 w-[120px]" />
    </div>
    
    <div className="border rounded-md">
      <div className="grid grid-cols-4 gap-4 p-4 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const FormSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="space-y-2">
      <Skeleton className="h-4 w-[100px]" />
      <Skeleton className="h-10 w-full" />
    </div>
    
    <div className="space-y-2">
      <Skeleton className="h-4 w-[80px]" />
      <Skeleton className="h-10 w-full" />
    </div>
    
    <div className="space-y-2">
      <Skeleton className="h-4 w-[120px]" />
      <Skeleton className="h-24 w-full" />
    </div>
    
    <div className="flex justify-end space-x-2">
      <Skeleton className="h-10 w-[100px]" />
      <Skeleton className="h-10 w-[80px]" />
    </div>
  </div>
);

export const CardListSkeleton = ({ items = 6 }: { items?: number }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: items }).map((_, i) => (
      <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-[60px]" />
              <Skeleton className="h-8 w-[80px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
