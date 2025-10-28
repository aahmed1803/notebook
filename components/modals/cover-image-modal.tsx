"use client";

import useCoverImage from "@/hooks/use-cover-image";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { useParams } from "next/navigation";
import { SingleImageDropzone } from "../single-image-dropzone";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { updateDocument } from "@/lib/firestore";
import { toast } from "sonner";

const CoverImageModal = () => {
  const params = useParams();
  const [file, setFile] = useState<File>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const coverImage = useCoverImage();

  const onClose = () => {
    setFile(undefined);
    setIsSubmitting(false);
    coverImage.onClose();
  };

  const onChange = async (file?: File) => {
    if (file) {
      setIsSubmitting(true);
      setFile(file);

      try {
        const documentId = params.documentId as string;
        
        // Create a reference to the file location in Firebase Storage
        const timestamp = Date.now();
        const storageRef = ref(
          storage,
          `covers/${documentId}/${timestamp}-${file.name}`
        );

        // Upload the file
        await uploadBytes(storageRef, file);

        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);

        // Update the document with the new cover image URL
        await updateDocument(documentId, {
          coverImage: downloadURL,
        });

        toast.success("Cover image uploaded successfully!");
        onClose();
      } catch (error: any) {
        console.error("Error uploading cover image:", error);
        toast.error(error.message || "Failed to upload cover image");
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-center text-lg font-semibold">Cover Image</h2>
        </DialogHeader>
        <SingleImageDropzone
          className="w-full outline-none"
          disabled={isSubmitting}
          value={file}
          onChange={onChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CoverImageModal;