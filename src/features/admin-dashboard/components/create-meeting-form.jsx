import {
  X, Info, Type, Users, Clock, Calendar as CalendarIcon,
  RefreshCcw, MapPin, ChevronDown, List,
  Bold, Italic, Underline, Strikethrough,
  Quote, Link, AlignCenter, Layout, Undo, Redo,
  Highlighter, Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function CreateMeetingForm({ onClose, selectedDate }) {
  const formattedDate = selectedDate ? selectedDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).split('/').join('-') : "";

  return (
    <div className="flex flex-col h-full bg-white rounded-[32px] border border-brand-line shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-brand-line bg-brand-neutral/30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-brand-primary flex items-center justify-center">
              <CalendarIcon className="size-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-brand-ink">New meeting</h1>
          </div>
          <nav className="flex items-center gap-1">
            <button className="px-4 py-2 text-sm font-bold text-brand-primary border-b-2 border-brand-primary">Details</button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onClose} className="bg-brand-primary hover:bg-brand-primary text-white rounded-xl px-6 font-bold shadow-md transition-all active:scale-95">
            Save
          </Button>
          <Button variant="outline" onClick={onClose} className="rounded-xl px-6 font-bold border-brand-line text-brand-secondary hover:bg-brand-soft transition-all">
            Close
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col lg:flex-row min-h-full">
          {/* Main Form Area */}
          <div className="flex-1 p-6 lg:p-10 space-y-8 lg:border-r lg:border-brand-line">
            {/* Time zone and Info */}
            <div className="space-y-4">
              <button className="flex items-center gap-2 text-xs font-medium text-brand-secondary hover:text-brand-ink transition-colors group">
                Time zone: (UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi
                <ChevronDown className="size-3 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-brand-soft/50 border border-brand-line/50 text-sm">
                <Info className="size-5 text-brand-secondary shrink-0 mt-0.5" />
                <p className="text-brand-secondary leading-relaxed">
                  With your current Teams plan, you get up to 60 minutes per meeting with up to 100 participants. <button className="text-brand-primary font-bold hover:underline">Learn more</button>
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6 max-w-4xl">
              {/* Title */}
              <div className="flex gap-4 items-start">
                <div className="mt-3 text-brand-secondary shrink-0">
                  <Type className="size-5" />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Add title"
                    className="text-xl font-medium border-0 border-b border-brand-line rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-brand-primary transition-all placeholder:text-brand-secondary/40 h-auto"
                  />
                </div>
              </div>

              {/* Participants */}
              <div className="flex gap-4 items-start">
                <div className="mt-3 text-brand-secondary shrink-0">
                  <Users className="size-5" />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Enter name or email"
                    className="bg-brand-neutral/50 border-0 rounded-xl px-4 py-3 h-12 focus-visible:ring-2 focus-visible:ring-brand-primary/20 placeholder:text-brand-secondary/40"
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="flex gap-4 items-start">
                <div className="mt-3 text-brand-secondary shrink-0">
                  <Clock className="size-5" />
                </div>
                <div className="flex-1 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Input defaultValue={formattedDate} className="w-36 bg-brand-neutral/50 border-0 rounded-xl px-4" />
                    <Select defaultValue="00:00">
                      <SelectTrigger className="w-24 bg-brand-neutral/50 border-0 rounded-xl px-4">
                        <SelectValue placeholder="00:00" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="00:00">00:00</SelectItem>
                        <SelectItem value="00:30">00:30</SelectItem>
                        {/* More options... */}
                      </SelectContent>
                    </Select>
                  </div>

                  <ChevronDown className="size-4 text-brand-secondary rotate-[-90deg]" />

                  <div className="flex items-center gap-2">
                    <Input defaultValue={formattedDate} className="w-36 bg-brand-neutral/50 border-0 rounded-xl px-4" />
                    <Select defaultValue="00:30">
                      <SelectTrigger className="w-24 bg-brand-neutral/50 border-0 rounded-xl px-4">
                        <SelectValue placeholder="00:30" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="00:30">00:30</SelectItem>
                        <SelectItem value="01:00">01:00</SelectItem>
                        {/* More options... */}
                      </SelectContent>
                    </Select>
                  </div>

                  <span className="text-xs font-bold text-brand-secondary">30m</span>

                  <div className="flex items-center gap-3 ml-2">
                    <Switch id="all-day" />
                    <Label htmlFor="all-day" className="text-sm font-bold text-brand-secondary">All day</Label>
                  </div>
                </div>
              </div>

              {/* Repeat */}
              <div className="flex gap-4 items-start">
                <div className="mt-3 text-brand-secondary shrink-0">
                  <RefreshCcw className="size-5" />
                </div>
                <div className="flex-1 max-w-xs">
                  <Select defaultValue="none">
                    <SelectTrigger className="bg-brand-neutral/50 border-0 rounded-xl px-4 h-12">
                      <SelectValue placeholder="Does not repeat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Does not repeat</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location */}
              <div className="flex gap-4 items-start">
                <div className="mt-3 text-brand-secondary shrink-0">
                  <MapPin className="size-5" />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Add location"
                    className="bg-brand-neutral/50 border-0 rounded-xl px-4 py-3 h-12 focus-visible:ring-2 focus-visible:ring-brand-primary/20 placeholder:text-brand-secondary/40"
                  />
                </div>
              </div>

              {/* Rich Text Placeholder */}
              <div className="flex gap-4 items-start">
                <div className="mt-3 text-brand-secondary shrink-0">
                  <List className="size-5" />
                </div>
                <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border border-brand-line bg-brand-neutral/20">
                  <div className="flex items-center flex-wrap gap-1 p-2 bg-brand-neutral/40 border-b border-brand-line">
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg"><Bold className="size-4" /></Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg"><Italic className="size-4" /></Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg"><Underline className="size-4" /></Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg"><Strikethrough className="size-4" /></Button>
                    <div className="w-px h-6 bg-brand-line mx-1" />
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg"><Highlighter className="size-4" /></Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg"><Languages className="size-4" /></Button>
                    <div className="w-px h-6 bg-brand-line mx-1" />
                    <Select defaultValue="paragraph">
                      <SelectTrigger className="h-8 w-32 border-0 bg-transparent text-xs font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paragraph">Paragraph</SelectItem>
                        <SelectItem value="h1">Heading 1</SelectItem>
                        <SelectItem value="h2">Heading 2</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="w-px h-6 bg-brand-line mx-1" />
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg"><List className="size-4" /></Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg"><Quote className="size-4" /></Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg"><Link className="size-4" /></Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg"><AlignCenter className="size-4" /></Button>
                    <div className="w-px h-6 bg-brand-line mx-1" />
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg"><Undo className="size-4" /></Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg"><Redo className="size-4" /></Button>
                  </div>
                  <textarea
                    className="w-full h-48 p-4 bg-transparent resize-none border-0 focus:ring-0 text-sm leading-relaxed placeholder:text-brand-secondary/40"
                    placeholder="Type details for this new meeting"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="w-full lg:w-[320px] bg-brand-neutral/10 p-6 lg:p-10 space-y-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-brand-secondary">Who can bypass the lobby?</Label>
                <Select defaultValue="invited">
                  <SelectTrigger className="bg-white border-brand-line rounded-xl px-4 h-12 shadow-sm">
                    <SelectValue placeholder="People who were invited" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invited">People who were invited</SelectItem>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="only-me">Only me</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-brand-secondary">Who can present</Label>
                <Select defaultValue="everyone">
                  <SelectTrigger className="bg-white border-brand-line rounded-xl px-4 h-12 shadow-sm">
                    <SelectValue placeholder="Everyone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="invited">People who were invited</SelectItem>
                    <SelectItem value="only-me">Only me</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-6 border-t border-brand-line/50">
              <button className="flex items-center gap-3 text-brand-secondary hover:text-brand-ink transition-all font-bold group">
                <div className="size-8 rounded-lg bg-brand-soft flex items-center justify-center group-hover:bg-brand-line transition-colors">
                  <Layout className="size-4" />
                </div>
                Response options
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
