import React, { useState, useMemo } from 'react';
import { rooms, batches, tasks } from '../data/mockData';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Scissors, Shield, Droplet, Wrench, Check, X, User } from 'lucide-react';
import './Planner.css';

const Planner = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Feb 2026
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [roomFilter, setRoomFilter] = useState('all');
    const [localTasks, setLocalTasks] = useState(tasks);
    const [completedTasks, setCompletedTasks] = useState({});
    const [showNewEventModal, setShowNewEventModal] = useState(false);
    const [draggedEvent, setDraggedEvent] = useState(null);
    const [toast, setToast] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    // Safely parse date string to avoid timezone shifting
    const parseLocalDay = (dateStr) => {
        if (!dateStr) return new Date();
        return new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    };

    // Get icon for event type
    const getEventIcon = (type) => {
        switch (type) {
            case 'Manejo': return <Scissors size={14} />;
            case 'IPM': return <Shield size={14} />;
            case 'Riego': return <Droplet size={14} />;
            case 'Operativo': return <Wrench size={14} />;
            default: return null;
        }
    };

    // Get color class for event type
    const getEventColorClass = (type) => {
        switch (type) {
            case 'Manejo': return 'event-manejo';
            case 'IPM': return 'event-ipm';
            case 'Riego': return 'event-riego';
            case 'Operativo': return 'event-operativo';
            default: return 'event-default';
        }
    };

    // Calculate cycle day for a specific room on a specific date
    const getCycleInfo = (date) => {
        // Only show cycle badges when a specific room is selected
        if (roomFilter === 'all') return null;

        const batch = batches.find(b => b.roomId === roomFilter && b.phase === 'Flora');
        if (!batch || !batch.startDate) return null;

        const startDate = parseLocalDay(batch.startDate);
        const diffTime = date - startDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return null;

        const week = Math.ceil(diffDays / 7);
        return {
            day: diffDays,
            week: week
        };
    };

    // Generate Calendar Days
    const days = useMemo(() => {
        const d = [];
        for (let i = 0; i < firstDay; i++) {
            d.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            d.push(new Date(year, month, i));
        }
        return d;
    }, [year, month, firstDay, daysInMonth]);

    // Filter tasks by room
    const filteredTasks = useMemo(() => {
        if (roomFilter === 'all') return localTasks;
        return localTasks.filter(t => t.roomId === roomFilter);
    }, [roomFilter, localTasks]);

    // Get events for a specific day
    const getEventsForDay = (date) => {
        if (!date) return [];
        return filteredTasks.filter(t => {
            const taskDate = parseLocalDay(t.scheduledDate);
            return taskDate.getDate() === date.getDate() &&
                taskDate.getMonth() === date.getMonth() &&
                taskDate.getFullYear() === date.getFullYear();
        });
    };

    // Suggested tasks based on cycle
    const suggestedTasks = useMemo(() => {
        const suggestions = [];

        batches.forEach(batch => {
            if (batch.phase === 'Flora' && batch.startDate) {
                const startDate = parseLocalDay(batch.startDate);
                const currentDay = Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24));

                // Week 3 suggestions
                if (currentDay >= 14 && currentDay <= 21) {
                    suggestions.push({
                        id: `sug-${batch.id}-defol`,
                        title: 'Programar Defoliación',
                        room: rooms.find(r => r.id === batch.roomId)?.name,
                        type: 'Manejo',
                        suggestedDay: 21,
                        description: 'Semana 3 - Momento óptimo para defoliación'
                    });
                }

                // Week 4-6 suggestions
                if (currentDay >= 21 && currentDay <= 42) {
                    suggestions.push({
                        id: `sug-${batch.id}-pk`,
                        title: 'Iniciar PK Booster',
                        room: rooms.find(r => r.id === batch.roomId)?.name,
                        type: 'Riego',
                        suggestedDay: 28,
                        description: 'Semana 4 - Fase de engorde'
                    });
                }

                // Week 7+ suggestions
                if (currentDay >= 49) {
                    suggestions.push({
                        id: `sug-${batch.id}-flush`,
                        title: 'Programar Flush',
                        room: rooms.find(r => r.id === batch.roomId)?.name,
                        type: 'Riego',
                        suggestedDay: 56,
                        description: 'Semana 8 - Pre-cosecha'
                    });
                }
            }
        });

        return suggestions;
    }, []);

    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

    const handleCompleteTask = (taskId) => {
        setCompletedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
        setSelectedEvent(null);
    };

    // Drag and Drop handlers
    const handleDragStart = (e, event) => {
        setDraggedEvent(event);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.4';
    };

    const handleDragEnd = (e) => {
        e.currentTarget.style.opacity = '1';
        setDraggedEvent(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetDate) => {
        e.preventDefault();
        if (!draggedEvent || !targetDate) return;

        // Update task date in local state
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        setLocalTasks(prevTasks => prevTasks.map(task =>
            task.id === draggedEvent.id
                ? { ...task, scheduledDate: formattedDate }
                : task
        ));

        // Show toast notification
        const newDateStr = targetDate.toLocaleDateString('es-AR');
        setToast(`Evento reprogramado para el ${newDateStr}`);
        setTimeout(() => setToast(null), 3000);

        setDraggedEvent(null);
    };

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
        <div className="planner-view">
            {/* TOAST NOTIFICATION */}
            {toast && (
                <div className="toast-notification">
                    {toast}
                </div>
            )}

            {/* HEADER */}
            <header className="planner-header">
                <div>
                    <h2 className="view-title">Smart Grow Calendar</h2>
                    <p className="view-subtitle">Planificación basada en ciclo vital y SOPs</p>
                </div>
                <div className="planner-controls">
                    <button onClick={prevMonth} className="nav-btn"><ChevronLeft /></button>
                    <span className="current-month">{monthNames[month]} {year}</span>
                    <button onClick={nextMonth} className="nav-btn"><ChevronRight /></button>
                    <button className="btn-new-event" onClick={() => setShowNewEventModal(true)}>
                        <Plus size={18} />
                        Nuevo Evento
                    </button>
                </div>
            </header>

            {/* ROOM FILTERS */}
            <div className="room-filters">
                <button
                    className={`filter-btn ${roomFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setRoomFilter('all')}
                >
                    VER TODO
                </button>
                <button
                    className={`filter-btn ${roomFilter === 'R1' ? 'active' : ''}`}
                    onClick={() => setRoomFilter('R1')}
                >
                    SOLO VEGE
                </button>
                <button
                    className={`filter-btn ${roomFilter === 'R2' ? 'active' : ''}`}
                    onClick={() => setRoomFilter('R2')}
                >
                    SOLO FLORA A
                </button>
                <button
                    className={`filter-btn ${roomFilter === 'R3' ? 'active' : ''}`}
                    onClick={() => setRoomFilter('R3')}
                >
                    SOLO FLORA B
                </button>
            </div>

            <div className="planner-content">
                {/* SUGGESTED TASKS SIDEBAR */}
                <div className="suggestions-sidebar">
                    <h3 className="sidebar-title">Tareas Sugeridas</h3>
                    <p className="sidebar-subtitle">Basado en fase de cultivo</p>

                    {suggestedTasks.length === 0 ? (
                        <div className="empty-suggestions">
                            <CalendarIcon size={40} className="empty-icon" />
                            <p>No hay sugerencias para este período</p>
                        </div>
                    ) : (
                        <div className="suggestion-list">
                            {suggestedTasks.map(sug => (
                                <div key={sug.id} className={`suggestion-card ${getEventColorClass(sug.type)}`} draggable>
                                    <div className="suggestion-header">
                                        {getEventIcon(sug.type)}
                                        <span className="suggestion-title">{sug.title}</span>
                                    </div>
                                    <div className="suggestion-details">
                                        <span className="suggestion-room">{sug.room}</span>
                                        <span className="suggestion-desc">{sug.description}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* CALENDAR GRID */}
                <div className="calendar-container">
                    <div className="calendar-grid">
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                            <div key={day} className="calendar-head">{day}</div>
                        ))}

                        {days.map((date, idx) => {
                            const dayEvents = date ? getEventsForDay(date) : [];
                            const cycleInfo = date ? getCycleInfo(date) : null;

                            return (
                                <div
                                    key={idx}
                                    className={`calendar-day ${!date ? 'empty' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, date)}
                                >
                                    {date && (
                                        <>
                                            <div className="day-header">
                                                <span className="day-number">{date.getDate()}</span>
                                                {cycleInfo && (
                                                    <span className="cycle-badge">
                                                        S{cycleInfo.week} | D{cycleInfo.day}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="day-events">
                                                {dayEvents.map((evt) => (
                                                    <div
                                                        key={evt.id}
                                                        className={`event-pill ${getEventColorClass(evt.type)} ${completedTasks[evt.id] ? 'completed' : ''}`}
                                                        onClick={() => setSelectedEvent(evt)}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, evt)}
                                                        onDragEnd={handleDragEnd}
                                                    >
                                                        {getEventIcon(evt.type)}
                                                        <span className="event-title">{evt.task}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* NEW EVENT MODAL */}
            {showNewEventModal && (
                <>
                    <div className="drawer-overlay" onClick={() => setShowNewEventModal(false)}></div>
                    <div className="new-event-modal">
                        <div className="modal-header">
                            <h3>Nuevo Evento</h3>
                            <button className="btn-close-drawer" onClick={() => setShowNewEventModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="form-group">
                                <label>Tipo de Tarea</label>
                                <select className="form-select">
                                    <option>Riego</option>
                                    <option>Manejo (Poda)</option>
                                    <option>IPM</option>
                                    <option>Operativo</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Asignar a Sala</label>
                                <select className="form-select">
                                    <option value="R1">Sala Vege</option>
                                    <option value="R2">Sala Flora A</option>
                                    <option value="R3">Sala Flora B</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Fecha</label>
                                <input type="date" className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <input type="text" className="form-input" placeholder="Ej: Aplicación preventiva Neem" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowNewEventModal(false)}>
                                Cancelar
                            </button>
                            <button className="btn-create">
                                Crear Evento
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* SOP DRAWER */}
            {selectedEvent && (
                <>
                    <div className="drawer-overlay" onClick={() => setSelectedEvent(null)}></div>
                    <div className="sop-drawer">
                        <div className="drawer-header">
                            <div>
                                <h3>{selectedEvent.task}</h3>
                                <span className="sop-code">{selectedEvent.sopCode}</span>
                            </div>
                            <button className="btn-close-drawer" onClick={() => setSelectedEvent(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="drawer-content">
                            <div className="task-meta">
                                <div className="meta-item">
                                    <User size={16} />
                                    <span>Asignado a: <strong>{selectedEvent.assignedTo}</strong></span>
                                </div>
                                <div className="meta-item">
                                    <CalendarIcon size={16} />
                                    <span>Fecha: <strong>{parseLocalDay(selectedEvent.scheduledDate).toLocaleDateString('es-AR')}</strong></span>
                                </div>
                                <div className={`meta-item status ${selectedEvent.status.toLowerCase()}`}>
                                    <span>Estado: <strong>{selectedEvent.status === 'Done' ? 'Completado' : 'Pendiente'}</strong></span>
                                </div>
                            </div>

                            <div className="checklist-section">
                                <h4>Checklist SOP</h4>
                                <div className="checklist">
                                    {selectedEvent.checklist?.map((item, idx) => (
                                        <label key={idx} className="checklist-item">
                                            <input type="checkbox" />
                                            <span>{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="drawer-footer">
                            <button
                                className="btn-complete-task"
                                onClick={() => handleCompleteTask(selectedEvent.id)}
                            >
                                <Check size={18} />
                                {completedTasks[selectedEvent.id] ? 'Marcar como Pendiente' : 'Marcar como Completado'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Planner;
