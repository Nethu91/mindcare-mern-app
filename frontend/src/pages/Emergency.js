import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
// Same background used on the Mood / Music pages.
// Adjust the path if needed.
import moodBg from "../assets/mood-bg.jpeg";

/* =====================================================
   3D EMOJI (Microsoft Fluent 3D set)
   Falls back to the normal emoji if the image can't load.
   ===================================================== */
const EMOJI_CDN =
  "https://cdn.jsdelivr.net/npm/@lobehub/fluent-emoji-3d@latest/assets/";

const toCode = (emoji, keepFe0f) =>
  Array.from(emoji)
    .map((c) => c.codePointAt(0).toString(16))
    .filter((h) => keepFe0f || h !== "fe0f")
    .join("-");

function Emoji3D({ e, size = 32, style }) {
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setAttempt(0);
  }, [e]);

  if (attempt > 1) {
    return (
      <span
        style={{
          fontSize: size * 0.85,
          lineHeight: 1,
          display: "inline-block",
          filter: "drop-shadow(0 6px 8px rgba(59,53,82,0.28))",
          ...style,
        }}
      >
        {e}
      </span>
    );
  }

  return (
    <img
      src={`${EMOJI_CDN}${toCode(e, attempt === 1)}.webp`}
      width={size}
      height={size}
      alt={e}
      draggable={false}
      onError={() => setAttempt((a) => a + 1)}
      style={{
        objectFit: "contain",
        display: "block",
        flexShrink: 0,
        filter: "drop-shadow(0 7px 8px rgba(59,53,82,0.28))",
        ...style,
      }}
    />
  );
}

function Emergency() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const safetySteps = [
    "Move to a safe and quiet place if possible.",
    "Take slow breaths and keep your phone nearby.",
    "Contact a trusted person or emergency service.",
    "Avoid staying alone if you feel unsafe.",
    "Seek professional help immediately if the situation is serious.",
  ];

  const iconPalette = [
    { icon: "🧠", color: "#D9C6E6" },
    { icon: "🚑", color: "#FFC4D8" },
    { icon: "🚓", color: "#C9CFFF" },
    { icon: "🤝", color: "#BFE3E6" },
  ];

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState(
    "I need urgent support. Please contact me as soon as possible."
  );
  const [locationShared, setLocationShared] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  // Live location sharing
  const [shareToken, setShareToken] = useState(null);
  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);

  // Add personal contact form
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelationship, setNewRelationship] = useState("");
  const [addingContact, setAddingContact] = useState(false);

  // Responsive detection based on the real container width
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setIsMobile(entries[0].contentRect.width <= 768);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Stop watching the GPS if the user leaves this page
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // -----------------------------
  // Load helplines (static) + personal contacts (DB)
  // -----------------------------
  useEffect(() => {
    loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);

      const [helplinesRes, personalRes] = await Promise.all([
        API.get("/emergency/helplines"),
        API.get("/emergency/contacts"),
      ]);

      const helplineContacts = helplinesRes.data.map((h, index) => ({
        id: `helpline-${index}`,
        name: h.name,
        type: "Emergency Helpline",
        phone: h.phone,
        available: "24/7",
        icon: iconPalette[index % iconPalette.length].icon,
        color: iconPalette[index % iconPalette.length].color,
        isPersonal: false,
        canRemove: false,
      }));

      const personalContacts = personalRes.data.map((c, index) => ({
        id: c._id,
        name: c.name,
        type:
          c.source === "profile"
            ? "Emergency Contact (from Profile)"
            : c.relationship || "Personal Support",
        phone: c.phone,
        available: "Saved Contact",
        icon: "🤝",
        color: iconPalette[(index + 3) % iconPalette.length].color,
        isPersonal: true,
        // contacts that come from the Profile page are edited there
        canRemove: c.source !== "profile",
      }));

      const combined = [...helplineContacts, ...personalContacts];
      setContacts(combined);

      if (combined.length > 0) {
        setSelectedContact(combined[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  // -----------------------------
  // LIVE LOCATION
  // -----------------------------
  const getPosition = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error("Geolocation not supported."));
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
      });
    });

  const startLocationShare = async () => {
    try {
      const pos = await getPosition();
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;

      const res = await API.post("/emergency/location/start", {
        lat,
        lng,
        accuracy,
      });

      setShareToken(res.data.token);
      setLocationShared(true);

      // keep sending live updates (max once every 8 seconds)
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (p) => {
          const now = Date.now();
          if (now - lastSentRef.current < 8000) return;
          lastSentRef.current = now;

          API.put("/emergency/location/update", {
            lat: p.coords.latitude,
            lng: p.coords.longitude,
            accuracy: p.coords.accuracy,
          }).catch(console.error);
        },
        (err) => console.error(err),
        { enableHighAccuracy: true, maximumAge: 5000 }
      );

      return res.data.token;
    } catch (err) {
      console.error(err);
      alert(
        "Couldn't get your location. Please allow location permission (the site must use HTTPS)."
      );
      return null;
    }
  };

  const stopLocationShare = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    try {
      await API.post("/emergency/location/stop");
    } catch (err) {
      console.error(err);
    }

    setLocationShared(false);
    setShareToken(null);
  };

  const handleShareLocation = () => {
    if (locationShared) stopLocationShare();
    else startLocationShare();
  };

  // -----------------------------
  // SOS (SMS or WhatsApp with live tracking link)
  // -----------------------------
  const handleSendSOS = async (channel = "sms") => {
    // SOS goes to a personal contact (selected one, or the first saved one)
    const target = selectedContact?.isPersonal
      ? selectedContact
      : contacts.find((c) => c.isPersonal);

    if (!target) {
      alert(
        "Please add a trusted contact first, or tap Call on an emergency helpline."
      );
      return;
    }

    let token = shareToken;
    if (!token) token = await startLocationShare();

    const link = token ? `${window.location.origin}/track/${token}` : "";
    const text = `${message}${link ? `\n\nMy live location: ${link}` : ""}`;

    const digits = target.phone.replace(/\D/g, "");
    const intl = digits.startsWith("0") ? `94${digits.slice(1)}` : digits;

    setSosSent(true);

    if (channel === "whatsapp") {
      window.open(
        `https://wa.me/${intl}?text=${encodeURIComponent(text)}`,
        "_blank"
      );
    } else {
      window.location.href = `sms:${target.phone}?&body=${encodeURIComponent(
        text
      )}`;
    }
  };

  const handleAddContact = async () => {
    if (!newName.trim() || !newPhone.trim()) {
      alert("Please enter a name and phone number.");
      return;
    }

    try {
      setAddingContact(true);

      await API.post("/emergency/contacts", {
        name: newName,
        phone: newPhone,
        relationship: newRelationship,
      });

      setNewName("");
      setNewPhone("");
      setNewRelationship("");

      await loadContacts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add emergency contact.");
    } finally {
      setAddingContact(false);
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await API.delete(`/emergency/contacts/${id}`);
      await loadContacts();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Failed to delete emergency contact."
      );
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        ...styles.page,
        padding: isMobile ? "16px" : "35px",
        backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02)), url(${moodBg})`,
      }}
    >
      <div style={styles.container}>
        {/* HEADER */}
        <div
          style={{
            ...styles.header,
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
          }}
        >
          <div>
            <button
              style={styles.backButton}
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>

            <h1 style={{ ...styles.title, fontSize: isMobile ? "28px" : "44px" }}>
              Emergency Support
            </h1>
            <p style={styles.subtitle}>
              Get quick help, contact emergency services, and follow safety
              steps during urgent situations.
            </p>
          </div>

          {!isMobile && (
            <div style={styles.headerBadge}>
              <Emoji3D e="🚨" size={30} />
              <span>Safe Help Center</span>
            </div>
          )}
        </div>

        {/* ALERT */}
        <div
          style={{
            ...styles.alertCard,
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            padding: isMobile ? "22px" : "30px",
          }}
        >
          <div>
            <h2 style={{ ...styles.alertTitle, fontSize: isMobile ? "23px" : "30px" }}>
              Need urgent support?
            </h2>
            <p style={styles.alertText}>
              If you feel unsafe or in immediate danger, contact emergency
              services or a trusted person now.
            </p>
          </div>

          <button
            style={{
              ...styles.sosButton,
              width: isMobile ? "100%" : "auto",
            }}
            onClick={() => handleSendSOS("sms")}
          >
            <Emoji3D e="🚨" size={28} />
            Send SOS
          </button>
        </div>

        {/* STATS */}
        <div
          style={{
            ...styles.statsGrid,
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
            gap: isMobile ? "12px" : "20px",
          }}
        >
          <div style={{ ...styles.statCard, padding: isMobile ? "14px" : "22px" }}>
            <div style={styles.statIcon}>
              <Emoji3D e="📞" size={40} />
            </div>
            <div>
              <h3 style={styles.statNumber}>{contacts.length}</h3>
              <p style={styles.statText}>Emergency Contacts</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, padding: isMobile ? "14px" : "22px" }}>
            <div style={styles.statIcon}>
              <Emoji3D e="📍" size={40} />
            </div>
            <div>
              <h3 style={styles.statNumber}>{locationShared ? "On" : "Off"}</h3>
              <p style={styles.statText}>Location Sharing</p>
            </div>
          </div>

          <div
            style={{
              ...styles.statCard,
              padding: isMobile ? "14px" : "22px",
              gridColumn: isMobile ? "span 2" : "auto",
            }}
          >
            <div style={styles.statIcon}>
              <Emoji3D e="🛡️" size={40} />
            </div>
            <div>
              <h3 style={styles.statNumber}>{sosSent ? "Sent" : "Ready"}</h3>
              <p style={styles.statText}>SOS Status</p>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div
          style={{
            ...styles.mainGrid,
            gridTemplateColumns: isMobile ? "1fr" : "1.25fr 1fr",
            gap: isMobile ? "18px" : "25px",
          }}
        >
          {/* CONTACTS */}
          <div style={{ ...styles.leftPanel, padding: isMobile ? "18px" : "30px" }}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Emergency Contacts</h2>
                <p style={styles.sectionSubText}>
                  Select a contact and call immediately if needed.
                </p>
              </div>

              {!isMobile && (
                <div style={styles.panelIcon}>
                  <Emoji3D e="📞" size={42} />
                </div>
              )}
            </div>

            <div style={styles.contactList}>
              {loading ? (
                <p style={{ color: "#5A5478", textAlign: "center" }}>
                  Loading contacts...
                </p>
              ) : (
                contacts.map((contact) => {
                  const active = selectedContact?.id === contact.id;
                  return (
                    <div
                      key={contact.id}
                      style={{
                        ...styles.contactCard,
                        flexWrap: "wrap",
                        padding: isMobile ? "14px" : "18px",
                        border: active
                          ? "2px solid rgba(255,255,255,0.95)"
                          : "1px solid rgba(255,255,255,0.55)",
                        background: active
                          ? "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(255,214,222,0.6))"
                          : "rgba(255,255,255,0.36)",
                        boxShadow: active
                          ? "0 18px 38px rgba(240,140,150,0.35), inset 0 2px 4px rgba(255,255,255,0.8)"
                          : "0 12px 28px rgba(59,53,82,0.1), inset 0 1px 2px rgba(255,255,255,0.6)",
                      }}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <div
                        style={{
                          ...styles.contactIcon,
                          width: isMobile ? "60px" : "78px",
                          height: isMobile ? "60px" : "78px",
                          background: `radial-gradient(circle at 30% 25%, #FFFFFF 0%, ${contact.color} 75%)`,
                        }}
                      >
                        <Emoji3D e={contact.icon} size={isMobile ? 40 : 54} />
                      </div>

                      <div style={{ ...styles.contactInfo, flex: "1 1 140px" }}>
                        <h3 style={styles.contactName}>{contact.name}</h3>
                        <p style={styles.contactType}>{contact.type}</p>

                        <div style={styles.metaRow}>
                          <span style={styles.metaBadge}>
                            <Emoji3D e="☎️" size={15} style={styles.metaEmoji} />
                            {contact.phone}
                          </span>
                          <span style={styles.metaBadge}>
                            <Emoji3D e="⏰" size={15} style={styles.metaEmoji} />
                            {contact.available}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: isMobile ? "row" : "column",
                          gap: "8px",
                          width: isMobile ? "100%" : "auto",
                        }}
                      >
                        <button
                          style={{ ...styles.callButton, flex: isMobile ? 1 : "none" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCall(contact.phone);
                          }}
                        >
                          Call
                        </button>

                        {contact.canRemove && (
                          <button
                            style={{ ...styles.deleteButton, flex: isMobile ? 1 : "none" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteContact(contact.id);
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add personal contact */}
            <div style={styles.addContactBox}>
              <h3 style={styles.addContactTitle}>Add a Trusted Contact</h3>

              <input
                style={styles.input}
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />

              <input
                style={styles.input}
                placeholder="Phone number"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />

              <input
                style={styles.input}
                placeholder="Relationship (e.g. Friend, Parent)"
                value={newRelationship}
                onChange={(e) => setNewRelationship(e.target.value)}
              />

              <button
                style={{
                  ...styles.callButton,
                  width: "100%",
                  opacity: addingContact ? 0.7 : 1,
                }}
                onClick={handleAddContact}
                disabled={addingContact}
              >
                {addingContact ? "Adding..." : "+ Add Contact"}
              </button>
            </div>
          </div>

          {/* SOS + STEPS */}
          <div style={styles.rightPanel}>
            {selectedContact && (
              <div style={{ ...styles.sosCard, padding: isMobile ? "20px" : "30px" }}>
                <div
                  style={{
                    ...styles.selectedIconBox,
                    background: `radial-gradient(circle at 30% 25%, #FFFFFF 0%, ${selectedContact.color} 75%)`,
                  }}
                >
                  <Emoji3D e={selectedContact.icon} size={74} />
                </div>

                <h2 style={styles.selectedTitle}>{selectedContact.name}</h2>
                <p style={styles.selectedType}>{selectedContact.type}</p>

                <div style={styles.phoneBadge}>
                  <Emoji3D e="☎️" size={18} style={styles.metaEmoji} />
                  {selectedContact.phone}
                </div>

                <label style={styles.label}>Emergency Message</label>
                <textarea
                  style={styles.textArea}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>

                <div
                  style={{
                    ...styles.actionGrid,
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  }}
                >
                  <button
                    style={styles.primaryButton}
                    onClick={() => handleCall(selectedContact.phone)}
                  >
                    <Emoji3D e="📞" size={22} />
                    Call Now
                  </button>

                  <button style={styles.locationButton} onClick={handleShareLocation}>
                    <Emoji3D e="📍" size={22} />
                    {locationShared ? "Stop Sharing" : "Share Location"}
                  </button>
                </div>

                <button
                  style={styles.fullSosButton}
                  onClick={() => handleSendSOS("sms")}
                >
                  <Emoji3D e="🚨" size={24} />
                  Send SOS via SMS
                </button>

                <button
                  style={{
                    ...styles.locationButton,
                    width: "100%",
                    marginTop: "12px",
                  }}
                  onClick={() => handleSendSOS("whatsapp")}
                >
                  💬 Send SOS via WhatsApp
                </button>

                <p style={styles.safeNote}>
                  SOS opens your SMS / WhatsApp with your message and a live
                  location link. In a real emergency, contact official services
                  immediately.
                </p>
              </div>
            )}

            <div style={{ ...styles.stepsCard, padding: isMobile ? "18px" : "26px" }}>
              <h3 style={styles.stepsTitle}>Quick Safety Plan</h3>

              {safetySteps.map((step, index) => (
                <div key={index} style={styles.stepItem}>
                  <div style={styles.stepNumber}>{index + 1}</div>
                  <p style={styles.stepText}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   THEME — from mood-bg.jpeg (teal-grey → lavender → peach).
   Emergency actions use a soft coral-rose so they still
   stand out without clashing with the pastel background.
   ===================================================== */
const glass = {
  background: "rgba(255,255,255,0.34)",
  border: "1px solid rgba(255,255,255,0.6)",
  backdropFilter: "blur(18px) saturate(140%)",
  WebkitBackdropFilter: "blur(18px) saturate(140%)",
  boxShadow:
    "0 24px 55px rgba(59,53,82,0.16), inset 0 2px 4px rgba(255,255,255,0.65)",
};

const coral = "linear-gradient(135deg, #E8707E 0%, #F08C98 50%, #F5B0A0 100%)";
const coralShadow =
  "0 14px 28px rgba(232,112,126,0.38), inset 0 2px 4px rgba(255,255,255,0.5)";

const iconCircle = {
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "radial-gradient(circle at 30% 25%, #FFFFFF 0%, rgba(225,214,245,0.9) 100%)",
  boxShadow:
    "0 12px 24px rgba(59,53,82,0.15), inset 0 2px 4px rgba(255,255,255,0.9)",
  flexShrink: 0,
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundSize: "cover",
    backgroundPosition: "center top",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    backgroundColor: "#CFC8DC",
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    position: "relative",
    overflowX: "hidden",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1240px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "26px",
    flexWrap: "wrap",
    gap: "16px",
  },

  backButton: {
    border: "1px solid rgba(255,255,255,0.65)",
    padding: "10px 18px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.45)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color: "#4A4468",
    fontWeight: "700",
    cursor: "pointer",
    marginBottom: "14px",
    boxShadow:
      "0 10px 24px rgba(59,53,82,0.12), inset 0 1px 2px rgba(255,255,255,0.8)",
  },

  title: {
    color: "#2F2A45",
    margin: "0 0 8px 0",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    textShadow: "0 2px 14px rgba(255,255,255,0.45)",
  },

  subtitle: {
    color: "#4A4468",
    fontSize: "16px",
    margin: 0,
    lineHeight: "1.55",
    maxWidth: "560px",
  },

  headerBadge: {
    ...glass,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 22px",
    borderRadius: "24px",
    color: "#3B3552",
    fontWeight: "700",
  },

  alertCard: {
    ...glass,
    background:
      "linear-gradient(135deg, rgba(247,170,180,0.5), rgba(255,255,255,0.4))",
    borderRadius: "34px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "25px",
  },

  alertTitle: {
    color: "#6E2434",
    fontWeight: "800",
    margin: "0 0 8px 0",
  },

  alertText: {
    color: "#4A4468",
    lineHeight: "1.6",
    margin: 0,
    maxWidth: "760px",
  },

  sosButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    border: "1px solid rgba(255,255,255,0.55)",
    padding: "16px 28px",
    borderRadius: "26px",
    background: coral,
    color: "#FFFFFF",
    fontSize: "18px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: coralShadow,
    whiteSpace: "nowrap",
  },

  statsGrid: {
    display: "grid",
    marginBottom: "25px",
  },

  statCard: {
    ...glass,
    display: "flex",
    alignItems: "center",
    gap: "14px",
    borderRadius: "30px",
  },

  statIcon: {
    ...iconCircle,
    width: "62px",
    height: "62px",
  },

  statNumber: {
    color: "#2F2A45",
    margin: "0 0 4px 0",
    fontSize: "26px",
    fontWeight: "800",
  },

  statText: {
    color: "#5A5478",
    margin: 0,
    fontSize: "13px",
    fontWeight: "600",
  },

  mainGrid: {
    display: "grid",
  },

  leftPanel: {
    ...glass,
    borderRadius: "36px",
    minWidth: 0,
  },

  rightPanel: {
    display: "grid",
    gap: "25px",
    alignContent: "start",
    minWidth: 0,
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    marginBottom: "22px",
  },

  sectionTitle: {
    color: "#2F2A45",
    fontSize: "24px",
    margin: "0 0 7px 0",
    fontWeight: "800",
  },

  sectionSubText: {
    color: "#5A5478",
    margin: 0,
    lineHeight: "1.5",
    fontSize: "14px",
  },

  panelIcon: {
    ...iconCircle,
    width: "64px",
    height: "64px",
  },

  contactList: {
    display: "grid",
    gap: "16px",
    marginBottom: "20px",
  },

  contactCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    borderRadius: "28px",
    cursor: "pointer",
    transition: "0.25s ease",
    boxSizing: "border-box",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },

  contactIcon: {
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 14px 26px rgba(59,53,82,0.18), inset 0 3px 6px rgba(255,255,255,0.85)",
    flexShrink: 0,
  },

  contactInfo: {
    minWidth: 0,
  },

  contactName: {
    color: "#2F2A45",
    fontSize: "18px",
    margin: "0 0 5px 0",
    fontWeight: "800",
  },

  contactType: {
    color: "#7B64B8",
    margin: "0 0 10px 0",
    fontWeight: "700",
    fontSize: "14px",
  },

  metaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  metaBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255,255,255,0.6)",
    color: "#4A4468",
    padding: "5px 10px",
    borderRadius: "14px",
    fontSize: "12px",
    fontWeight: "700",
    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8)",
  },

  metaEmoji: {
    filter: "drop-shadow(0 2px 2px rgba(59,53,82,0.25))",
  },

  callButton: {
    border: "1px solid rgba(255,255,255,0.55)",
    padding: "12px 18px",
    borderRadius: "18px",
    background: coral,
    color: "#FFFFFF",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: coralShadow,
  },

  deleteButton: {
    border: "1px solid rgba(255,255,255,0.7)",
    padding: "10px 12px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.65)",
    color: "#B03A55",
    fontWeight: "700",
    fontSize: "12px",
    cursor: "pointer",
    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.9)",
  },

  addContactBox: {
    padding: "20px",
    borderRadius: "26px",
    background: "rgba(255,255,255,0.35)",
    border: "1px dashed rgba(90,84,120,0.4)",
  },

  addContactTitle: {
    color: "#2F2A45",
    margin: "0 0 12px 0",
    fontSize: "16px",
    fontWeight: "800",
  },

  input: {
    width: "100%",
    padding: "13px 16px",
    border: "none",
    outline: "none",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.55)",
    color: "#2F2A45",
    fontSize: "14px",
    boxShadow: "inset 0 2px 8px rgba(59,53,82,0.1), 0 1px 0 rgba(255,255,255,0.7)",
    boxSizing: "border-box",
    marginBottom: "10px",
  },

  sosCard: {
    ...glass,
    borderRadius: "36px",
    textAlign: "center",
  },

  selectedIconBox: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    margin: "0 auto 18px auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 18px 36px rgba(59,53,82,0.2), inset 0 3px 6px rgba(255,255,255,0.9)",
  },

  selectedTitle: {
    color: "#2F2A45",
    fontSize: "25px",
    margin: "0 0 6px 0",
    fontWeight: "800",
  },

  selectedType: {
    color: "#5A5478",
    margin: "0 0 14px 0",
    fontWeight: "600",
  },

  phoneBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 16px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.6)",
    color: "#C94A5E",
    fontWeight: "800",
    marginBottom: "18px",
    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.85)",
  },

  label: {
    display: "block",
    color: "#2F2A45",
    fontWeight: "700",
    margin: "14px 0 8px 0",
    textAlign: "left",
  },

  textArea: {
    width: "100%",
    minHeight: "105px",
    resize: "none",
    padding: "16px",
    border: "none",
    outline: "none",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.55)",
    color: "#2F2A45",
    fontSize: "15px",
    fontFamily: "inherit",
    boxShadow: "inset 0 2px 8px rgba(59,53,82,0.1), 0 1px 0 rgba(255,255,255,0.7)",
    boxSizing: "border-box",
    marginBottom: "15px",
  },

  actionGrid: {
    display: "grid",
    gap: "12px",
    marginBottom: "12px",
  },

  primaryButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px",
    border: "1px solid rgba(255,255,255,0.55)",
    borderRadius: "22px",
    background: coral,
    color: "white",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: coralShadow,
  },

  locationButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px",
    border: "1px solid rgba(255,255,255,0.7)",
    borderRadius: "22px",
    background: "linear-gradient(160deg, rgba(255,255,255,0.85), rgba(225,214,245,0.6))",
    color: "#4A4468",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow:
      "0 12px 24px rgba(59,53,82,0.12), inset 0 2px 4px rgba(255,255,255,0.9)",
  },

  fullSosButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "16px",
    border: "1px solid rgba(255,255,255,0.55)",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #8FA8D8 0%, #B79BE0 50%, #F0A9A0 100%)",
    color: "white",
    fontSize: "16px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow:
      "0 16px 32px rgba(142,120,190,0.4), inset 0 2px 4px rgba(255,255,255,0.5)",
  },

  safeNote: {
    color: "#5A5478",
    fontSize: "13px",
    textAlign: "center",
    margin: "16px 0 0 0",
    lineHeight: "1.5",
  },

  stepsCard: {
    ...glass,
    borderRadius: "34px",
  },

  stepsTitle: {
    color: "#2F2A45",
    margin: "0 0 18px 0",
    fontSize: "22px",
    fontWeight: "800",
  },

  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 14px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.5)",
    marginBottom: "12px",
    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8)",
  },

  stepNumber: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: coral,
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    flexShrink: 0,
    boxShadow: "0 8px 16px rgba(232,112,126,0.35), inset 0 2px 3px rgba(255,255,255,0.5)",
  },

  stepText: {
    color: "#4A4468",
    margin: 0,
    lineHeight: "1.5",
    fontSize: "14px",
  },
};

export default Emergency;