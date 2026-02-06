import React, { useState, useMemo } from 'react';
import { rooms, batches, tasks } from '../data/mockData';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import './Planner.css';

const Planner = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [userEvents, setUserEvents] = useState([]); // Simulated manual events

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun

    // Generate Calendar Days
    const days = useMemo(() => {
        const d = [];
        for (let i = 0; i < firstDay; i++) {
            d.push(null); // Empty slots
        }
        for (let i = 1; i <= daysInMonth; i++) {
            d.push(new Date(year, month, i));
        }
        return d;
    }, [year, month, firstDay, daysInMonth]);

    // Calculate Automatic Events
    const events = useMemo(() => {
        const evts = [];

        // 1. Existing Tasks
        tasks.forEach(t => {
            evts.push({
                date: new Date(t.scheduledDate),
                title: t.task,
                type: 'task',
                status: t.status
            });
        });

        // 2. Automatic Batch Alerts (Projected)
        batches.forEach(b => {
            if (b.phase === 'Flora' && b.startDate) {
                const start = new Date(b.startDate);

                // Day 3: Pest Control
                const day3 = new Date(start);
                day3.setDate(start.getDate() + 3);
                evts.push({ date: day3, title: `Preventivo (${b.name})`, type: 'auto-critical' });

                // Day 20: Clones
                const day20 = new Date(start);
                day20.setDate(start.getDate() + 20);
                evts.push({ date: day20, title: `Cortar Esquejes (${b.name})`, type: 'auto-warning' });

                // Day 21: Defoliation (End of window)
                const day21 = new Date(start);
                day21.setDate(start.getDate() + 21);
                evts.push({ date: day21, title: `Desfoliación límite (${b.name})`, type: 'auto-info' });
            }
        });

        // 3. Weekly Cleaning (Saturdays)
        // Find all Saturdays in this month
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            if (date.getDay() === 6) {
                evts.push({ date: date, title: 'Limpieza Sala', type: 'routine' });
            }
        }

        return [...evts, ...userEvents];
    }, [year, month, userEvents]);

    const getEventsForDay = (date) => {
        if (!date) return [];
        return events.filter(e =>
            e.date.getDate() === date.getDate() &&
            e.date.getMonth() === date.getMonth() &&
            e.date.getFullYear() === date.getFullYear()
        );
    };

    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

    const handleAddEvent = () => {
        const title = prompt("Nombre del evento:");
        if (title) {
            const day = prompt("Día (número):");
            if (day && !isNaN(day)) {
                setUserEvents([...userEvents, {
                    date: new Date(year, month, parseInt(day)),
                    title,
                    type: 'manual'
                }]);
            }
        }
    };

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
        <div className="planner-view">
            <header className="planner-header">
                <div>
                    <h2 className="view-title">Planificador de Cultivo</h2>
                    <p className="view-subtitle">Calendario operativo y alertas automáticas</p>
                </div>
                <div className="planner-controls">
                    <button onClick={prevMonth} className="nav-btn"><ChevronLeft /></button>
                    <span className="current-month">{monthNames[month]} {year}</span>
                    <button onClick={nextMonth} className="nav-btn"><ChevronRight /></button>
                    <button className="add-btn" onClick={handleAddEvent}>
                        <Plus size={18} />
                        Evento
                    </button>
                </div>
            </header>

            <div className="calendar-grid">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="calendar-head">{day}</div>
                ))}

                {days.map((date, idx) => (
                    <div key={idx} className={`calendar-day ${!date ? 'empty' : ''}`}>
                        {date && (
                            <>
                                <span className="day-number">{date.getDate()}</span>
                                <div className="day-events">
                                    {getEventsForDay(date).map((evt, i) => (
                                        <div key={i} className={`event-pill ${evt.type}`}>
                                            {evt.title}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Planner;
