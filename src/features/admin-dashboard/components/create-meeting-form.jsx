import React, { useState, useEffect } from "react";
import {
  X, Info, Type, Users, Clock, Calendar as CalendarIcon,
  ChevronDown, Hash, Shield, Globe, MoreHorizontal,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/client";
import { CHANNELS_LIST, MEETINGS_CREATE } from "@/config/api";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

export function CreateMeetingForm({ onClose, selectedDate }) {
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    meeting_type: "public",
    channel_id: "",
    scheduled_at: selectedDate ? new Date(selectedDate) : new Date(),
  });

  const session = useAuthStore((state) => state.session);
  const token = session?.accessToken;

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(CHANNELS_LIST, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const channelData = Array.isArray(response.data) ? response.data : (response.data?.items || []);
        setChannels(channelData);
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchChannels();
  }, [token]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.channel_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        title: formData.title,
        meeting_type: formData.meeting_type,
        channel_id: formData.channel_id,
        scheduled_at: formData.scheduled_at.toISOString(),
      };

      await apiClient.post(MEETINGS_CREATE, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      toast.success("Meeting scheduled successfully");
      onClose();
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error(error.response?.data?.message || "Failed to schedule meeting");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-20 bottom-0 left-0 lg:left-[292px] right-0 z-[35] flex flex-col bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-brand-line bg-brand-neutral/10">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <Video className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-brand-ink">Schedule Meeting</h1>
            <p className="text-sm text-brand-secondary">Configure your new collaboration session</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onClose} className="rounded-xl px-6 font-bold text-brand-secondary hover:bg-brand-soft">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl px-8 h-12 font-bold shadow-xl shadow-brand-primary/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Scheduling..." : "Create Meeting"}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-3xl mx-auto space-y-12">
          
          {/* Meeting Title */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-secondary">
              <Type className="size-4" />
              <Label className="text-xs font-black uppercase tracking-[0.2em]">Meeting Title</Label>
            </div>
            <Input
              placeholder="Enter a descriptive title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="text-2xl font-bold h-16 rounded-2xl border-2 border-brand-line focus:border-brand-primary/30 focus:ring-brand-primary/10 transition-all px-6"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Meeting Type */}
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2 text-brand-secondary">
                <Globe className="size-4" />
                <Label className="text-xs font-black uppercase tracking-[0.2em]">Privacy Level</Label>
              </div>
              <Select 
                value={formData.meeting_type} 
                onValueChange={(val) => setFormData({ ...formData, meeting_type: val })}
              >
                <SelectTrigger className="w-full h-14 rounded-xl border-brand-line bg-white shadow-sm hover:border-brand-primary/30 transition-all px-6">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white rounded-2xl border border-brand-line shadow-2xl p-1">
                  <SelectItem value="public" className="rounded-lg py-3 focus:bg-brand-soft">
                    <span className="font-bold">Public</span>
                  </SelectItem>
                  <SelectItem value="private" className="rounded-lg py-3 focus:bg-brand-soft">
                    <span className="font-bold">Private</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Channel */}
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2 text-brand-secondary">
                <Hash className="size-4" />
                <Label className="text-xs font-black uppercase tracking-[0.2em]">Primary Channel</Label>
              </div>
              <Select 
                value={formData.channel_id} 
                onValueChange={(val) => setFormData({ ...formData, channel_id: val })}
              >
                <SelectTrigger className="w-full h-14 rounded-xl border-brand-line bg-white shadow-sm hover:border-brand-primary/30 transition-all px-6">
                  <SelectValue placeholder={isLoading ? "Loading..." : "Select channel"} />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white rounded-2xl border border-brand-line shadow-2xl p-1 max-h-[300px]">
                  {channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id} className="rounded-lg py-3 focus:bg-brand-soft">
                      <span className="font-bold">{channel.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Schedule Time */}
          <div className="space-y-6 pt-6 border-t border-brand-line/50">
            <div className="flex items-center gap-2 text-brand-secondary">
              <Clock className="size-4" />
              <Label className="text-xs font-black uppercase tracking-[0.2em]">Scheduled Date & Time</Label>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-brand-secondary group-focus-within:text-brand-primary transition-colors" />
                <Input
                  type="date"
                  value={formData.scheduled_at.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = new Date(formData.scheduled_at);
                    const [y, m, d] = e.target.value.split('-');
                    newDate.setFullYear(parseInt(y), parseInt(m) - 1, parseInt(d));
                    setFormData({ ...formData, scheduled_at: newDate });
                  }}
                  className="pl-12 h-14 rounded-xl border-brand-line bg-brand-soft/30 focus:bg-white transition-all"
                />
              </div>
              
              <div className="relative flex-1 group">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-brand-secondary group-focus-within:text-brand-primary transition-colors" />
                <Input
                  type="time"
                  value={formData.scheduled_at.toTimeString().slice(0, 5)}
                  onChange={(e) => {
                    const newDate = new Date(formData.scheduled_at);
                    const [h, min] = e.target.value.split(':');
                    newDate.setHours(parseInt(h), parseInt(min));
                    setFormData({ ...formData, scheduled_at: newDate });
                  }}
                  className="pl-12 h-14 rounded-xl border-brand-line bg-brand-soft/30 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-3xl bg-brand-soft/50 border border-brand-line/50">
              <Info className="size-5 text-brand-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-brand-ink">Automated Notification</p>
                <p className="text-brand-secondary mt-1">
                  Workspace members in the selected channel will receive an invitation when this meeting starts.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
