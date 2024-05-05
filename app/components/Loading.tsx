import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Loader2 className="size-8 animate-spin" />
      <p>加载中...</p>
    </div>
  );
}
