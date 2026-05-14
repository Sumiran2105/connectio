import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Video,
  MoreVertical,
  Calendar as CalIcon,
  X,
  Check,
} from "lucide-react";
import { UserLayout } from "../components/user-layout";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const EVENT_COLORS = [
  { label:"Blue",    value:"bg-blue-500"    },
  { label:"Green",   value:"bg-brand-primary" },
  { label:"Purple",  value:"bg-purple-500"  },
  { label:"Pink",    value:"bg-pink-500"    },
  { label:"Amber",   value:"bg-amber-500"   },
  { label:"Rose",    value:"bg-rose-500"    },
];

const EVENT_TYPES = ["meet","call"];

function pad(n) { return String(n).padStart(2,"0"); }
function dateKey(y,m,d) { return `${y}-${pad(m+1)}-${pad(d)}`; }

const today = new Date();

const INITIAL_EVENTS = {
  "2026-04-08":[
    { id:1,title:"Team Standup",    time:"9:00 AM", duration:"30 min",color:"bg-blue-500",   type:"meet",attendees:6  },
    { id:2,title:"Design Review",   time:"11:30 AM",duration:"1 hr",  color:"bg-purple-500", type:"meet",attendees:4  },
  ],
  "2026-04-10":[
    { id:3,title:"Sprint Planning", time:"10:00 AM",duration:"2 hrs", color:"bg-brand-primary",type:"meet",attendees:8 },
  ],
  "2026-04-14":[
    { id:4,title:"Client Call",     time:"3:00 PM", duration:"45 min",color:"bg-amber-500",  type:"call",attendees:3  },
    { id:5,title:"Product Demo",    time:"5:00 PM", duration:"1 hr",  color:"bg-pink-500",   type:"meet",attendees:12 },
  ],
  "2026-04-17":[
    { id:6,title:"All Hands",       time:"11:00 AM",duration:"1.5 hrs",color:"bg-emerald-500",type:"meet",attendees:40},
  ],
};

const BLANK_FORM = { title:"",date:"",time:"",duration:"30 min",type:"meet",attendees:2,color:"bg-blue-500" };

export function CalendarPage() {
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [events,setEvents] = useState(INITIAL_EVENTS);
  const [showModal,setShowModal] = useState(false);
  const [form,setForm] = useState(BLANK_FORM);
  const [errors,setErrors] = useState({});

  const firstDay   = new Date(year,month,1).getDay();
  const daysInMonth= new Date(year,month+1,0).getDate();
  const cells = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);

  function prevMonth(){ if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); }
  function nextMonth(){ if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); }

  const selectedKey    = dateKey(year,month,selectedDay);
  const selectedEvents = events[selectedKey]||[];
  const isToday = (d) => d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear();

  /* ── Modal helpers ── */
  function openModal(){
    const defaultDate = dateKey(year,month,selectedDay);
    setForm({...BLANK_FORM,date:defaultDate});
    setErrors({});
    setShowModal(true);
  }

  function validate(){
    const e={};
    if(!form.title.trim()) e.title="Title is required";
    if(!form.date)         e.date ="Date is required";
    if(!form.time)         e.time ="Time is required";
    setErrors(e);
    return Object.keys(e).length===0;
  }

  function saveEvent(){
    if(!validate()) return;
    const newEv={
      id:Date.now(),
      title:form.title.trim(),
      time:form.time,
      duration:form.duration,
      color:form.color,
      type:form.type,
      attendees:Number(form.attendees)||1,
    };
    setEvents(prev=>({
      ...prev,
      [form.date]:[...(prev[form.date]||[]),newEv],
    }));

    // auto-select the saved date
    const [y,m,d] = form.date.split("-").map(Number);
    setYear(y);setMonth(m-1);setSelectedDay(d);
    setShowModal(false);
  }

  const upcomingAll = Object.entries(events)
    .flatMap(([k,evs])=>evs.map(ev=>({...ev,key:k})))
    .slice(0,4);

  return (
    <UserLayout>

      {/* ── New Event Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-brand-ink/40 backdrop-blur-sm" onClick={()=>setShowModal(false)} />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-brand-line p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-brand-ink">New Event</h3>
                <p className="text-xs text-brand-secondary mt-0.5">Fill in the details below</p>
              </div>
              <button onClick={()=>setShowModal(false)} className="size-8 flex items-center justify-center rounded-xl bg-brand-neutral hover:bg-brand-soft text-brand-secondary hover:text-brand-ink transition-colors">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Event Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                  placeholder="e.g. Team Standup"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm text-brand-ink focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition-all ${errors.title?"border-red-400 bg-red-50":"border-brand-line bg-brand-neutral/40"}`}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                    className={`w-full rounded-xl border px-3 py-2.5 text-sm text-brand-ink focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition-all ${errors.date?"border-red-400 bg-red-50":"border-brand-line bg-brand-neutral/40"}`}
                  />
                  {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Time *</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e=>setForm(f=>({...f,time:e.target.value}))}
                    className={`w-full rounded-xl border px-3 py-2.5 text-sm text-brand-ink focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition-all ${errors.time?"border-red-400 bg-red-50":"border-brand-line bg-brand-neutral/40"}`}
                  />
                  {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
                </div>
              </div>

              {/* Duration + Attendees */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Duration</label>
                  <select
                    value={form.duration}
                    onChange={e=>setForm(f=>({...f,duration:e.target.value}))}
                    className="w-full rounded-xl border border-brand-line bg-brand-neutral/40 px-3 py-2.5 text-sm text-brand-ink focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                  >
                    {["15 min","30 min","45 min","1 hr","1.5 hrs","2 hrs","3 hrs"].map(d=>(
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Attendees</label>
                  <input
                    type="number"
                    min={1}
                    value={form.attendees}
                    onChange={e=>setForm(f=>({...f,attendees:e.target.value}))}
                    className="w-full rounded-xl border border-brand-line bg-brand-neutral/40 px-3 py-2.5 text-sm text-brand-ink focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Type</label>
                <div className="flex gap-3">
                  {EVENT_TYPES.map(t=>(
                    <button
                      key={t}
                      type="button"
                      onClick={()=>setForm(f=>({...f,type:t}))}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all ${form.type===t?"bg-brand-primary/10 border-brand-primary text-brand-primary":"border-brand-line text-brand-secondary hover:bg-brand-neutral"}`}
                    >
                      {t==="meet"?<Video className="size-4"/>:<MapPin className="size-4"/>}
                      {t==="meet"?"Meeting":"Call"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Color</label>
                <div className="flex gap-2">
                  {EVENT_COLORS.map(c=>(
                    <button
                      key={c.value}
                      type="button"
                      onClick={()=>setForm(f=>({...f,color:c.value}))}
                      className={`size-8 rounded-full flex items-center justify-center ${c.value} transition-transform hover:scale-110 ${form.color===c.value?"ring-2 ring-offset-2 ring-brand-ink/30 scale-110":""}`}
                    >
                      {form.color===c.value && <Check className="size-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={()=>setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-brand-line bg-brand-neutral text-brand-ink text-sm font-semibold hover:bg-brand-soft transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEvent}
                className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold shadow-md shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all active:scale-95"
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Layout Breakout ── */}
      <div className="fixed top-20 bottom-0 left-0 lg:left-[72px] right-0 bg-[#f8fafc] z-[20] flex justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-[1400px] h-fit lg:h-full pb-10 lg:pb-0">

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col gap-3 bg-white rounded-[24px] border border-brand-line shadow-sm p-5">

          {/* Month Nav */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-brand-ink">
                {MONTHS[month]} <span className="text-brand-secondary font-semibold">{year}</span>
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={()=>{setYear(today.getFullYear());setMonth(today.getMonth());setSelectedDay(today.getDate());}}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest bg-brand-soft text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
              >Today</button>
              <button onClick={prevMonth} className="size-8 flex items-center justify-center rounded-xl bg-brand-neutral hover:bg-brand-soft text-brand-secondary hover:text-brand-primary transition-colors">
                <ChevronLeft className="size-4" />
              </button>
              <button onClick={nextMonth} className="size-8 flex items-center justify-center rounded-xl bg-brand-neutral hover:bg-brand-soft text-brand-secondary hover:text-brand-primary transition-colors">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 text-center">
            {DAYS.map(d=>(
              <div key={d} className={`py-1 text-[10px] font-bold uppercase tracking-widest ${d==="Sun"||d==="Sat"?"text-brand-secondary/40":"text-brand-secondary"}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Date Cells */}
          <div className="grid grid-cols-7 gap-1 flex-1">
            {cells.map((day,idx)=>{
              if(!day) return <div key={`e-${idx}`}/>;
              const key=dateKey(year,month,day);
              const evs=events[key]||[];
              const isSel=day===selectedDay;
              const isTod=isToday(day);
              return (
                <button
                  key={day}
                  onClick={()=>setSelectedDay(day)}
                  className={`relative flex flex-col items-center gap-1 px-1 py-1.5 rounded-xl transition-all duration-150 min-h-[44px] sm:min-h-[56px] group ${
                    isSel?"bg-brand-primary shadow-md shadow-brand-primary/20 ring-2 ring-brand-primary/20"
                         :isTod?"bg-brand-soft ring-2 ring-brand-primary/30"
                               :"hover:bg-brand-neutral"
                  }`}
                >
                  <span className={`text-xs font-bold ${isSel?"text-white":isTod?"text-brand-primary":"text-brand-ink"}`}>
                    {day}
                  </span>
                  {evs.length>0 && (
                    <div className="flex flex-wrap gap-0.5 justify-center">
                      {evs.slice(0,3).map(ev=>(
                        <span key={ev.id} className={`size-1.5 rounded-full ${isSel?"bg-white/60":ev.color}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel */}
        <aside className="w-full lg:w-72 flex flex-col gap-3 shrink-0">
          {/* New Event Btn */}
          <button
            onClick={openModal}
            className="flex items-center justify-center gap-2 w-full h-11 bg-brand-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-brand-primary/25 hover:bg-brand-primary/90 transition-all active:scale-95"
          >
            <Plus className="size-4" /> New Event
          </button>

          {/* Selected Day */}
          <div className="bg-white border border-brand-line rounded-[20px] p-4 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-brand-line/60">
              <div className="size-10 rounded-xl bg-brand-primary/10 flex flex-col items-center justify-center shrink-0">
                <CalIcon className="size-4 text-brand-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-brand-secondary font-bold uppercase tracking-widest truncate">{MONTHS[month]}</p>
                <p className="text-xl font-black text-brand-ink leading-none">{selectedDay}</p>
              </div>
            </div>

            {selectedEvents.length===0?(
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <div className="size-10 rounded-full bg-brand-neutral flex items-center justify-center mx-auto mb-2">
                  <CalIcon className="size-4 text-brand-secondary/40" />
                </div>
                <p className="text-sm font-semibold text-brand-secondary">No events</p>
                <button onClick={openModal} className="text-xs text-brand-primary font-semibold mt-2 hover:underline">
                  + Add event
                </button>
              </div>
            ):(
              <div className="space-y-2 flex-1 overflow-y-auto [scrollbar-width:thin]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60">
                  {selectedEvents.length} event{selectedEvents.length!==1?"s":""}
                </p>
                {selectedEvents.map(ev=>(
                  <div key={ev.id} className="rounded-xl border border-brand-line p-3 hover:border-brand-primary/30 hover:shadow-sm transition-all group cursor-pointer">
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 size-2.5 rounded-full shrink-0 ${ev.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-brand-ink truncate group-hover:text-brand-primary">{ev.title}</p>
                        <div className="mt-1.5 space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-brand-secondary">
                            <Clock className="size-3 shrink-0"/>
                            {ev.time} · {ev.duration}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-brand-secondary">
                            {ev.type==="call"?<MapPin className="size-3 shrink-0"/>:<Video className="size-3 shrink-0"/>}
                            {ev.type==="call"?"Phone call":"Video meeting"}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-brand-secondary">
                            <Users className="size-3 shrink-0"/>{ev.attendees} attendees
                          </div>
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 text-brand-secondary hover:text-brand-primary p-0.5 rounded-lg">
                        <MoreVertical className="size-3.5"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming */}
          <div className="bg-white border border-brand-line rounded-[20px] p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60 mb-3">Upcoming</p>
            <div className="space-y-2.5">
              {upcomingAll.map(ev=>(
                <div key={ev.id} className="flex items-center gap-2.5 group cursor-pointer">
                  <div className={`size-1.5 rounded-full shrink-0 ${ev.color}`}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-brand-ink truncate group-hover:text-brand-primary">{ev.title}</p>
                    <p className="text-[10px] text-brand-secondary">{ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
        </div>
      </div>
    </UserLayout>
  );
}
