import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-6 h-6" />
            404 Page Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
