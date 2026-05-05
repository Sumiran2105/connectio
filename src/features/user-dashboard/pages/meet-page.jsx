import { useState } from "react";
import {
  Link,
  Calendar,
  Hash,
  Phone,
  MoreVertical,
  X,
  Bold,
  Italic,
  Underline,
  Code2,
} from "lucide-react";
import { UserLayout } from "../components/user-layout";

const recentCalls = [
  {
    id: 1,
    name: "Aniket Jadhav",
    duration: "0m 59s",
    date: "30/03",
    status: "answered",
  },
  {
    id: 2,
    name: "Aniket Jadhav",
    duration: null,
    date: "30/03",
    status: "no-answer",
  },
  {
    id: 3,
    name: "arjun",
    duration: "2m 15s",
    date: "28/03",
    status: "answered",
  },
];

function Avatar({ name, size = "size-12" }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["bg-pink-400", "bg-purple-400", "bg-blue-400", "bg-green-400"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`shrink-0 ${size} rounded-full ${color} flex items-center justify-center font-bold text-white text-sm shadow-sm`}>
      {initials}
    </div>
  );
}

export function MeetPage() {
  const [meetingLink, setMeetingLink] = useState("");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    participants: "",
    startDate: "08-04-2026",
    startTime: "14:30",
    endDate: "08-04-2026",
    endTime: "15:00",
    duration: "30m",
    allDay: false,
    repeat: "Does not repeat",
    location: "",
    description: "",
    bypassLobby: "People who were invited",
    canPresent: "Everyone",
  });

  function generateMeetingLink() {
    const link = `meet-${Math.random().toString(36).substr(2, 9)}`;
    setMeetingLink(link);
  }

  function handleFormChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleSaveMeeting() {
    console.log("Meeting scheduled:", formData);
    setIsScheduleOpen(false);
  }

  return (
    <UserLayout>
      <div className="fixed top-20 bottom-0 left-0 lg:left-[72px] right-0 bg-gray-50 z-[20] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 sm:py-10 lg:px-12 [scrollbar-width:thin]">
          <div className="mx-auto w-full flex flex-col gap-10 max-w-[1920px]">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Meet</h1>
              <p className="text-gray-600">Start, join, or schedule meetings</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              <button
                onClick={generateMeetingLink}
                className="flex items-center gap-4 px-8 py-6 rounded-xl bg-gradient-to-br bg-white border-2 border-gray-300 text-gray-900 hover:border-gray-400 hover:shadow-md transition-all active:scale-95 group"
              >
                <div className="p-3 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                  <Link className="size-6" />
                </div>
                <span className="text-lg font-semibold">Create a meeting link</span>
              </button>

              <button
                onClick={() => setIsScheduleOpen(true)}
                className="flex items-center gap-4 px-8 py-6 rounded-xl bg-white border-2 border-gray-300 text-gray-900 hover:border-gray-400 hover:shadow-md transition-all active:scale-95"
              >
                <div className="p-3 bg-pink-100 rounded-lg">
                  <Calendar className="size-6 text-pink-600" />
                </div>
                <span className="text-lg font-semibold">Schedule a meeting</span>
              </button>

              <button className="flex items-center gap-4 px-8 py-6 rounded-xl bg-white border-2 border-gray-300 text-gray-900 hover:border-gray-400 hover:shadow-md transition-all active:scale-95">
                <div className="p-3 bg-brand-primary/10 rounded-lg">
                  <Hash className="size-6 text-brand-primary" />
                </div>
                <span className="text-lg font-semibold">Join with a meeting ID</span>
              </button>
            </div>

            {/* Meeting Links Section */}
            <div className="bg-white rounded-2xl p-8 mb-12 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Meeting links</h2>

              {meetingLink ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/20">
                  <div className="p-3 bg-brand-primary/20 rounded-lg shrink-0">
                    <Link className="size-6 text-brand-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600">Your meeting link</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 break-all">{meetingLink}</p>
                  </div>
                  <button className="w-full sm:w-auto px-6 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-all text-sm font-bold shadow-sm active:scale-95">
                    Copy
                  </button>
                </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="text-4xl">🔗</div>
                  </div>
                  <p className="text-gray-600 text-lg mb-2">Quickly create, save, and share links with anyone.</p>
                  <a href="#" className="text-brand-primary hover:text-brand-primary/80 font-semibold">
                    Learn more about meeting links
                  </a>
                </div>
              )}
            </div>

            {/* Recent Calls Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent calls</h2>
                <button className="text-brand-primary hover:text-brand-primary/80 font-semibold text-sm">View all</button>
              </div>

              <div className="space-y-3">
                {recentCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-primary/30 hover:shadow-md transition-all group gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar name={call.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-gray-900 truncate">{call.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Phone className="size-3.5 text-gray-500" />
                          {call.status === "answered" ? (
                            <p className="text-sm text-gray-600 font-medium">{call.duration}</p>
                          ) : (
                            <p className="text-sm text-red-500 font-medium">No answer</p>
                          )}
                          <span className="sm:hidden text-xs text-gray-400 ml-auto">{call.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <span className="hidden sm:block text-sm text-gray-500 font-medium">{call.date}</span>
                      <div className="flex items-center gap-2 flex-1 sm:flex-none">
                        <button className="flex-1 sm:flex-none px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-all font-bold text-sm shadow-sm active:scale-95">
                          Call
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                          <MoreVertical className="size-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[100] flex items-center justify-center p-0 sm:p-4 transition-all">
          <div className="bg-white sm:rounded-2xl w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl scale-100 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 sm:px-8 sm:py-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-brand-primary rounded-lg shrink-0">
                  <Calendar className="size-5 sm:size-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">New meeting</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Details</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={handleSaveMeeting}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-all font-bold text-sm shadow-sm active:scale-95"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsScheduleOpen(false)}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-all font-bold text-sm active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Timezone Info */}
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <span>Time zone: (UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi</span>
              </div>

              {/* Info Alert */}
              <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-lg p-4 text-sm text-gray-700">
                With your current Teams plan, you get up to 60 minutes per meeting with up to 100 participants.
              </div>

              {/* Title Field */}
              <div>
                <input
                  type="text"
                  placeholder="Add title"
                  value={formData.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  className="w-full text-lg font-medium pb-2 border-b-2 border-brand-primary focus:outline-none focus:border-brand-primary placeholder:text-gray-400"
                />
              </div>

              {/* Participants Field */}
              <div>
                <input
                  type="text"
                  placeholder="Enter name or email"
                  value={formData.participants}
                  onChange={(e) => handleFormChange("participants", e.target.value)}
                  className="w-full px-0 py-2 border-b border-gray-300 focus:outline-none focus:border-gray-400 placeholder:text-gray-400"
                />
              </div>

              {/* Date and Time Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="w-full">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleFormChange("startDate", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                  />
                </div>
                <div className="w-full">
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleFormChange("startTime", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                  />
                </div>
                <div className="hidden lg:flex items-center justify-center text-gray-400">→</div>
                <div className="w-full">
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleFormChange("endTime", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                  />
                </div>
              </div>

              {/* Duration and All Day */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => handleFormChange("duration", e.target.value)}
                    placeholder="Duration"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-100">
                  <input
                    type="checkbox"
                    id="allDay"
                    checked={formData.allDay}
                    onChange={(e) => handleFormChange("allDay", e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/30"
                  />
                  <label htmlFor="allDay" className="text-sm font-medium text-gray-700 cursor-pointer">All day</label>
                </div>
              </div>

              {/* Repeat Field */}
              <div>
                <select
                  value={formData.repeat}
                  onChange={(e) => handleFormChange("repeat", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                >
                  <option>Does not repeat</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>

              {/* Location Field */}
              <div>
                <input
                  type="text"
                  placeholder="Add location"
                  value={formData.location}
                  onChange={(e) => handleFormChange("location", e.target.value)}
                  className="w-full px-0 py-2 border-b border-gray-300 focus:outline-none focus:border-gray-400 placeholder:text-gray-400"
                />
              </div>

              {/* Description Field */}
              <div>
                <div className="flex items-center gap-2 mb-3 border-b border-gray-300 pb-3">
                  <Bold className="size-4 text-gray-600 cursor-pointer hover:text-gray-900" />
                  <Italic className="size-4 text-gray-600 cursor-pointer hover:text-gray-900" />
                  <Underline className="size-4 text-gray-600 cursor-pointer hover:text-gray-900" />
                  <Code2 className="size-4 text-gray-600 cursor-pointer hover:text-gray-900" />
                </div>
                <textarea
                  placeholder="Type details for this new meeting"
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none h-32"
                />
              </div>

              {/* Right Column Options */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">Who can bypass the lobby?</label>
                  <select
                    value={formData.bypassLobby}
                    onChange={(e) => handleFormChange("bypassLobby", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  >
                    <option>People who were invited</option>
                    <option>Everyone</option>
                    <option>Only organizers</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">Who can present?</label>
                  <select
                    value={formData.canPresent}
                    onChange={(e) => handleFormChange("canPresent", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  >
                    <option>Everyone</option>
                    <option>Only organizers</option>
                    <option>People who were invited</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </UserLayout>
  );
}
