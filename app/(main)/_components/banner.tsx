"use client";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { deleteDocument, restoreDocument } from "@/lib/firestore";

interface BannerProps {
  documentId: string;
}

const Banner = ({ documentId }: BannerProps) => {
  const router = useRouter();

  const onRemove = async () => {
    try {
      await deleteDocument(documentId);
      toast.success("Note successfully deleted!");
      router.push("/documents");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete note");
    }
  };

  const onRestore = async () => {
    try {
      await restoreDocument(documentId);
      toast.success("Note successfully restored!");
    } catch (error : any) {
      toast.error(error.message || "Failed to restore note");
    }
  };

  return (
    <div
      className="w-full bg-rose-500 text-center text-sm p-2
    text-white flex items-center gap-x-2 justify-center"
    >
      <p>This page is in the Trash.</p>
      <Button
        size="sm"
        onClick={onRestore}
        variant="outline"
        className="border-white bg-transparent hover:bg-primary/5 text-white 
        hover:text-white p-1 px-2 h-auto font-normal"
      >
        Restore
      </Button>
      <ConfirmModal onConfirm={onRemove}>
        <Button
          size="sm"
          variant="outline"
          className="border-white bg-transparent hover:bg-primary/5 text-white 
        hover:text-white p-1 px-2 h-auto font-normal"
        >
          Delete forever
        </Button>
      </ConfirmModal>
    </div>
  );
};

export default Banner;