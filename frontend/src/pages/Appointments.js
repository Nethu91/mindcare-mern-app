import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function Appointments() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [counselors, setCounselors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingCounselors, setLoadingCounselors] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    counselorId: "",
    type: "Online",
    date: "",
    time: "",
    reason: "",
  });
  const [selectedFilter, setSelectedFilter] = useState("All");

  // ===========================
  // Responsive (container width) detection
  // Uses ResizeObserver on the container so it adapts
  // correctly inside the locked-width .app-screen frame too.
  // ===========================
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setIsMobile(width <= 820);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // -----------------------------
  // Load counselors + appointments from backend
  // -----------------------------
  useEffect(() => {
    loadCounselors();
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCounselors = async () => {
    try {
      setLoadingCounselors(true);
      const response = await API.get("/counselors");
      setCounselors(response.data);
      if (response.data.length > 0) {
        setForm((prev) => ({ ...prev, counselorId: response.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCounselors(false);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const response = await API.get("/appointments/my");
      setAppointments(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // -----------------------------
  // Create appointment -> saves to DB
  // -----------------------------
  const createAppointment = async () => {
    if (
      !form.counselorId ||
      !form.type ||
      !form.date ||
      !form.time ||
      !form.reason.trim()
    ) {
      alert("Please fill all appointment details");
      return;
    }
    try {
      setSubmitting(true);
      await API.post("/appointments", {
        counselorId: form.counselorId,
        type: form.type,
        date: form.date,
        time: form.time,
        reason: form.reason,
      });
      const bookedCounselor =
        counselors.find((c) => c._id === form.counselorId)?.name || "Counselor";
      const bookedDate = form.date;
      const bookedTime = form.time;
      setForm({
        counselorId: counselors[0]?._id || "",
        type: "Online",
        date: "",
        time: "",
        reason: "",
      });
      // Refresh the list so the new appointment shows immediately
      await loadAppointments();
      navigate("/dashboard", {
        state: {
          bookingSuccess: true,
          counselorName: bookedCounselor,
          date: bookedDate,
          time: bookedTime,
        },
      });
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Failed to book appointment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // -----------------------------
  // Cancel appointment -> updates DB
  // -----------------------------
  const cancelAppointment = async (id) => {
    try {
      await API.put(`/appointments/${id}/cancel`);
      setAppointments((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: "Cancelled" } : item
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel appointment.");
    }
  };

  const filteredAppointments =
    selectedFilter === "All"
      ? appointments
      : appointments.filter((item) => item.status === selectedFilter);

  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter(
    (a) => a.status === "Pending"
  ).length;
  const confirmedCount = appointments.filter(
    (a) => a.status === "Accepted"
  ).length;

  const getStatusBadge = (status) => {
    if (status === "Accepted" || status === "Confirmed") {
      return {
        bg: "rgba(16, 185, 129, 0.14)",
        color: "#065f46",
        border: "1px solid rgba(16, 185, 129, 0.3)",
        dot: "#10b981",
        label: "Accepted",
      };
    }
    if (status === "Pending") {
      return {
        bg: "rgba(245, 158, 11, 0.14)",
        color: "#92400e",
        border: "1px solid rgba(245, 158, 11, 0.3)",
        dot: "#f59e0b",
        label: "Pending Review",
      };
    }
    return {
      bg: "rgba(239, 68, 68, 0.14)",
      color: "#991b1b",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      dot: "#ef4444",
      label: "Cancelled",
    };
  };

  return (
    <div
      ref={containerRef}
      className="appt2-page"
      style={{
        padding: isMobile ? "16px 12px 60px" : "32px 24px 60px",
        overflowX: "auto",
      }}
    >
      <style>{`
        /* Global & Reset */
        .appt2-page {
          min-height: 100vh;
          background: linear-gradient(160deg, #F5EEF8 0%, #EDE4F3 40%, #DFD7EC 100%);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          position: relative;
          overflow-x: auto;
          box-sizing: border-box;
          color: #2D1A47;
          width: 100%;
        }

        /* Ambient glow orbs */
        .appt2-orb-1 {
          position: absolute;
          width: 380px; height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(236,72,153,0.24) 0%, rgba(236,72,153,0) 70%);
          top: -40px; right: -60px;
          pointer-events: none;
          z-index: 1;
        }
        .appt2-orb-2 {
          position: absolute;
          width: 440px; height: 440px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(168,85,247,0.22) 0%, rgba(168,85,247,0) 70%);
          bottom: 120px; left: -100px;
          pointer-events: none;
          z-index: 1;
        }
        .appt2-orb-3 {
          position: absolute;
          width: 320px; height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0) 70%);
          top: 380px; left: 45%;
          pointer-events: none;
          z-index: 1;
        }

        .appt2-container {
          max-width: 1220px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          width: 100%;
          overflow-x: auto;
        }

        /* ── Header ── */
        .appt2-header {
          background: linear-gradient(135deg, #4C1D95 0%, #6D28D9 45%, #9333EA 80%, #C026D3 100%);
          border-radius: 28px;
          padding: 30px 32px;
          margin-bottom: 24px;
          color: #ffffff;
          box-shadow: 0 16px 40px rgba(93, 33, 171, 0.28), 0 2px 8px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }
        .appt2-header::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, rgba(255,255,255,0.22), transparent 60%);
          pointer-events: none;
        }
        .appt2-header-left {
          position: relative;
          z-index: 2;
          max-width: 650px;
        }
        .appt2-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          backdrop-filter: blur(10px);
          margin-bottom: 14px;
          transition: all 0.2s ease;
        }
        .appt2-back-btn:hover {
          background: rgba(255, 255, 255, 0.28);
          transform: translateX(-2px);
        }
        .appt2-title {
          font-size: 34px;
          font-weight: 900;
          margin: 0 0 6px 0;
          letter-spacing: -0.6px;
          line-height: 1.15;
          text-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .appt2-subtitle {
          font-size: 14px;
          margin: 0;
          color: rgba(255, 255, 255, 0.88);
          line-height: 1.45;
        }
        .appt2-header-right {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
        .appt2-header-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.28);
          backdrop-filter: blur(12px);
          padding: 7px 14px;
          border-radius: 16px;
          font-size: 12.5px;
          font-weight: 700;
          color: #ffffff;
        }
        .appt2-header-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #34D399;
          box-shadow: 0 0 10px #34D399;
        }

        /* ── Stats Bar ── */
        .appt2-stats-grid {
          display: grid;
          gap: 14px;
          margin-bottom: 24px;
          width: 100%;
        }
        .appt2-stat-card {
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          border-radius: 20px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 10px 26px rgba(76, 29, 149, 0.07);
          box-sizing: border-box;
          min-width: 0;
        }
        .appt2-stat-icon {
          width: 48px; height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
        }
        .appt2-stat-info {
          min-width: 0;
        }
        .appt2-stat-info h3 {
          font-size: 24px;
          font-weight: 900;
          color: #1F1135;
          margin: 0 0 2px 0;
          line-height: 1.1;
        }
        .appt2-stat-info p {
          font-size: 12px;
          font-weight: 700;
          color: #6B5B82;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Main Grid ── */
        .appt2-main-grid {
          display: grid;
          gap: 22px;
          margin-bottom: 28px;
          width: 100%;
          align-items: start;
        }

        /* ── Booking Form Card ── */
        .appt2-booking-card {
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(22px);
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          border-radius: 24px;
          padding: 24px 22px;
          box-shadow: 0 16px 40px rgba(76, 29, 149, 0.09);
          box-sizing: border-box;
          width: 100%;
        }
        .appt2-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1.5px solid rgba(109, 40, 217, 0.1);
          gap: 10px;
        }
        .appt2-card-title-group h2 {
          font-size: 20px;
          font-weight: 900;
          color: #2D1A47;
          margin: 0 0 4px 0;
        }
        .appt2-card-title-group p {
          font-size: 12.5px;
          color: #6D597A;
          margin: 0;
        }
        .appt2-card-badge-icon {
          width: 42px; height: 42px;
          border-radius: 14px;
          background: linear-gradient(135deg, #F3E8FF, #FFFFFF);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 6px 14px rgba(109, 40, 217, 0.12);
          flex-shrink: 0;
        }

        .appt2-form-group {
          margin-bottom: 16px;
        }
        .appt2-label {
          display: block;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #5B4770;
          margin-bottom: 6px;
        }
        .appt2-select,
        .appt2-input,
        .appt2-textarea {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.95);
          border: 1.5px solid #DDD6FE;
          border-radius: 14px;
          padding: 11px 13px;
          font-size: 13.5px;
          font-family: inherit;
          color: #2D1A47;
          outline: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(76, 29, 149, 0.04);
        }
        .appt2-select:focus,
        .appt2-input:focus,
        .appt2-textarea:focus {
          border-color: #7C3AED;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
        }
        .appt2-textarea {
          resize: vertical;
          min-height: 85px;
          line-height: 1.45;
        }

        /* Session Type Pills */
        .appt2-mode-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .appt2-mode-btn {
          border: 1.5px solid #DDD6FE;
          background: rgba(255, 255, 255, 0.75);
          color: #4C1D95;
          padding: 9px 4px;
          border-radius: 13px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .appt2-mode-btn.active {
          background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%);
          border-color: transparent;
          color: #FFFFFF;
          box-shadow: 0 6px 14px rgba(124, 58, 237, 0.32);
        }
        .appt2-mode-btn:not(.active):hover {
          background: #F3E8FF;
          border-color: #C4B5FD;
        }

        /* Two columns Date & Time */
        .appt2-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        /* Submit Button */
        .appt2-submit-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, #7C3AED 0%, #C026D3 100%);
          color: #FFFFFF;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(124, 58, 237, 0.32);
          transition: all 0.22s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 6px;
        }
        .appt2-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(124, 58, 237, 0.4);
        }
        .appt2-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .appt2-safe-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(124, 58, 237, 0.08);
          border-radius: 12px;
          padding: 10px 12px;
          margin-top: 14px;
          color: #6D28D9;
          font-size: 11.5px;
          font-weight: 700;
          line-height: 1.4;
        }

        /* ── Timeline Panel ── */
        .appt2-timeline-card {
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(22px);
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          border-radius: 24px;
          padding: 24px 22px;
          box-shadow: 0 16px 40px rgba(76, 29, 149, 0.09);
          box-sizing: border-box;
          width: 100%;
        }

        /* Filter Pills */
        .appt2-filter-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 18px;
          border-bottom: 1.5px solid rgba(109, 40, 217, 0.1);
          padding-bottom: 14px;
        }
        .appt2-filter-btn {
          border: 1.5px solid #DDD6FE;
          border-radius: 13px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.75);
          color: #5B4770;
          transition: all 0.18s ease;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .appt2-filter-btn.active {
          background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%);
          color: #FFFFFF;
          border-color: transparent;
          box-shadow: 0 6px 14px rgba(124, 58, 237, 0.3);
        }
        .appt2-filter-btn:not(.active):hover {
          background: #F3E8FF;
          border-color: #C4B5FD;
        }
        .appt2-filter-count {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          padding: 1px 6px;
          font-size: 10.5px;
        }
        .appt2-filter-btn.active .appt2-filter-count {
          background: rgba(255, 255, 255, 0.24);
        }

        /* Appointments List */
        .appt2-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 600px;
          overflow-y: auto;
          padding-right: 2px;
          box-sizing: border-box;
        }
        .appt2-list::-webkit-scrollbar {
          width: 5px;
        }
        .appt2-list::-webkit-scrollbar-thumb {
          background: #DDD6FE;
          border-radius: 10px;
        }

        .appt2-item-card {
          background: rgba(255, 255, 255, 0.92);
          border-radius: 18px;
          border: 1.5px solid rgba(221, 214, 254, 0.7);
          box-shadow: 0 6px 20px rgba(76, 29, 149, 0.05);
          padding: 16px 18px;
          transition: all 0.22s ease;
          box-sizing: border-box;
          width: 100%;
        }
        .appt2-item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 26px rgba(124, 58, 237, 0.12);
          border-color: #C4B5FD;
        }

        .appt2-item-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }
        .appt2-counselor-group {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .appt2-avatar {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #E9D5FF 0%, #F5D0FE 100%);
          color: #6D28D9;
          font-weight: 900;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(109, 40, 217, 0.12);
          flex-shrink: 0;
        }
        .appt2-item-title {
          font-size: 15.5px;
          font-weight: 800;
          color: #2D1A47;
          margin: 0 0 2px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .appt2-item-reason {
          font-size: 12px;
          color: #6D597A;
          margin: 0;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .appt2-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .appt2-status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
        }

        /* Item Info Grid */
        .appt2-item-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          margin-bottom: 12px;
        }
        .appt2-item-cell {
          background: #F8F5FC;
          border-radius: 10px;
          padding: 6px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .appt2-cell-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          color: #8C7A9F;
        }
        .appt2-cell-val {
          font-size: 11.5px;
          font-weight: 800;
          color: #2D1A47;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Action Buttons */
        .appt2-item-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }
        .appt2-action-view {
          border: 1.5px solid #C4B5FD;
          background: #FAF5FF;
          color: #6D28D9;
          font-size: 11.5px;
          font-weight: 800;
          padding: 6px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .appt2-action-view:hover {
          background: #F3E8FF;
          border-color: #A855F7;
        }
        .appt2-action-cancel {
          border: 1px solid rgba(239, 68, 68, 0.28);
          background: rgba(239, 68, 68, 0.08);
          color: #DC2626;
          font-size: 11.5px;
          font-weight: 800;
          padding: 6px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .appt2-action-cancel:hover {
          background: rgba(239, 68, 68, 0.16);
          border-color: #EF4444;
        }

        .appt2-empty {
          text-align: center;
          padding: 40px 16px;
          color: #7C6892;
        }
        .appt2-empty-icon {
          font-size: 38px;
          margin-bottom: 8px;
        }
        .appt2-empty p {
          font-size: 14px;
          font-weight: 700;
          margin: 0;
        }

        /* ── Bottom Cards ── */
        .appt2-bottom-grid {
          display: grid;
          gap: 14px;
          width: 100%;
        }
        .appt2-help-card {
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          border-radius: 20px;
          padding: 20px 18px;
          text-align: center;
          cursor: pointer;
          box-shadow: 0 10px 26px rgba(76, 29, 149, 0.07);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          box-sizing: border-box;
        }
        .appt2-help-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 34px rgba(76, 29, 149, 0.14);
        }
        .appt2-help-icon {
          width: 48px; height: 48px;
          border-radius: 16px;
          background: linear-gradient(135deg, #F3E8FF, #FFFFFF);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin: 0 auto 10px;
          box-shadow: 0 6px 14px rgba(109, 40, 217, 0.12);
        }
        .appt2-help-card h3 {
          font-size: 16px;
          font-weight: 900;
          color: #2D1A47;
          margin: 0 0 4px 0;
        }
        .appt2-help-card p {
          font-size: 12.5px;
          color: #6D597A;
          margin: 0 0 10px 0;
          line-height: 1.45;
        }
        .appt2-help-link {
          color: #7C3AED;
          font-size: 12px;
          font-weight: 800;
        }
      `}</style>

      {/* Decorative ambient background orbs */}
      <div className="appt2-orb-1"></div>
      <div className="appt2-orb-2"></div>
      <div className="appt2-orb-3"></div>

      <div className="appt2-container">
        {/* Hero Header */}
        <div
          className="appt2-header"
          style={{
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            padding: isMobile ? "22px 18px" : "30px 32px",
          }}
        >
          <div className="appt2-header-left">
            <button
              className="appt2-back-btn"
              onClick={() => navigate("/counselor")}
            >
              ← Back to Counselors
            </button>
            <h1
              className="appt2-title"
              style={{ fontSize: isMobile ? "26px" : "34px" }}
            >
              Counseling Sessions
            </h1>
            <p className="appt2-subtitle">
              Manage your confidential mental wellness sessions, booking requests, and counselor appointments.
            </p>
          </div>
          <div className="appt2-header-right">
            <div className="appt2-header-pill">
              <span className="appt2-header-dot"></span>
              <span>Direct Booking Active</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div
          className="appt2-stats-grid"
          style={{
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          }}
        >
          <div className="appt2-stat-card">
            <div
              className="appt2-stat-icon"
              style={{ background: "linear-gradient(135deg, #F3E8FF, #FFFFFF)" }}
            >
              📌
            </div>
            <div className="appt2-stat-info">
              <h3>{totalAppointments}</h3>
              <p>Total Appointments</p>
            </div>
          </div>

          <div className="appt2-stat-card">
            <div
              className="appt2-stat-icon"
              style={{ background: "linear-gradient(135deg, #FEF3C7, #FFFFFF)" }}
            >
              ⏳
            </div>
            <div className="appt2-stat-info">
              <h3>{pendingCount}</h3>
              <p>Pending Requests</p>
            </div>
          </div>

          <div className="appt2-stat-card">
            <div
              className="appt2-stat-icon"
              style={{ background: "linear-gradient(135deg, #D1FAE5, #FFFFFF)" }}
            >
              ✅
            </div>
            <div className="appt2-stat-info">
              <h3>{confirmedCount}</h3>
              <p>Confirmed Sessions</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid (Stacks cleanly in 1 column when on mobile/frame, or 2 cols on wide desktop) */}
        <div
          className="appt2-main-grid"
          style={{
            gridTemplateColumns: isMobile ? "1fr" : "1.05fr 1.35fr",
          }}
        >
          {/* Booking Card */}
          <div className="appt2-booking-card">
            <div className="appt2-card-header">
              <div className="appt2-card-title-group">
                <h2>Book New Session</h2>
                <p>Select your counselor and preferred session slot</p>
              </div>
              <div className="appt2-card-badge-icon">🧠</div>
            </div>

            <div className="appt2-form-group">
              <label className="appt2-label">Select Counselor</label>
              <select
                name="counselorId"
                value={form.counselorId}
                onChange={handleChange}
                className="appt2-select"
                disabled={loadingCounselors}
              >
                {loadingCounselors ? (
                  <option>Loading counselors...</option>
                ) : counselors.length === 0 ? (
                  <option>No counselors available</option>
                ) : (
                  counselors.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="appt2-form-group">
              <label className="appt2-label">Session Type</label>
              <div className="appt2-mode-grid">
                {[
                  { key: "Online", label: "💻 Online" },
                  { key: "Physical", label: "🏥 In-Person" },
                  { key: "Phone Call", label: "📞 Phone" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setForm({ ...form, type: item.key })}
                    className={`appt2-mode-btn ${
                      form.type === item.key ? "active" : ""
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="appt2-form-group">
              <div className="appt2-two-col">
                <div>
                  <label className="appt2-label">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="appt2-input"
                  />
                </div>
                <div>
                  <label className="appt2-label">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    className="appt2-input"
                  />
                </div>
              </div>
            </div>

            <div className="appt2-form-group">
              <label className="appt2-label">Reason for Appointment</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Briefly describe what you'd like to discuss or work on..."
                className="appt2-textarea"
              ></textarea>
            </div>

            <button
              className="appt2-submit-btn"
              onClick={createAppointment}
              disabled={
                submitting || loadingCounselors || counselors.length === 0
              }
            >
              {submitting ? (
                <>⏳ Booking Appointment...</>
              ) : (
                <>✨ Request Appointment</>
              )}
            </button>

            <div className="appt2-safe-banner">
              <span>🔒</span>
              <span>
                100% Confidential & Private. Handled under clinical ethical standards.
              </span>
            </div>
          </div>

          {/* Timeline & History Card */}
          <div className="appt2-timeline-card">
            <div className="appt2-card-header">
              <div className="appt2-card-title-group">
                <h2>Session Timeline</h2>
                <p>Track your pending requests and upcoming appointments</p>
              </div>
              <div className="appt2-card-badge-icon">📋</div>
            </div>

            {/* Filter Pills */}
            <div className="appt2-filter-row">
              {["All", "Accepted", "Pending", "Cancelled"].map((filter) => {
                const count =
                  filter === "All"
                    ? appointments.length
                    : appointments.filter((a) => a.status === filter).length;

                return (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`appt2-filter-btn ${
                      selectedFilter === filter ? "active" : ""
                    }`}
                  >
                    <span>{filter}</span>
                    <span className="appt2-filter-count">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Appointments List */}
            <div className="appt2-list">
              {loadingAppointments ? (
                <div className="appt2-empty">
                  <p>⏳ Loading your appointments...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="appt2-empty">
                  <div className="appt2-empty-icon">🗓️</div>
                  <p>No {selectedFilter !== "All" ? selectedFilter.toLowerCase() : ""} appointments found.</p>
                </div>
              ) : (
                filteredAppointments.map((item) => {
                  const badge = getStatusBadge(item.status);
                  const counselorName = item.counselorId?.name || "Counselor";
                  const initial = counselorName.charAt(0).toUpperCase();

                  return (
                    <div key={item._id} className="appt2-item-card">
                      <div className="appt2-item-top">
                        <div className="appt2-counselor-group">
                          <div className="appt2-avatar">{initial}</div>
                          <div>
                            <h3 className="appt2-item-title">{counselorName}</h3>
                            <p className="appt2-item-reason">{item.reason}</p>
                          </div>
                        </div>

                        <span
                          className="appt2-status-pill"
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            border: badge.border,
                          }}
                        >
                          <span
                            className="appt2-status-dot"
                            style={{ background: badge.dot }}
                          ></span>
                          {badge.label}
                        </span>
                      </div>

                      <div className="appt2-item-grid">
                        <div className="appt2-item-cell">
                          <span className="appt2-cell-label">Session Type</span>
                          <span className="appt2-cell-val">
                            {item.type === "Online"
                              ? "💻 Online"
                              : item.type === "Physical"
                              ? "🏥 In-Person"
                              : item.type === "Phone Call"
                              ? "📞 Phone"
                              : item.type || "Online"}
                          </span>
                        </div>

                        <div className="appt2-item-cell">
                          <span className="appt2-cell-label">Date</span>
                          <span className="appt2-cell-val">
                            📅 {new Date(item.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="appt2-item-cell">
                          <span className="appt2-cell-label">Time</span>
                          <span className="appt2-cell-val">⏰ {item.time}</span>
                        </div>
                      </div>

                      <div className="appt2-item-actions">
                        <button
                          className="appt2-action-view"
                          onClick={() =>
                            alert(
                              `Counselor: ${counselorName}\nDate: ${new Date(
                                item.date
                              ).toLocaleDateString()}\nTime: ${item.time}\nType: ${
                                item.type || "Online"
                              }\nReason: ${item.reason}\nStatus: ${item.status}`
                            )
                          }
                        >
                          View Details
                        </button>

                        {["Pending", "Accepted"].includes(item.status) && (
                          <button
                            className="appt2-action-cancel"
                            onClick={() => cancelAppointment(item._id)}
                          >
                            ✕ Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Bottom Support Cards */}
        <div
          className="appt2-bottom-grid"
          style={{
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          }}
        >
          <div
            className="appt2-help-card"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="appt2-help-icon">💬</div>
            <h3>Session Reminder</h3>
            <p>
              Keep track of your counseling appointments and attend on time for best outcomes.
            </p>
            <span className="appt2-help-link">View appointments ↑</span>
          </div>

          <div
            className="appt2-help-card"
            onClick={() => navigate("/counselor")}
          >
            <div className="appt2-help-icon">🌿</div>
            <h3>Before the Session</h3>
            <p>
              Prepare your thoughts, feelings, and questions before meeting the counselor.
            </p>
            <span className="appt2-help-link">Go to counselors →</span>
          </div>

          <div
            className="appt2-help-card"
            onClick={() => navigate("/emergency")}
          >
            <div className="appt2-help-icon">🔐</div>
            <h3>Confidential Support</h3>
            <p>
              Your mental wellness journey is private, safe, and respected at all times.
            </p>
            <span className="appt2-help-link">Get urgent support →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Appointments;
