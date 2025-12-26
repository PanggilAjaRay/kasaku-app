import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, FileText, Briefcase, Plus, X, Video } from 'lucide-react';
import { useData } from '../App';
import { CalendarEvent } from '../types';

const CalendarPage: React.FC = () => {
  const { invoices, tasks, projects, customEvents, addCustomEvent, deleteCustomEvent } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', date: '', type: 'MEETING' });

  // --- Date Helpers ---
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // --- Data Aggregation ---
  const events = useMemo(() => {
    const allEvents: any[] = [];

    // 1. Invoices
    invoices.forEach(inv => {
        if (inv.status !== 'PAID') {
            allEvents.push({
                id: inv.id,
                date: inv.dueDate, // YYYY-MM-DD
                title: `Invoice #${inv.id} Due`,
                type: 'INVOICE',
                amount: inv.amount
            });
        }
    });

    // 2. Tasks
    tasks.forEach(task => {
        if (task.status !== 'DONE') {
            allEvents.push({
                id: task.id,
                date: task.dueDate,
                title: `Task: ${task.title}`,
                type: 'TASK'
            });
        }
    });

    // 3. Projects
    projects.forEach(proj => {
        if (proj.status !== 'COMPLETED') {
             allEvents.push({
                id: proj.id,
                date: proj.dueDate,
                title: `Project Due: ${proj.name}`,
                type: 'PROJECT'
             });
        }
    });

    // 4. Custom Events
    customEvents.forEach(evt => {
        allEvents.push({
            id: evt.id,
            date: evt.date,
            title: evt.title,
            type: evt.type
        });
    });

    return allEvents;
  }, [invoices, tasks, projects, customEvents]);

  // --- Rendering Helpers ---
  const daysInMonth = getDaysInMonth(currentDate);
  const startDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDay }, (_, i) => i);

  const getEventsForDay = (day: number) => {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayStr}`;
      
      return events.filter(e => e.date === dateStr);
  };

  const handleAddEvent = (e: React.FormEvent) => {
      e.preventDefault();
      const newEvent: CalendarEvent = {
          id: `EVT-${Date.now()}`,
          title: eventForm.title,
          date: eventForm.date,
          type: eventForm.type as any
      };
      addCustomEvent(newEvent);
      setShowModal(false);
      setEventForm({ title: '', date: '', type: 'MEETING' });
  };

  const handleDeleteEvent = (e: any, id: string, type: string) => {
      e.stopPropagation();
      if (type === 'MEETING' || type === 'REMINDER' || type === 'OTHER') {
          if (window.confirm('Hapus acara ini?')) {
              deleteCustomEvent(id);
          }
      }
  };

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="text-blue-600" />
            Kalender Bisnis
          </h1>
          <p className="text-gray-500 text-sm mt-1">Jadwal jatuh tempo invoice, tugas, dan meeting.</p>
        </div>
        <div className="flex items-center gap-2">
             <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
                <Plus size={16} /> Acara Baru
             </button>
             <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                <button onClick={prevMonth} className="text-gray-400 hover:text-gray-600"><ChevronLeft size={20} /></button>
                <span className="font-bold text-gray-900 w-40 text-center">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                <button onClick={nextMonth} className="text-gray-400 hover:text-gray-600"><ChevronRight size={20} /></button>
            </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-bold">Tambah Acara</h2>
               <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400"/></button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-4">
               <input required placeholder="Judul Acara" className="w-full border p-2 rounded bg-white" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} />
               <input required type="date" className="w-full border p-2 rounded bg-white" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} />
               <select className="w-full border p-2 rounded bg-white" value={eventForm.type} onChange={e => setEventForm({...eventForm, type: e.target.value})}>
                   <option value="MEETING">Meeting</option>
                   <option value="REMINDER">Reminder</option>
                   <option value="OTHER">Lainnya</option>
               </select>
               <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-medium">Simpan</button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-[120px] bg-gray-200 gap-px">
          {/* Empty cells for previous month */}
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="bg-gray-50"></div>
          ))}

          {/* Days */}
          {days.map(day => {
            const dayEvents = getEventsForDay(day);
            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
            
            return (
              <div key={day} className="bg-white p-2 hover:bg-gray-50 transition-colors relative group">
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700'}`}>
                  {day}
                </span>
                
                <div className="mt-2 space-y-1.5 overflow-y-auto max-h-[80px]">
                  {dayEvents.map((event, idx) => {
                    let colorClass = 'bg-gray-100 text-gray-700 border-gray-200';
                    let Icon = FileText;
                    
                    if (event.type === 'INVOICE') {
                        colorClass = 'bg-orange-50 text-orange-700 border-orange-100';
                        Icon = FileText;
                    } else if (event.type === 'TASK') {
                        colorClass = 'bg-green-50 text-green-700 border-green-100';
                        Icon = Clock;
                    } else if (event.type === 'PROJECT') {
                        colorClass = 'bg-purple-50 text-purple-700 border-purple-100';
                        Icon = Briefcase;
                    } else if (event.type === 'MEETING') {
                        colorClass = 'bg-blue-50 text-blue-700 border-blue-100';
                        Icon = Video;
                    }

                    return (
                        <div 
                          key={event.id} 
                          className={`text-[10px] px-1.5 py-1 rounded border truncate flex items-center gap-1 cursor-pointer group/event justify-between ${colorClass}`}
                          title={event.title}
                        >
                          <div className="flex items-center gap-1 truncate">
                             <Icon size={10} />
                             {event.title}
                          </div>
                          {(event.type === 'MEETING' || event.type === 'REMINDER' || event.type === 'OTHER') && (
                             <button onClick={(e) => handleDeleteEvent(e, event.id, event.type)} className="hidden group-hover/event:block text-red-500 hover:text-red-700"><X size={10}/></button>
                          )}
                        </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm mt-4">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div><span className="text-gray-600">Invoice</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div><span className="text-gray-600">Tugas</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></div><span className="text-gray-600">Proyek</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div><span className="text-gray-600">Meeting</span></div>
      </div>
    </div>
  );
};

export default CalendarPage;