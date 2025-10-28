"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MenuIcon } from "lucide-react";
import Title from "./title";
import Banner from "./banner";
import Menu from "./menu";
import { getDocument, type Document } from "@/lib/firestore";
import { toast } from "sonner";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  const params = useParams();
  const [document, setDocument] = useState<Document | null | undefined>(undefined);

  useEffect(() => {
    if (!params.documentId || typeof params.documentId !== "string") {
      setDocument(null);
      return;
    }

    const fetchDocument = async () => {
      try {
        const doc = await getDocument(params.documentId as string);
        setDocument(doc);
      } catch (error: any) {
        console.error("Error fetching document:", error);
        toast.error("Failed to load document");
        setDocument(null);
      }
    };

    fetchDocument();
  }, [params.documentId]);

  if (document === undefined) {
    return (
      <nav
        className="bg-background dark:bg-[#1f1f1f] px-3 py-2 w-full
      flex items-center justify-between"
      >
        <Title.Skeleton />
        <div className="flex items-center gap-x-2">
          <Menu.Skeleton />
        </div>
      </nav>
    );
  }

  if (document === null) {
    return null;
  }

  return (
    <>
      <nav
        className="bg-background dark:bg-[#1f1f1f] px-3 py-2 w-full
      flex items-center gap-x-4"
      >
        {isCollapsed && (
          <MenuIcon
            role="button"
            onClick={onResetWidth}
            className="h-6 w-6 text-muted-foreground"
          />
        )}
        <div className="flex items-center justify-between w-full">
          <Title initialData={document} />
          <div className="flex items-center gap-x-2">
            <Menu documentId={document.id} />
          </div>
        </div>
      </nav>
      {document.isArchived && <Banner documentId={document.id} />}
    </>
  );
};

export default Navbar;