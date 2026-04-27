"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function InquiryStatusUpdate({
  inquiryId,
  currentStatus,
}: {
  inquiryId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (status === currentStatus) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Status updated");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Update Status</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REPLIED">Replied</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Button
          className="w-full"
          variant="outline"
          onClick={handleUpdate}
          disabled={loading || status === currentStatus}
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Update Status
        </Button>
      </CardContent>
    </Card>
  );
}
