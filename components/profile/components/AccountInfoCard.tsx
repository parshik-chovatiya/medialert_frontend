import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { AccountInfoCardProps } from "@/components/profile/types";

export function AccountInfoCard({ user, formatDate }: AccountInfoCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 items-center">
                    <Label className="text-right font-medium">Member Since</Label>
                    <div className="col-span-2">
                        <p className="text-gray-900">{user.date_joined ? formatDate(user.date_joined) : "Not available"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                    <Label className="text-right font-medium">Timezone</Label>
                    <div className="col-span-2">
                        <p className="text-gray-900">{user.timezone}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
