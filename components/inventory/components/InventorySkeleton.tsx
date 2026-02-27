import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function InventorySkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                    <div className="h-1 bg-gray-200 animate-pulse" />
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="space-y-2 flex-1">
                                <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="flex gap-2 pt-2">
                            <div className="h-9 flex-1 bg-gray-200 rounded animate-pulse" />
                            <div className="h-9 w-14 bg-gray-200 rounded animate-pulse" />
                            <div className="h-9 w-14 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
