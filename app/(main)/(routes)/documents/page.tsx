"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createDocument } from "@/lib/firestore";
import { auth } from "@/lib/firebase";

import { useDocument } from "@/hooks/use-document";
import { getDocument } from "@/lib/firestore";

const DocumentsPage = () => {
  const router = useRouter();
  const user = auth.currentUser;
  const { addDocument } = useDocument();


  const onCreate = async () => {
    try {
      const documentId = await createDocument({
        title: "Untitled",
        type: "private",
        isSubject: false,
      });
  
      // Fetch and add to global state
      const newDoc = await getDocument(documentId);
      addDocument(newDoc);
  
      toast.success("Note created successfully!");
      router.push(`/documents/${documentId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create a new document");
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Image
        src="/empty.png"
        alt="Empty"
        height="300"
        width="300"
        className="dark:hidden"
      />
      <Image
        src="/empty-dark.png"
        alt="Empty"
        height="300"
        width="300"
        className="hidden dark:block"
      />
      <h2 className="text-lg font-medium">
        Welcome to {user?.displayName || user?.email?.split('@')[0] || 'User'}&apos;s Jotion
      </h2>
      <Button onClick={onCreate}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Create a Note
      </Button>
    </div>
  );
};

export default DocumentsPage;