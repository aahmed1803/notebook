"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { joinStudyHub, getDocument } from "@/lib/firestore";
import { useDocument } from "@/hooks/use-document";

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinModal = ({ isOpen, onClose }: JoinModalProps) => {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { addDocument } = useDocument();

  const handleJoin = async () => {
    if (!code.trim()) {
      toast.error("Please enter a share code");
      return;
    }

    try {
      setIsJoining(true);
      const documentId = await joinStudyHub(code.trim().toUpperCase());
      
      // Fetch and add to global state
      const studyHub = await getDocument(documentId);
      addDocument(studyHub);

      toast.success("Successfully joined study hub!");
      setCode("");
      onClose();
      router.push(`/documents/${documentId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to join study hub");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Study Hub</DialogTitle>
          <DialogDescription>
            Enter the share code to join a study hub
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Share Code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              maxLength={6}
              className="font-mono text-lg text-center tracking-wider uppercase"
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
          </div>

          <Button
            onClick={handleJoin}
            disabled={isJoining || code.length !== 6}
            className="w-full"
          >
            {isJoining ? "Joining..." : "Join Study Hub"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};