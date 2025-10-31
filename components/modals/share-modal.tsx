"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { createShareCode } from "@/lib/firestore";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  existingCode?: string | null;
}

export const ShareModal = ({
  isOpen,
  onClose,
  documentId,
  existingCode,
}: ShareModalProps) => {
  const [shareCode, setShareCode] = useState(existingCode || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateCode = async () => {
    try {
      setIsGenerating(true);
      const code = await createShareCode(documentId);
      setShareCode(code);
      toast.success("Share code generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate share code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Study Hub</DialogTitle>
          <DialogDescription>
            Generate a code that others can use to join this study hub
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!shareCode ? (
            <div className="text-center py-4">
              <Button onClick={handleGenerateCode} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate Share Code"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Share Code</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={shareCode}
                    readOnly
                    className="font-mono text-lg text-center tracking-wider"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Share this code with others to let them join
                </p>
              </div>

              <Button
                variant="outline"
                onClick={handleGenerateCode}
                disabled={isGenerating}
                className="w-full"
              >
                Generate New Code
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};