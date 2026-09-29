import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import meditationImg from "../assets/Meditation.jpeg";

function Emergency() {
  const navigate = useNavigate();

  const safetySteps = [
    "Move to a safe and quiet place if possible.",
    "Take slow breaths and keep your phone nearby.",
    "Contact a trusted person or emergency service.",
    "Avoid staying alone if you feel unsafe.",
    "Seek professional help immediately if the situation is serious.",
  ];

  const iconPalette = [
    { icon: "🧠", color: "#CDB4DB" },
    { icon: "🚑", color: "#FFAFCC" },
    { icon: "🚓", color: "#B8C0FF" },
    { icon: "🤝", color: "#A8DADC" },
  ];

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState(
    "I need urgent support. Please contact me as soon as possible."
  );
  const [locationShared, setLocationShared] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  // Add personal contact form
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelationship, setNewRelationship] = useState("");
  const [addingContact, setAddingContact] = useState(false);

  // -----------------------------
  // Load helplines (static) + personal contacts (DB) from backend
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
      }));

      const personalContacts = personalRes.data.map((c, index) => ({
        id: c._id,
        name: c.name,
        type: c.relationship || "Personal Support",
        phone: c.phone,
        available: "Saved Contact",
        icon: "🤝",
        color: iconPalette[(index + 3) % iconPalette.length].color,
        isPersonal: true,
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

  const handleShareLocation = () => {
    setLocationShared(true);
    alert("Location sharing enabled for emergency support.");
  };

  const handleSendSOS = () => {
    if (!selectedContact) {
      alert("Please select a contact first.");
      return;
    }

    setSosSent(true);
    alert(
      `SOS Alert Prepared!\n\nContact: ${selectedContact.name}\nPhone: ${selectedContact.phone}\nMessage: ${message}`
    );
  };

  // -----------------------------
  // Add a personal emergency contact -> saves to DB
  // -----------------------------
  const handleAddContact = async () => {
    if (!newName || !newPhone) {
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
      alert(
        err.response?.data?.message || "Failed to add emergency contact."
      );
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
    <div style={styles.page}>
      <div style={styles.circleOne}></div>
      <div style={styles.circleTwo}></div>
      <div style={styles.circleThree}></div>

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <button
              style={styles.backButton}
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>

            <h1 style={styles.title}>Emergency Support</h1>
            <p style={styles.subtitle}>
              Get quick help, contact emergency services, and follow safety
              steps during urgent situations.
            </p>
          </div>

          <div style={styles.headerBadge}>🚨 Safe Help Center</div>
        </div>

        <div style={styles.alertCard}>
          <div>
            <h2 style={styles.alertTitle}>Need urgent support?</h2>
            <p style={styles.alertText}>
              If you feel unsafe or in immediate danger, contact emergency
              services or a trusted person now.
            </p>
          </div>

          <button style={styles.sosButton} onClick={handleSendSOS}>
            🚨 Send SOS
          </button>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📞</div>
            <div>
              <h3 style={styles.statNumber}>{contacts.length}</h3>
              <p style={styles.statText}>Emergency Contacts</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>📍</div>
            <div>
              <h3 style={styles.statNumber}>
                {locationShared ? "On" : "Off"}
              </h3>
              <p style={styles.statText}>Location Sharing</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>🛡️</div>
            <div>
              <h3 style={styles.statNumber}>{sosSent ? "Sent" : "Ready"}</h3>
              <p style={styles.statText}>SOS Status</p>
            </div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.leftPanel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Emergency Contacts</h2>
                <p style={styles.sectionSubText}>
                  Select a contact and call immediately if needed.
                </p>
              </div>

              <div style={styles.panelIcon}>📞</div>
            </div>

            <div style={styles.contactList}>
              {loading ? (
                <p style={{ color: "#6D597A", textAlign: "center" }}>
                  Loading contacts...
                </p>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    style={{
                      ...styles.contactCard,
                      border:
                        selectedContact?.id === contact.id
                          ? "3px solid #E63946"
                          : "1px solid rgba(255,255,255,0.75)",
                      background:
                        selectedContact?.id === contact.id
                          ? "linear-gradient(145deg, #FFFFFF, #FFE5EC)"
                          : "rgba(255,255,255,0.64)",
                    }}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div
                      style={{
                        ...styles.contactIcon,
                        backgroundColor: contact.color,
                      }}
                    >
                      {contact.icon}
                    </div>

                    <div style={styles.contactInfo}>
                      <h3 style={styles.contactName}>{contact.name}</h3>
                      <p style={styles.contactType}>{contact.type}</p>

                      <div style={styles.metaRow}>
                        <span style={styles.metaBadge}>☎ {contact.phone}</span>
                        <span style={styles.metaBadge}>
                          ⏰ {contact.available}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <button
                        style={styles.callButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCall(contact.phone);
                        }}
                      >
                        Call
                      </button>

                      {contact.isPersonal && (
                        <button
                          style={styles.deleteButton}
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
                ))
              )}
            </div>

            {/* Add personal contact form */}
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

          <div style={styles.rightPanel}>
            {selectedContact && (
              <div style={styles.sosCard}>
                <div
                  style={{
                    ...styles.selectedIconBox,
                    backgroundColor: selectedContact.color,
                  }}
                >
                  {selectedContact.icon}
                </div>

                <h2 style={styles.selectedTitle}>{selectedContact.name}</h2>
                <p style={styles.selectedType}>{selectedContact.type}</p>

                <div style={styles.phoneBadge}>☎ {selectedContact.phone}</div>

                <label style={styles.label}>Emergency Message</label>
                <textarea
                  style={styles.textArea}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>

                <div style={styles.actionGrid}>
                  <button
                    style={styles.primaryButton}
                    onClick={() => handleCall(selectedContact.phone)}
                  >
                    📞 Call Now
                  </button>

                  <button
                    style={styles.locationButton}
                    onClick={handleShareLocation}
                  >
                    📍 Share Location
                  </button>
                </div>

                <button style={styles.fullSosButton} onClick={handleSendSOS}>
                  🚨 Send SOS Alert
                </button>

                <p style={styles.safeNote}>
                  This interface helps you prepare emergency actions. In a real
                  emergency, contact official services immediately.
                </p>
              </div>
            )}

            <div style={styles.stepsCard}>
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

        {/* Only the Breathing Practice tab, full width like the cards above */}
        <div style={styles.bottomGrid}>
          <div style={styles.helpCard} onClick={() => navigate("/meditation")}>
            <div style={styles.helpIcon}>
              <img
                src={meditationImg}
                alt="Breathing practice"
                style={styles.helpImg}
              />
            </div>
            <h3 style={styles.helpTitle}>Breathing Practice</h3>
            <p style={styles.helpText}>
              Use guided breathing to calm your body and mind.
            </p>
            <p style={styles.helpLink}>Go to Meditation →</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "35px",
    background:
      "linear-gradient(160deg, #F1E8E9 0%, #EFE6EE 45%, #D2CFE1 100%)",
    fontFamily: "Arial, sans-serif",
    position: "relative",
    overflowX: "hidden",
  },

  circleOne: {
    position: "absolute",
    width: "270px",
    height: "270px",
    borderRadius: "50%",
    background: "#FFAFCC",
    top: "70px",
    right: "80px",
    opacity: "0.34",
    filter: "blur(5px)",
  },

  circleTwo: {
    position: "absolute",
    width: "310px",
    height: "310px",
    borderRadius: "50%",
    background: "#B8C0FF",
    bottom: "90px",
    left: "60px",
    opacity: "0.33",
    filter: "blur(5px)",
  },

  circleThree: {
    position: "absolute",
    width: "190px",
    height: "190px",
    borderRadius: "50%",
    background: "#A8DADC",
    top: "360px",
    left: "45%",
    opacity: "0.24",
    filter: "blur(6px)",
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
    alignItems: "center",
    marginBottom: "26px",
    flexWrap: "wrap",
    gap: "16px",
  },

  backButton: {
    border: "none",
    padding: "10px 16px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.65)",
    color: "#6D597A",
    fontWeight: "800",
    cursor: "pointer",
    marginBottom: "12px",
    boxShadow: "0 10px 24px rgba(49,34,68,0.1)",
  },

  title: {
    fontSize: "42px",
    color: "#312244",
    margin: "0 0 7px 0",
    fontWeight: "900",
  },

  subtitle: {
    color: "#6D597A",
    fontSize: "16px",
    margin: 0,
    lineHeight: "1.5",
  },

  headerBadge: {
    padding: "13px 22px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.55)",
    boxShadow: "0 12px 25px rgba(49,34,68,0.12)",
    color: "#4A4E69",
    fontWeight: "800",
  },

  alertCard: {
    background: "linear-gradient(135deg, rgba(255,143,171,0.55), rgba(255,255,255,0.65))",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "34px",
    padding: "30px",
    boxShadow: "0 25px 60px rgba(230,57,70,0.18)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
  },

  alertTitle: {
    color: "#7A1F2B",
    fontSize: "30px",
    fontWeight: "900",
    margin: "0 0 8px 0",
  },

  alertText: {
    color: "#6D597A",
    lineHeight: "1.6",
    margin: 0,
    maxWidth: "760px",
  },

  sosButton: {
    border: "none",
    padding: "18px 28px",
    borderRadius: "26px",
    background: "linear-gradient(135deg, #E63946, #FF758F)",
    color: "#FFFFFF",
    fontSize: "18px",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 18px 35px rgba(230,57,70,0.35)",
    whiteSpace: "nowrap",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "25px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "22px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 20px 45px rgba(49,34,68,0.13)",
  },

  statIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #F3E8FF, #FFFFFF)",
    fontSize: "30px",
  },

  statNumber: {
    color: "#312244",
    margin: "0 0 4px 0",
    fontSize: "28px",
    fontWeight: "900",
  },

  statText: {
    color: "#6D597A",
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.25fr 1fr",
    gap: "25px",
    marginBottom: "25px",
  },

  leftPanel: {
    background: "rgba(255,255,255,0.54)",
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "34px",
    padding: "30px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
  },

  rightPanel: {
    display: "grid",
    gap: "25px",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    marginBottom: "22px",
  },

  sectionTitle: {
    color: "#312244",
    fontSize: "24px",
    margin: "0 0 7px 0",
    fontWeight: "900",
  },

  sectionSubText: {
    color: "#6D597A",
    margin: 0,
    lineHeight: "1.5",
    fontSize: "14px",
  },

  panelIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    background: "linear-gradient(135deg, #CDB4DB, #FFC8DD)",
    boxShadow: "0 15px 30px rgba(49,34,68,0.15)",
    flexShrink: 0,
  },

  contactList: {
    display: "grid",
    gap: "16px",
    marginBottom: "20px",
  },

  contactCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "18px",
    borderRadius: "28px",
    boxShadow: "0 16px 34px rgba(49,34,68,0.11)",
    cursor: "pointer",
    transition: "0.3s ease",
  },

  contactIcon: {
    width: "78px",
    height: "78px",
    borderRadius: "27px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
    flexShrink: 0,
  },

  contactInfo: {
    flex: 1,
  },

  contactName: {
    color: "#312244",
    fontSize: "19px",
    margin: "0 0 5px 0",
    fontWeight: "900",
  },

  contactType: {
    color: "#9B5DE5",
    margin: "0 0 10px 0",
    fontWeight: "800",
    fontSize: "14px",
  },

  metaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  metaBadge: {
    background: "rgba(255,255,255,0.72)",
    color: "#6D597A",
    padding: "6px 10px",
    borderRadius: "14px",
    fontSize: "12px",
    fontWeight: "800",
  },

  callButton: {
    border: "none",
    padding: "12px 18px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #E63946, #FF758F)",
    color: "#FFFFFF",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(230,57,70,0.25)",
  },

  deleteButton: {
    border: "none",
    padding: "8px 12px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.85)",
    color: "#B83256",
    fontWeight: "800",
    fontSize: "12px",
    cursor: "pointer",
  },

  addContactBox: {
    padding: "20px",
    borderRadius: "26px",
    background: "rgba(255,255,255,0.5)",
    border: "1px dashed rgba(109,89,122,0.35)",
  },

  addContactTitle: {
    color: "#312244",
    margin: "0 0 12px 0",
    fontSize: "16px",
    fontWeight: "900",
  },

  input: {
    width: "100%",
    padding: "13px",
    border: "none",
    outline: "none",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.75)",
    color: "#312244",
    fontSize: "14px",
    boxShadow: "inset 0 0 14px rgba(49,34,68,0.06)",
    boxSizing: "border-box",
    marginBottom: "10px",
  },

  sosCard: {
    background: "rgba(255,255,255,0.54)",
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "34px",
    padding: "30px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
    textAlign: "center",
  },

  selectedIconBox: {
    width: "115px",
    height: "115px",
    borderRadius: "36px",
    margin: "0 auto 18px auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "58px",
    boxShadow: "0 18px 35px rgba(49,34,68,0.18)",
  },

  selectedTitle: {
    color: "#312244",
    fontSize: "25px",
    margin: "0 0 6px 0",
    fontWeight: "900",
  },

  selectedType: {
    color: "#6D597A",
    margin: "0 0 14px 0",
    fontWeight: "700",
  },

  phoneBadge: {
    display: "inline-block",
    padding: "9px 15px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.72)",
    color: "#E63946",
    fontWeight: "900",
    marginBottom: "18px",
  },

  label: {
    display: "block",
    color: "#312244",
    fontWeight: "800",
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
    background: "rgba(255,255,255,0.72)",
    color: "#312244",
    fontSize: "15px",
    boxShadow: "inset 0 0 16px rgba(49,34,68,0.07)",
    boxSizing: "border-box",
    marginBottom: "15px",
  },

  actionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
  },

  primaryButton: {
    padding: "15px",
    border: "none",
    borderRadius: "22px",
    background: "linear-gradient(135deg, #E63946, #FF758F)",
    color: "white",
    fontSize: "15px",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 16px 30px rgba(230,57,70,0.28)",
  },

  locationButton: {
    padding: "15px",
    border: "none",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.75)",
    color: "#6D597A",
    fontSize: "15px",
    fontWeight: "900",
    cursor: "pointer",
  },

  fullSosButton: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #9B5DE5, #F15BB5)",
    color: "white",
    fontSize: "16px",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 18px 35px rgba(155,93,229,0.35)",
  },

  safeNote: {
    color: "#8D7D99",
    fontSize: "13px",
    textAlign: "center",
    margin: "16px 0 0 0",
    lineHeight: "1.5",
  },

  stepsCard: {
    padding: "26px",
    borderRadius: "32px",
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 20px 45px rgba(49,34,68,0.13)",
  },

  stepsTitle: {
    color: "#312244",
    margin: "0 0 18px 0",
    fontSize: "22px",
    fontWeight: "900",
  },

  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.65)",
    marginBottom: "12px",
  },

  stepNumber: {
    width: "38px",
    height: "38px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #E63946, #FF758F)",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    flexShrink: 0,
  },

  stepText: {
    color: "#6D597A",
    margin: 0,
    lineHeight: "1.5",
    fontSize: "14px",
  },

  // Single full-width tab
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "20px",
  },

  helpCard: {
    padding: "30px 25px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 20px 45px rgba(49,34,68,0.13)",
    textAlign: "center",
    cursor: "pointer",
  },

  helpIcon: {
    width: "120px",
    height: "120px",
    margin: "0 auto 16px auto",
    borderRadius: "32px",
    overflow: "hidden",
    background: "linear-gradient(135deg, #F3E8FF, #FFFFFF)",
    boxShadow: "0 14px 28px rgba(49,34,68,0.15)",
  },

  helpImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  helpTitle: {
    color: "#312244",
    margin: "0 0 8px 0",
    fontWeight: "900",
  },

  helpText: {
    color: "#6D597A",
    lineHeight: "1.6",
    margin: 0,
    fontSize: "14px",
  },

  helpLink: {
    margin: "14px 0 0 0",
    color: "#9B5DE5",
    fontSize: "13px",
    fontWeight: "900",
  },
};

export default Emergency;
