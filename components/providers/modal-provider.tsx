"use client";

import { useEffect, useState } from "react";
import { SettingsModal } from "@/components/modals/settings-modal";
import { ShareModal } from "@/components/modals/share-modal";
import { JoinModal } from "@/components/modals/join-modal";
import { useShareModal } from "@/hooks/use-share-modal";
import { useJoinModal } from "@/hooks/use-join-modal";

const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);
  const shareModal = useShareModal();
  const joinModal = useJoinModal();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <SettingsModal />
      {shareModal.documentId && (
        <ShareModal
          isOpen={shareModal.isOpen}
          onClose={shareModal.onClose}
          documentId={shareModal.documentId}
          existingCode={shareModal.existingCode}
        />
      )}
      <JoinModal isOpen={joinModal.isOpen} onClose={joinModal.onClose} />
    </>
  );
};

export default ModalProvider;