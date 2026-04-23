import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SharedChannelSidebar } from "@/features/channels/components/channel-sidebar";
import { CreateChannelDialog } from "./create-channel-dialog";

export function ChannelSidebar({
  channels,
  selectedChannel,
  onSelectChannel,
  isOpen,
  createDialog,
}) {
  return (
    <SharedChannelSidebar
      title="Channels"
      subtitle="Manage workspace channels"
      channels={channels}
      selectedChannelId={selectedChannel?.id}
      onSelectChannel={onSelectChannel}
      isOpen={isOpen}
      renderHeaderAction={() => <CreateChannelDialog {...createDialog} />}
      renderBottomAction={() => (
        <Button className="h-11 w-full rounded-[20px] bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600">
          <PlusCircle className="mr-2 size-4" />
          New Message
        </Button>
      )}
    />
  );
}
