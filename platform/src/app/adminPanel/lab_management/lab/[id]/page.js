'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Upload, ChevronDown, ChevronUp, Loader2, X, Edit, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

const LabInfo = () => {
  const { id } = useParams();  
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [labData, setLabData] = useState([]);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newInfo, setNewInfo] = useState({
    hardwareSpecs: "",
    softwareSpecs: "",
    device: [
      { Device_Type: "", Brand: "", Serial_No: "" }
    ]
  });
  const [expandedId, setExpandedId] = useState(null);
  const [timetableData, setTimetableData] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    Faculty: "",
    Day: "",
    StartTimeSlot: "",
    EndTimeSlot: "",
    Status: "",
    Lab: id, 
  });
  const [visibleEventIndex, setVisibleEventIndex] = useState({});
  const [filteredFaculties, setFilteredFaculties] = useState([]);
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifyFormData, setNotifyFormData] = useState({
    eventType: '',
    date: '',
    startTime: '',
    endTime: '',
    description: ''
  });

  const fetchLab = async () => {
    try {
      console.log(id);
      const res = await fetch(`/api/admin/getLabById/${id}`);
      const data = await res.json();
      if (res.ok) {
        setLabData(data.lab);

        const notifyEvents = data.lab?.NotifyEvent || [];

        const formattedNotifications = notifyEvents.map((e) => ({
          id: e._id,
          eventType: e.EventType,
          date: new Date(e.Date).toISOString().split("T")[0], 
          startTime: e.StartTime,
          endTime: e.EndTime,
          description: e.Description,
        }));

        setNotifications(formattedNotifications);
        console.log(data);
        
      } else {
        console.error("Failed to fetch lab:", data.error);
      }
    } catch (err) {
      console.error("Error fetching lab:", err);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchLab(),
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNotifyFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "eventType" && value !== "Other" && { customEventType: "" })
    }));
  };

  const eventTypes = [
    "Exam",
    "Placement Drive",
    "Workshop",
    "Seminar",
    "Maintenance",
    "Other"
  ];

  const handleSubmitNotification = async () => {

    console.log(notifyFormData);
    
      if(!notifyFormData.eventType || !notifyFormData.date || !notifyFormData.startTime || !notifyFormData.endTime || !notifyFormData.description) {
        alert("Please fill in all required fields!");
        return;
      }
      
      const payload = {
        eventType: notifyFormData.eventType,
        date: notifyFormData.date,
        startTime: notifyFormData.startTime,
        endTime: notifyFormData.endTime,
        description: notifyFormData.description,
      }

      console.log(payload); 
      console.log(id); 

      try {
        const res = await fetch(`/api/admin/addEventNotify/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        const data = await res.json();

        if (res.ok) {
          alert("Event Notification added successfully!");
            setNotifications(data.eventNotify);
            setNotifyFormData({
              eventType: '',
              date: '',
              startTime: '',
              endTime: '',
              description: ''
            });
            setShowNotifyForm(false);
          fetchLab();

        } else {
          alert(data.error || "Failed to add info");
        }
      } catch (error) {
        console.error("Error adding info:", error);
        alert("Something went wrong while adding the info.");
      }
    };

  const removeNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };


  const addMoreInfo = () => {
    setShowAddModal(true);
  };

  const deviceType = ['Projector', 'Screen Board'];

  const handleAddInfo = async () => {

    if(!newInfo.hardwareSpecs || !newInfo.softwareSpecs || !newInfo.device[0].Device_Type || !newInfo.device[0].Brand || !newInfo.device[0].Serial_No) {
      alert("Please fill in all required fields!");
      return;
    }
    
    const payload = {
      Hardware_Specifications: newInfo.hardwareSpecs,
      Software_Specifications: newInfo.softwareSpecs,
      Device: newInfo.device,
    }

    console.log(payload);
    console.log(id);

    try {
      const res = await fetch(`/api/admin/addLabMoreInfo/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();

      if (res.ok) {
        alert("Additional Info added successfully!");
        setShowAddModal(false);
        setNewInfo({
          hardwareSpecs: "",
          softwareSpecs: "",
          device: [{ Device_Type: "", Brand: "", Serial_No: "" }],
        });
        fetchLab();

      } else {
        alert(data.error || "Failed to add info");
      }
    } catch (error) {
      console.error("Error adding info:", error);
      alert("Something went wrong while adding the info.");
    }
  };

  const handleUpdateInfo = async () => {};


  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleFileUpload = (subjectId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf, .docx";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert("Only PDF or DOCX files are allowed!");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/admin/uploadListOfExperiment", {
          method: "POST",
          body: formData,
          headers: {
            "subject-id": subjectId, 
          },
        });

        const data = await res.json();
        if (data.success) {
          alert("File uploaded successfully ");
          window.location.reload(); 
        } else {
          alert("Upload failed: " + data.error);
        }
      } catch (err) {
        console.error(err);
        alert("Error uploading file.");
      }
    };

    input.click();
  };

  const colors = ["#00c97b", "#00b8d9", "#f6ad55", "#9f7aea", "#fc8181", "#4299e1"];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const startTimeSlots = [
    '09:10 AM', '10:05 AM', '11:00 AM', '11:50 AM',
    '12:40 PM', '13:30 PM', '14:20 PM', '15:10 PM'
  ];

  const endTimeSlots = [
    '10:00 AM', '11:00 AM', '11:50 AM', '12:40 PM',
    '13:30 PM', '14:20 PM', '15:10 PM', '16:00 PM'
  ];

  const timeSlots = [
    "09:10 AM - 10:00 AM",
    "10:05 AM - 11:00 AM",
    "11:00 AM - 11:50 AM",
    "11:50 AM - 12:40 PM",
    "12:40 PM - 13:30 PM",
    "13:30 PM - 14:20 PM",
    "14:20 PM - 15:10 PM",
    "15:10 PM - 16:00 PM",
  ];

   const getWeekDates = () => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 4);
    return `${start.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    })} – ${end.toLocaleDateString("en-US", { day: "numeric" })}, ${end.getFullYear()}`;
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [timePart, modifier] = time.trim().split(" ");
    const [hoursStr, minutesStr] = timePart.split(":");
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    const period = hours >= 12 ? "PM" : "AM";

    return `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  const timeToMinutes = (time) => {
    const [timePart, modifier] = time.trim().split(" ");
    const [hoursStr, minutesStr] = timePart.split(":");
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const getEventsForSlot = (day, timeSlot) => {
    const slotStart = timeSlot.split(' - ')[0];
    const slotMinutes = timeToMinutes(slotStart);

    return timetableData.filter((event) => {
      if (event.day.toLowerCase() !== day.toLowerCase()) return false;
      const startMinutes = timeToMinutes(event.startTime);
      const endMinutes = timeToMinutes(event.endTime);
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  };

  const isEventStart = (event, timeSlot) => {
    const slotStart = timeSlot.split(' - ')[0];
    return timeToMinutes(event.startTime) === timeToMinutes(slotStart);
  };

  const calculateRowSpan = (event) => {
    const startMinutes = timeToMinutes(event.startTime);
    const endMinutes = timeToMinutes(event.endTime);
    
    let slotsSpanned = 0;
    for (let i = 0; i < timeSlots.length; i++) {
      const slotStart = timeSlots[i].split(' - ')[0];
      const slotMinutes = timeToMinutes(slotStart);
      if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
        slotsSpanned++;
      }
    }
    return slotsSpanned;
  };

  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const eventColorMap = {};
  let colorCounter = 0;

  const getEventColorIndex = (event, day, timeSlot) => {
    const eventId = `${event.subject}-${event.course}-${event.faculty}-${day}-${timeSlot}`;
    
    if (eventColorMap[eventId] === undefined) {
      eventColorMap[eventId] = colorCounter % colors.length;
      colorCounter++;
    }
    
    return eventColorMap[eventId];
  };

  const handleSlotClick = (event) => {
    setSelectedSlot(event);
  };

  const formatStatus = (status) => {
    if (typeof status !== 'string') return status;
    const s = status.trim().toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
};

  const handleDeleteSlot = () => {
    if (selectedSlot) {
      setTimetableData(timetableData.filter(item => item.id !== selectedSlot.id));
      setSelectedSlot(null);
    }
  };

  const handleEditSlot = () => {
    if (!selectedSlot) return;

	setFormData({
		Subject: selectedSlot.subject || "",
		Program: selectedSlot.course || "",
		Faculty: selectedSlot.faculty || "",
		Day: selectedSlot.day || "",
		StartTimeSlot: selectedSlot.startTime,
		EndTimeSlot: selectedSlot.endTime,
		Status: selectedSlot.status || "",
		Lab: id,
	});

	setIsEditing(true);
	setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
	
    if (!formData.Subject || !formData.Program || !formData.Day || !formData.Status || !formData.StartTimeSlot || !formData.EndTimeSlot || !formData.Lab) {
      alert("Please fill in all required fields!");
      return;
    }

    const payload = { 
      Subject: formData.Subject,
      Program: formData.Program,
      Faculty: formData.Faculty,
      Day: formData.Day,
      TimeSlot: `${formData.StartTimeSlot} - ${formData.EndTimeSlot}`,
      Status: formData.Status,
      Lab: formData.Lab,
     };
    console.log(payload);

    try {
      const res = await fetch("/api/admin/bookTimetableSlot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Timetable Slot Booked successfully!");
        fetchLab();
        setShowForm(false);
        setFormData({
          Subject: "",
          Program: "",
          Faculty: "",
          Day: "",
          StartTimeSlot: "",
          EndTimeSlot: "",
          Status: "",
          Lab: id, 
        })
      } else {
        alert(data.error || "Failed to book slot");
      }
    } catch (error) {
      console.error("Error booking slot:", error);
      alert("Something went wrong while booking the slot.");
    }
  };

  const handleEditSubmit = async (e) => {
	e.preventDefault();

	console.log(selectedSlot.id);

    const payload = { 
      Subject: formData.Subject,
      Program: formData.Program,
      Faculty: formData.Faculty,
      Day: formData.Day,
      TimeSlot: `${formData.StartTimeSlot} - ${formData.EndTimeSlot}`,
      Status: formData.Status,
      Lab: formData.Lab,
     };
    console.log(payload);

    try {
	  const res = await fetch(`/api/admin/editTimetableSlot/${selectedSlot.id}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	  });

      const data = await res.json();

      if (res.ok) {
        alert("Timetable Slot Booked successfully!");
        fetchLab();
        setShowForm(false);
        setFormData({
          Subject: "",
          Program: "",
          Faculty: "",
          Day: "",
          StartTimeSlot: "",
          EndTimeSlot: "",
          Status: "",
          Lab: id, 
        })
		setSelectedSlot(null);
      } else {
        alert(data.error || "Failed to book slot");
      }
    } catch (error) {
      console.error("Error booking slot:", error);
      alert("Something went wrong while booking the slot.");
    }
  };

  const styles = {
    loaderContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#EBF4F6',
      flexDirection: 'column',
      gap: '1rem',
    },
    loaderText: {
      color: '#176B87',
      fontSize: '16px',
      fontWeight: '600',
    },
    container: {
      width: isMobile ? '100%' : isTablet ? 'calc(100% - 200px)' : 'calc(100% - 255px)',
      minHeight: '100vh',
      backgroundColor: '#EBF4F6',
      padding: isMobile ? '0.75rem' : isTablet ? '1.5rem' : '2rem',
      boxSizing: 'border-box',
      marginLeft: isMobile ? '0' : isTablet ? '200px' : '255px',
      overflowX: 'hidden',
    },
    headerSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    addNotifyBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '14px 28px',
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(8, 131, 149, 0.3)',
      letterSpacing: '0.3px'
    },
    notificationBanner: {
      background: 'linear-gradient(135deg, rgba(253, 164, 175, 0.95) 0%, rgba(251, 113, 133, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
      color: 'white',
      position: 'relative',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    notifHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '14px'
    },
    notifType: {
      fontSize: '20px',
      fontWeight: 800,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      letterSpacing: '-0.3px'
    },
    notifyCloseBtn: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      color: 'white',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    notifDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    notifRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '15px',
      opacity: 0.95,
      fontWeight: '500'
    },
    notifDescription: {
      marginTop: '10px',
      fontSize: '15px',
      lineHeight: '1.7',
      paddingTop: '14px',
      borderTop: '1px solid rgba(255, 255, 255, 0.3)',
      fontWeight: '400'
    },
    notifyModalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(23, 107, 135, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    notifyModalContent: {
      background: 'white',
      borderRadius: '20px',
      padding: '36px',
      maxWidth: '540px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(8, 131, 149, 0.3)',
      border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    notifyModalHeader: {
      fontSize: '26px',
      fontWeight: 800,
      color: '#176B87',
      marginBottom: '28px',
      paddingBottom: '16px',
      borderBottom: '2px solid #D1F8EF',
      letterSpacing: '-0.5px'
    },
    notifyFormGroup: {
      marginBottom: '24px'
    },
    notifyLabel: {
      display: 'block',
      fontSize: '14px',
      fontWeight: 700,
      color: '#176B87',
      marginBottom: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    notifyInput: {
      width: '100%',
      padding: '14px',
      border: '2px solid rgba(8, 131, 149, 0.2)',
      borderRadius: '10px',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
      fontWeight: '500',
      color: '#176B87'
    },
    notifyTextarea: {
      width: '100%',
      padding: '14px',
      border: '2px solid rgba(8, 131, 149, 0.2)',
      borderRadius: '10px',
      fontSize: '15px',
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      fontWeight: '500',
      color: '#176B87'
    },
    notifyTimeInputs: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '14px'
    },
    notifyButtonGroup: {
      display: 'flex',
      gap: '14px',
      marginTop: '28px',
      paddingTop: '20px',
      borderTop: '1px solid rgba(8, 131, 149, 0.1)'
    },
    notifySubmitBtn: {
      flex: 1,
      padding: '14px',
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(8, 131, 149, 0.3)',
      letterSpacing: '0.3px'
    },
    notifyCancelBtn: {
      flex: 1,
      padding: '14px',
      backgroundColor: 'white',
      color: '#176B87',
      border: '2px solid rgba(8, 131, 149, 0.3)',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      letterSpacing: '0.3px'
    },
    labInfoCard: {
      background: 'white',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '28px',
      marginBottom: '24px',
      boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)',
      border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    labHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '14px',
      paddingBottom: '16px',
      borderBottom: '2px solid #D1F8EF'
    },
    labTitle: {
      fontSize: '30px',
      fontWeight: 800,
      color: '#176B87',
      margin: 0,
      letterSpacing: '-0.5px'
    },
    statusBadge: {
      padding: '8px 20px',
      borderRadius: '20px',
      fontSize: '15px',
      fontWeight: 700,
      background: '#D1F8EF',
      color: '#088395',
      border: '1px solid #088395',
      letterSpacing: '0.5px'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginTop: '20px'
    },
    infoItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    infoLabel: {
      fontSize: '12px',
      color: '#3674B5',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    infoValue: {
      fontSize: '16px',
      color: '#176B87',
      fontWeight: 600
    },
    moreInfoSection: {
      marginTop: '28px',
      borderTop: '2px solid #D1F8EF',
      paddingTop: '28px'
    },
    moreInfoHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      cursor: 'pointer'
    },
    moreInfoTitle: {
      fontSize: '22px',
      fontWeight: 800,
      color: '#176B87',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      letterSpacing: '-0.3px'
    },
    toggleIcon: {
      fontSize: '20px',
      color: '#088395',
      transition: 'transform 0.3s ease'
    },
    moreInfoContent: {
      display: showMoreInfo ? 'block' : 'none'
    },
    infoSectionTitle: {
      fontSize: '18px',
      fontWeight: 700,
      color: '#176B87',
      marginBottom: '20px',
      marginTop: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    addButton: {
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '10px 20px',
      fontSize: '15px',
      fontWeight: 700,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(8, 131, 149, 0.3)',
      letterSpacing: '0.3px'
    },
    deviceCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      border: '2px solid rgba(8, 131, 149, 0.15)',
      boxShadow: '0 2px 8px rgba(8, 131, 149, 0.08)',
      transition: 'all 0.3s ease'
    },
    deviceCardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '18px',
      paddingBottom: '14px',
      borderBottom: '2px solid #D1F8EF'
    },
    deviceType: {
      fontSize: '18px',
      fontWeight: 800,
      color: '#176B87',
      letterSpacing: '-0.3px'
    },
    deviceQuantity: {
      fontSize: '14px',
      fontWeight: 700,
      color: '#088395',
      background: '#D1F8EF',
      padding: '6px 14px',
      borderRadius: '12px',
      border: '1px solid #088395'
    },
    deviceCardBody: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    },
    deviceDetail: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '10px'
    },
    deviceDetailLabel: {
      fontSize: '13px',
      color: '#3674B5',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      minWidth: '90px'
    },
    deviceDetailValue: {
      fontSize: '15px',
      color: '#176B87',
      fontWeight: 600,
      textAlign: 'right',
      flex: 1
    },
    specsBox: {
      background: '#D1F8EF',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '20px',
      border: '2px solid rgba(8, 131, 149, 0.15)'
    },
    specsContent: {
      fontSize: '15px',
      color: '#176B87',
      lineHeight: '1.8',
      whiteSpace: 'pre-line',
      fontFamily: 'monospace',
      fontWeight: '500'
    },
    remarksBox: {
      background: '#D1F8EF',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '20px',
      border: '2px solid rgba(8, 131, 149, 0.15)'
    },
    remarksText: {
      fontSize: '15px',
      color: '#176B87',
      lineHeight: '1.7',
      fontWeight: '500'
    },
    emptyState: {
      textAlign: 'center',
      padding: '44px 24px',
      color: '#3674B5',
      fontSize: '15px',
      fontWeight: '600',
      fontStyle: 'italic'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(23, 107, 135, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      borderRadius: '20px',
      padding: '32px 36px',
      width: '90%',
      maxWidth: '640px',
      maxHeight: '95vh',
      overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(8, 131, 149, 0.3)',
      border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    modalHeader: {
      fontSize: '26px',
      fontWeight: 800,
      color: '#176B87',
      marginBottom: '24px',
      marginTop: 0,
      paddingBottom: '16px',
      borderBottom: '2px solid #D1F8EF',
      letterSpacing: '-0.5px'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: 700,
      color: '#176B87',
      marginBottom: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      width: '100%',
      padding: '14px',
      border: '2px solid rgba(8, 131, 149, 0.2)',
      borderRadius: '10px',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
      fontWeight: '500',
      color: '#176B87'
    },
    select: {
      width: '100%',
      padding: '14px',
      border: '2px solid rgba(8, 131, 149, 0.2)',
      borderRadius: '10px',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
      background: 'white',
      fontWeight: '500',
      color: '#176B87',
      cursor: 'pointer'
    },
    modalActions: {
      display: 'flex',
      gap: '14px',
      marginTop: '28px',
      paddingTop: '20px',
      borderTop: '1px solid rgba(8, 131, 149, 0.1)'
    },
    cancelButton: {
      flex: 1,
      padding: '14px',
      background: 'white',
      color: '#176B87',
      border: '2px solid rgba(8, 131, 149, 0.3)',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      letterSpacing: '0.3px'
    },
    saveButton: {
      flex: 1,
      padding: '14px',
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(8, 131, 149, 0.3)',
      letterSpacing: '0.3px'
    },
    subjectListCard: {
      background: 'white',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '28px',
      marginBottom: '24px',
      boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)',
      border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    subjectListHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '2px solid #D1F8EF'
    },
    subjectListTitle: {
      fontSize: '24px',
      fontWeight: 800,
      color: '#176B87',
      margin: 0,
      letterSpacing: '-0.5px'
    },
    cardContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '18px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid rgba(8, 131, 149, 0.15)',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },
    cardHeader: {
      padding: '22px 26px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    cardHeaderHover: {
      backgroundColor: '#D1F8EF'
    },
    cardLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '18px',
      flex: 1
    },
    avatar: {
      width: '60px',
      height: '60px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #D1F8EF 0%, #B8F3E9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: '700',
      color: '#088395'
    },
    cardInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    subjectTitle: {
      fontSize: '19px',
      fontWeight: '800',
      color: '#176B87',
      margin: 0,
      letterSpacing: '-0.3px'
    },
    courseCode: {
      fontSize: '15px',
      color: '#3674B5',
      fontWeight: '600'
    },
    cardRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px'
    },
    uploadBadge: {
      padding: '7px 14px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '700'
    },
    statusUploaded: {
      backgroundColor: '#D1F8EF',
      color: '#088395',
      border: '1px solid #088395'
    },
    statusPending: {
      backgroundColor: '#FFE8CC',
      color: '#E67E22',
      border: '1px solid #E67E22'
    },
    programCount: {
      padding: '7px 14px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '700',
      backgroundColor: 'rgba(134, 182, 246, 0.2)',
      color: '#3674B5',
      border: '1px solid #3674B5'
    },
    actionButtons: {
      display: "flex",
      gap: "10px",
    },
    iconButton: {
      width: "40px",
      height: "40px",
      background: "transparent",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s ease",
    },
    addSubjectButton: {
      color: "#3674B5", 
    },
    editButton: {
      color: "#088395",
    },
    deleteButton: {
      color: "#ef4444",
    },
    viewButton: {
      color: "#3674B5",
    },
	redirectButton: {
      color: '#EBF4F6'
    },
    expandButton: {
      background: "#D1F8EF",
      color: "#088395",
      transition: "all 0.2s ease",
    },
    expandedContent: {
      borderTop: '2px solid #D1F8EF',
      padding: '26px',
      backgroundColor: '#EBF4F6'
    },
    section: {
      marginBottom: '26px'
    },
    sectionTitle: {
      fontSize: '15px',
      fontWeight: '800',
      color: '#176B87',
      marginBottom: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    uploadSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '18px',
      backgroundColor: 'white',
      borderRadius: '10px',
      border: '2px dashed rgba(8, 131, 149, 0.3)'
    },
    uploadButton: {
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 18px',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 2px 4px rgba(8, 131, 149, 0.3)',
      letterSpacing: '0.3px'
    },
    viewButtonStyle: {
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 700,
      transition: "all 0.25s ease",
      boxShadow: "0 2px 5px rgba(8, 131, 149, 0.3)",
      letterSpacing: '0.3px'
    },
    viewButtonHover: {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 8px rgba(8, 131, 149, 0.4)",
    },
    fileName: {
      fontSize: '15px',
      color: '#176B87',
      fontWeight: '600'
    },
    programsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '18px'
    },
    programCard: {
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '18px',
      border: '1px solid rgba(8, 131, 149, 0.15)'
    },
    programHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '14px'
    },
    programName: {
      fontSize: '16px',
      fontWeight: '800',
      color: '#176B87',
      marginBottom: '6px',
      letterSpacing: '-0.3px'
    },
    programBadge: {
      padding: '5px 10px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '700',
      backgroundColor: 'rgba(134, 182, 246, 0.2)',
      color: '#3674B5',
      border: '1px solid #3674B5'
    },
    programDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    detailRow: {
      display: 'flex',
      fontSize: '14px',
      color: '#176B87'
    },
    detailLabel: {
      fontWeight: '700',
      minWidth: '110px',
      color: '#3674B5'
    },
    detailValue: {
      color: '#176B87',
      fontWeight: '600'
    },
    timetableCard: {
      background: 'white',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)',
      overflowX: 'auto',
      border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    timetableHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '28px',
      paddingBottom: '16px',
      borderBottom: '2px solid #D1F8EF'
    },
    weekNavigation: {
      display: 'flex',
      alignItems: 'center',
      gap: '18px'
    },
    navButton: {
      padding: '10px',
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(8, 131, 149, 0.3)'
    },
    weekLabel: {
      fontSize: '17px',
      fontWeight: 700,
      color: '#176B87',
      letterSpacing: '-0.3px'
    },
    viewToggle: {
      display: 'flex',
      gap: '10px'
    },
    toggleButton: {
      padding: '10px 18px',
      border: '2px solid rgba(8, 131, 149, 0.2)',
      background: 'white',
      color: '#176B87',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      letterSpacing: '0.3px'
    },
    toggleButtonActive: {
      backgroundColor: '#D1F8EF',
      color: '#088395',
      borderColor: '#088395'
    },
    timetableGrid: {
      display: 'grid',
      gridTemplateColumns: '80px repeat(5, 1fr)',
      gridAutoRows: 'minmax(60px, auto)',
      gap: '1px',
      background: 'rgba(8, 131, 149, 0.2)',
      border: '2px solid rgba(8, 131, 149, 0.2)',
      borderRadius: '12px',
      overflow: 'hidden'
    },
    dayHeader: {
      background: '#D1F8EF',
      padding: '14px',
      textAlign: 'center',
      fontWeight: 800,
      fontSize: '15px',
      color: '#088395',
      letterSpacing: '0.3px'
    },
    timeSlot: {
      background: 'white',
      padding: '14px 8px',
      fontSize: '13px',
      color: '#3674B5',
      display: 'flex',
      alignItems: 'center',
      fontWeight: 700
    },
    emptyCell: {
      background: 'white',
      minHeight: '60px',
      position: 'relative'
    },
    eventCell: {
      padding: '10px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 700,
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    eventTitle: {
      fontSize: '14px',
      fontWeight: 800,
      letterSpacing: '-0.2px'
    },
    eventDetails: {
      fontSize: '12px',
      opacity: 0.95,
      fontWeight: '600'
    },
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(23, 107, 135, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalTT: {
      backgroundColor: '#fff',
      borderRadius: '1rem',
      boxShadow: '0 20px 60px rgba(8, 131, 149, 0.3)',
      padding: '2rem',
      width: '400px',
      maxWidth: '90%',
      border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    heading: {
      fontSize: '1.35rem',
      fontWeight: '800',
      marginBottom: '1rem',
      textAlign: 'center',
      color: '#176B87',
      letterSpacing: '-0.5px'
    },
    subHeading: {
      fontSize: '0.85rem',
      marginBottom: '1.5rem',
      textAlign: 'center',
	  color: '#3674B5',
      fontWeight: '600'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.85rem',
    },
    slotOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(23, 107, 135, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    slotModal: {
      backgroundColor: '#fff',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(8, 131, 149, 0.3)',
      padding: '32px 36px',
      width: '90%',
      maxWidth: '540px',
      position: 'relative',
      border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    slotModalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '28px',
      paddingBottom: '18px',
      borderBottom: '2px solid #D1F8EF'
    },
    slotModalTitle: {
      fontSize: '26px',
      fontWeight: 800,
      color: '#176B87',
      margin: 0,
      letterSpacing: '-0.5px'
    },
    slotCloseButton: {
      background: 'transparent',
      border: 'none',
      color: '#3674B5',
      cursor: 'pointer',
      padding: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      transition: 'all 0.2s ease'
    },
    slotModalContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '22px'
    },
    slotInfoRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    slotInfoLabel: {
      fontSize: '13px',
      color: '#3674B5',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    slotInfoValue: {
      fontSize: '16px',
      color: '#176B87',
      fontWeight: 600,
      padding: '12px',
      background: '#EBF4F6',
      borderRadius: '10px',
      border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    slotStatusBadge: {
      padding: '10px 20px',
      borderRadius: '20px',
      fontSize: '15px',
      fontWeight: 700,
      background: '#D1F8EF',
      color: '#088395',
      display: 'inline-block',
      width: 'fit-content',
      border: '1px solid #088395'
    },
    slotModalActions: {
      display: 'flex',
      gap: '14px',
      marginTop: '28px',
      paddingTop: '22px',
      borderTop: '1px solid rgba(8, 131, 149, 0.1)'
    },
    slotEditButton: {
      flex: 1,
      padding: '14px',
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(8, 131, 149, 0.3)',
      letterSpacing: '0.3px'
    },
    slotDeleteButton: {
      flex: 1,
      padding: '14px',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)',
      letterSpacing: '0.3px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loaderContainer}>
          <Loader2 size={48} className="animate-spin" color="#088395" />
          <p style={styles.loaderText}>Loading lab data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      <div style={styles.headerSection}>
        <div></div>
        <button 
          style={styles.addNotifyBtn}
          onClick={() => setShowNotifyForm(true)}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(8, 131, 149, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(8, 131, 149, 0.3)';
          }}
        >
          <Plus size={20} />
          Add Notification
        </button>
      </div>

      {/* Notification Banners */}
      {notifications.map(notif => (
        <div key={notif.id} style={styles.notificationBanner}>
          <div style={styles.notifHeader}>
            <div style={styles.notifType}>
              <AlertCircle size={24} />
              {notif.eventType}
            </div>
            <button 
              style={styles.notifyCloseBtn}
              onClick={() => removeNotification(notif.id)}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              <X size={18} />
            </button>
          </div>
          <div style={styles.notifDetails}>
            <div style={styles.notifRow}>
              <Calendar size={18} />
              <strong>Date:</strong> {new Date(notif.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div style={styles.notifRow}>
              <Clock size={18} />
              <strong>Time:</strong> {notif.startTime} - {notif.endTime}
            </div>
            <div style={styles.notifDescription}>
              {notif.description}
            </div>
          </div>
        </div>
      ))}

      {/* Notification Form Modal */}
      {showNotifyForm && (
        <div style={styles.notifyModalOverlay} onClick={() => setShowNotifyForm(false)}>
          <div style={styles.notifyModalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.notifyModalHeader}>Add Lab Notification</h2>

            <div style={styles.notifyFormGroup}>
              <label style={styles.notifyLabel}>Event Type *</label>
              <select
                name="eventType"
                value={notifyFormData.eventType}
                onChange={handleInputChange}
                style={styles.notifyInput}
                onFocus={(e) => (e.target.style.borderColor = "#088395")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(8, 131, 149, 0.2)")}
              >
                <option value="">Select event type</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {notifyFormData.eventType === "Other" && (
              <div style={styles.notifyFormGroup}>
                <label style={styles.notifyLabel}>Specify Event *</label>
                <input
                  type="text"
                  name="customEventType"
                  value={notifyFormData.customEventType || ""}
                  onChange={handleInputChange}
                  placeholder="Enter event name"
                  style={styles.notifyInput}
                  onFocus={(e) => (e.target.style.borderColor = "#088395")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(8, 131, 149, 0.2)")}
                />
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.notifyLabel}>Date *</label>
              <input
                type="date"
                name="date"
                value={notifyFormData.date}
                onChange={handleInputChange}
                style={styles.notifyInput}
                onFocus={(e) => e.target.style.borderColor = '#088395'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(8, 131, 149, 0.2)'}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.notifyLabel}>Time Period *</label>
              <div style={styles.timeInputs}>
                <div>
                  <input
                    type="time"
                    name="startTime"
                    value={notifyFormData.startTime}
                    onChange={handleInputChange}
                    style={styles.notifyInput}
                    onFocus={(e) => e.target.style.borderColor = '#088395'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(8, 131, 149, 0.2)'}
                  />
                </div>
                <div>
                  <input
                    type="time"
                    name="endTime"
                    value={notifyFormData.endTime}
                    onChange={handleInputChange}
                    style={styles.notifyInput}
                    onFocus={(e) => e.target.style.borderColor = '#088395'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(8, 131, 149, 0.2)'}
                  />
                </div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.notifyLabel}>Description *</label>
              <textarea
                name="description"
                value={notifyFormData.description}
                onChange={handleInputChange}
                style={styles.notifyTextarea}
                placeholder="Enter event details..."
                onFocus={(e) => e.target.style.borderColor = '#088395'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(8, 131, 149, 0.2)'}
              />
            </div>

            <div style={styles.notifyButtonGroup}>
              <button
                style={styles.notifyCancelBtn}
                onClick={() => setShowNotifyForm(false)}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(8, 131, 149, 0.05)';
                  e.target.style.borderColor = '#088395';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = 'rgba(8, 131, 149, 0.3)';
                }}
              >
                Cancel
              </button>
              <button
                style={styles.notifySubmitBtn}
                onClick={ handleSubmitNotification }
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 10px rgba(8, 131, 149, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px rgba(8, 131, 149, 0.3)';
                }}
              >
                Add Notification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lab Information Card */}
      {labData ? (
         <div style={styles.labInfoCard}>
          <div style={styles.labHeader}>
            <h1 style={styles.labTitle}>{labData?.Lab_Name}</h1>
            <span style={styles.statusBadge}>{labData?.Status?.toUpperCase()}</span>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Lab ID</span>
              <span style={styles.infoValue}>{labData?.Lab_ID}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Lab Name</span>
              <span style={styles.infoValue}>{labData?.Lab_Name}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Block</span>
              <span style={styles.infoValue}>{labData?.Block}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Lab Room</span>
              <span style={styles.infoValue}>{labData?.Lab_Room}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Lab Technician</span>
              <span style={styles.infoValue}>{labData?.LabTechnician?.[0]?.Name}</span>
              <span style={styles.infoValue}>{labData?.LabTechnician?.[0]?.Email}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Lab Incharge</span>
              <span style={styles.infoValue}>{labData?.Lab_Incharge?.[0]?.Name}</span>
              <span style={styles.infoValue}>{labData?.Lab_Incharge?.[0]?.Email}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Total Capacity</span>
              <span style={styles.infoValue}>{labData?.Total_Capacity}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Total PCs</span>
              <span style={styles.infoValue}>{labData?.PCs?.length}</span>
            </div>
          </div>

          {/* More Info Section */}
          <div style={styles.moreInfoSection}>
            <div 
              style={styles.moreInfoHeader}
              onClick={() => setShowMoreInfo(!showMoreInfo)}>
              <h2 style={styles.moreInfoTitle}>
                More Information
                <span style={{
                  ...styles.toggleIcon,
                  transform: showMoreInfo ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </h2>
            </div>

            <div style={styles.moreInfoContent}>
              {/* Add Button for Specifications */}
              <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <button 
                  style={styles.addButton}
                  onClick={addMoreInfo}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 10px rgba(8, 131, 149, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 6px rgba(8, 131, 149, 0.3)';
                  }}
                >
                  <span style={{fontSize: '20px'}}>+</span> Add Information
                </button>
              </div>

              {/* Hardware Specifications */}
              <div style={styles.infoSectionTitle}>
                <span>Hardware Specifications</span>
              </div>
              {labData.Hardware_Specifications ? (
                <div style={styles.specsBox}>
                  <div style={styles.specsContent}>
                    {labData.Hardware_Specifications}
                  </div>
                </div>
              ) : (
                <div style={styles.emptyState}>No hardware specifications added yet</div>
              )}

              {/* Software Specifications */}
              <div style={styles.infoSectionTitle}>
                <span>Software Specifications</span>
              </div>
              {labData.Software_Specifications ? (
                <div style={styles.specsBox}>
                  <div style={styles.specsContent}>
                    {labData.Software_Specifications}
                  </div>
                </div>
              ) : (
                <div style={styles.emptyState}>No software specifications added yet</div>
              )}

              {/* Screen Panel / Projector Details */}
              <div style={styles.infoSectionTitle}>
                <span>Screen Board / Projector Details</span>
              </div>
              
              {labData?.Device?.length > 0 ? (
                <div style={styles.cardGrid}>
                  {labData.Device.map((device, index) => (
                    <div key={index} style={styles.deviceCard}>
                      <div style={styles.deviceCardHeader}>
                        <span style={styles.deviceType}>
                          {device.Device_Type
                            .split(" ")
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </span>
                        <span style={styles.deviceQuantity}>Qty: {labData.Device?.length}</span>
                      </div>
                      <div style={styles.deviceCardBody}>
                        <div style={styles.deviceDetail}>
                          <span style={styles.deviceDetailLabel}>Brand</span>
                          <span style={styles.deviceDetailValue}>{device.Brand}</span>
                        </div>
                        <div style={styles.deviceDetail}>
                          <span style={styles.deviceDetailLabel}>Serial No.</span>
                          <span style={styles.deviceDetailValue}>{device.Serial_No}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyState}>No screen/projector details added yet</div>
              )} 

              {/* Remarks */}
              <div style={styles.sectionTitle}>
                <span>Remarks</span>
              </div>
              <div style={styles.remarksBox}>
                <div style={styles.specsContent}>
                  {labData?.Remarks || 'No remarks added'}
                </div>
              </div>
            </div>
          </div>
        </div>

      ) : (
        <p>Loading...</p> 
      )}

      {/* Add/Edit Information Modal */}
      {showAddModal && (
        <div style={styles.modal} onClick={() => {
          setShowAddModal(false);
          setEditing(null);
        }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalHeader}>{editing ? 'Update Information' : 'Add Information'}</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Hardware Specifications</label>
              <input 
                type="text"
                style={styles.input}
              value={newInfo.hardwareSpecs}
                onChange={(e) => setNewInfo({...newInfo, hardwareSpecs: e.target.value})}
                placeholder="Enter Hardware Specifications"
                onFocus={(e) => e.target.style.borderColor = '#088395'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(8, 131, 149, 0.2)'}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Software Specifications</label>
              <input 
                type="text"
                style={styles.input}
                value={newInfo.softwareSpecs}
                onChange={(e) => setNewInfo({...newInfo, softwareSpecs: e.target.value})}
                placeholder="Enter Software Specifications"
                onFocus={(e) => e.target.style.borderColor = '#088395'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(8, 131, 149, 0.2)'}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Device</label>
              <select
                style={styles.input}
                value={newInfo.device[0].Device_Type}
                onChange={(e) =>
                  setNewInfo({
                    ...newInfo,
                    device: [
                      {
                        ...((newInfo.device && newInfo.device[0]) || {
                          Device_Type: "",
                          Brand: "",
                          Serial_No: "",
                        }),
                        Device_Type: e.target.value,
                      },
                    ],
                  })
                }
                onFocus={(e) => e.target.style.borderColor = '#088395'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(8, 131, 149, 0.2)'}
              >
                <option value="">Select Device_Type</option>
                {deviceType.map((d, index) => (
                  <option key={index} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Brand</label>
              <input 
                type="text"
                style={styles.input}
                value={newInfo.device[0].Brand}
                onChange={(e) =>
                  setNewInfo({
                    ...newInfo,
                    device: [
                      {
                        ...((newInfo.device && newInfo.device[0]) || {
                          Device_Type: "",
                          Brand: "",
                          Serial_No: "",
                        }),
                        Brand: e.target.value,
                      },
                    ],
                  })
                }
                placeholder="Enter Brand"
                onFocus={(e) => e.target.style.borderColor = '#088395'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(8, 131, 149, 0.2)'}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>S/N</label>
              <input 
                type="text"
                style={styles.input}
                value={newInfo.device[0].Serial_No}
                onChange={(e) =>
                  setNewInfo({
                    ...newInfo,
                    device: [
                      {
                        ...((newInfo.device && newInfo.device[0]) || {
                          Device_Type: "",
                          Brand: "",
                          Serial_No: "",
                        }),
                        Serial_No: e.target.value,
                      },
                    ],
                  })
                }
                placeholder="Enter S/N"
                onFocus={(e) => e.target.style.borderColor = '#088395'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(8, 131, 149, 0.2)'}
              />
            </div>

            <div style={styles.modalActions}>
              <button 
                style={styles.cancelButton}
                onClick={() => {
                  setShowAddModal(false);
                  setEditing(null);
                  setNewInfo({
                    hardwareSpecs: "",
                    softwareSpecs: "",
                    device: [{ Device_Type: "", Brand: "", Serial_No: "" }],
                  });
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(8, 131, 149, 0.05)';
                  e.target.style.borderColor = '#088395';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = 'rgba(8, 131, 149, 0.3)';
                }}
              >
                Cancel
              </button>
              <button 
                style={styles.saveButton}
                onClick={editing ? handleUpdateInfo : handleAddInfo}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 10px rgba(8, 131, 149, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px rgba(8, 131, 149, 0.3)';
                }}
              >
                {editing ? 'Update Information' : 'Add Information'}
              </button>
            </div>
          </div>
        </div>
      )}

      

    </div>
  );
};

export default LabInfo;