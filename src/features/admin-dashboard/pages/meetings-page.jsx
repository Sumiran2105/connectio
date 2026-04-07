import { useState } from "react";
import { AdminLayout } from "../components/admin-layout";
import { Calendar } from "@/components/ui/calendar";
import { CreateMeetingForm } from "../components/create-meeting-form";

export function MeetingsPage() {
  const [date, setDate] = useState(new Date());
  const [isCreating, setIsCreating] = useState(false);

  const events = [
    {
      id: 1,
      title: "Team Standup",
      time: "09:00 AM - 09:30 AM",
      date: "Today",
      color: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
    },
    {
      id: 2,
      title: "Client Review Meeting",
      time: "11:30 AM - 12:30 PM",
      date: "Today",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    {
      id: 3,
      title: "Product Demo",
      time: "03:00 PM - 04:00 PM",
      date: "Tomorrow",
      color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    },
  ];

  return (
    <AdminLayout>
      {isCreating ? (
        <CreateMeetingForm 
          selectedDate={date} 
          onClose={() => setIsCreating(false)} 
        />
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-brand-ink">
                Meetings Calendar
              </h1>
              <p className="text-sm text-brand-secondary">
                Manage meetings, schedules, reminders and upcoming activities.
              </p>
            </div>

            <button 
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center justify-center rounded-2xl bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-[0.98]"
            >
              + Create Event
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <div className="rounded-[32px] border border-brand-line bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between px-2">
                <h2 className="text-lg font-bold text-brand-ink">
                  Select Date
                </h2>
              </div>

              <div className="rounded-2xl border border-brand-line p-2 bg-brand-neutral/50">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="w-full"
                />
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="px-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-secondary/60">
                  Upcoming Events
                </h3>

                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className={`rounded-2xl border p-4 transition-all hover:shadow-md hover:translate-y-[-2px] ${event.color}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold">{event.title}</h4>
                          <p className="mt-1 text-xs opacity-80 font-medium">{event.time}</p>
                        </div>
                        <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase border border-current/10">
                          {event.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Total Events", value: "28" },
                  { label: "Today Meetings", value: "5" },
                  { label: "Pending Approvals", value: "3" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-[28px] border border-brand-line bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-secondary/60">{stat.label}</p>
                    <h2 className="mt-2 text-3xl font-extrabold text-brand-ink">{stat.value}</h2>
                  </div>
                ))}
              </div>

              <div className="rounded-[32px] border border-brand-line bg-white p-8 shadow-sm">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-brand-ink">
                      Daily Schedule
                    </h2>
                    <p className="text-sm text-brand-secondary mt-1">
                      Your planned events for the selected day.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-col gap-4 rounded-2xl border border-brand-line p-5 group hover:border-brand-primary/30 hover:bg-brand-neutral/30 transition-all duration-300 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-1.5 rounded-full bg-brand-primary group-hover:scale-y-110 transition-transform" />
                        <div>
                          <h3 className="text-base font-bold text-brand-ink group-hover:text-brand-primary transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-sm font-medium text-brand-secondary/80">
                            {event.time}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button className="rounded-xl border border-brand-line px-5 py-2.5 text-sm font-bold text-brand-ink transition-all hover:bg-brand-soft hover:border-brand-primary/20">
                          Edit
                        </button>
                        <button className="rounded-xl bg-brand-ink px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-primary hover:shadow-lg active:scale-95">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
