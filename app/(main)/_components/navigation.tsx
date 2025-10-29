"use client";

import { cn } from "@/lib/utils";
import {
  ChevronsLeft,
  MenuIcon,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Trash,
} from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { ElementRef, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import UserItem from "./user-item";
import Item from "./item";
import { toast } from "sonner";
import DocumentList from "./document-list";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TrashBox from "./trash-box";
import useSearch from "@/hooks/use-search";
import useSettings from "@/hooks/use-settings";
import Navbar from "./navbar";
import { createDocument } from "@/lib/firestore";

const Navigation = () => {
  const router = useRouter();
  const search = useSearch();
  const settings = useSettings();
  const params = useParams();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width:768px)");

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;

    let newWidth = event.clientX;

    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`
      );
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 240px)"
      );
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");
    }

    setTimeout(() => {
      setIsResetting(false);
    }, 300);
  };

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsResetting(true);
      setIsCollapsed(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");

      setTimeout(() => {
        setIsResetting(false);
      }, 300);
    }
  };

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [isMobile, pathname]);

  const handleCreateStudyHub = async () => {
    try {
      const documentId = await createDocument({
        title: "Untitled Subject",
        type: "studyhub",
        isSubject: true,
      });

      toast.success("Subject created successfully!");
      router.push(`/documents/${documentId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create subject");
    }
  };

  const handleCreatePrivate = async (isSubject: boolean = false) => {
    try {
      const documentId = await createDocument({
        title: isSubject ? "Untitled Subject" : "Untitled",
        type: "private",
        isSubject,
      });

      toast.success(
        isSubject ? "Subject created successfully!" : "Note created successfully!"
      );
      router.push(`/documents/${documentId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create document");
    }
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[9999]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "opacity-100"
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>
        <div>
          <UserItem />
          <Item onClick={search.onOpen} label="Search" icon={Search} isSearch />
          <Item onClick={settings.onOpen} label="Settings" icon={Settings} />
        </div>

        {/* Study Hubs Section */}
        <div className="mt-4">
          <div className="px-3 py-1 flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground">
              Study Hubs
            </p>
            <button
              onClick={handleCreateStudyHub}
              className="text-muted-foreground hover:text-primary p-1 rounded-sm hover:bg-neutral-200 dark:hover:bg-neutral-700"
              title="New Subject"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <DocumentList type="studyhub" />
        </div>

        {/* Private Section */}
        <div className="mt-4">
          <div className="px-3 py-1 flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground">
              Private
            </p>
            <div className="flex gap-x-1">
              <button
                onClick={() => handleCreatePrivate(true)}
                className="text-muted-foreground hover:text-primary p-1 rounded-sm hover:bg-neutral-200 dark:hover:bg-neutral-700"
                title="New Subject"
              >
                <PlusCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleCreatePrivate(false)}
                className="text-muted-foreground hover:text-primary p-1 rounded-sm hover:bg-neutral-200 dark:hover:bg-neutral-700"
                title="New Note"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <DocumentList type="private" />
        </div>

        {/* Trash */}
        <div className="mt-4">
          <Popover>
            <PopoverTrigger className="w-full mt-4">
              <Item label="Trash" icon={Trash} />
            </PopoverTrigger>
            <PopoverContent
              className="w-72 p-0"
              side={isMobile ? "bottom" : "right"}
            >
              <TrashBox />
            </PopoverContent>
          </Popover>
        </div>

        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="opacity-0 group-hover/sidebar:opacity-100 transition
      cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </aside>
      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full"
        )}
      >
        {!!params.documentId ? (
          <Navbar isCollapsed={isCollapsed} onResetWidth={resetWidth} />
        ) : (
          <nav className="bg-transparent px-3 py-2 w-full">
            {isCollapsed && (
              <MenuIcon
                onClick={resetWidth}
                role="button"
                className="h-6 w-6 text-muted-foreground"
              />
            )}
          </nav>
        )}
      </div>
    </>
  );
};

export default Navigation;