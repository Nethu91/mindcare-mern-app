import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import bgImage from "../assets/profile-bg.jpeg";

// Same wallpaper approach as the Assessment / Mood Tracker pages
function Background() {
  return (
    <>
      {/* blurred wallpaper (desktop sides) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(28px)",
          transform: "scale(1.15)",
        }}
      />

      {/* sharp wallpaper, phone-width column */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "100vh",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "480px",
            height: "100%",
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05), rgba(255,255,255,0.18)), url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            boxShadow: "0 0 40px rgba(38,48,90,0.18)",
          }}
        />
      </div>
    </>
  );
}

/* ============================================================
   AVATAR BUILDER (pure SVG 3D avatar, fully customizable)
   ============================================================ */

const SKINS = [
  { light: "#FFE6D2", mid: "#F8C9A4", dark: "#D9976B" },
  { light: "#FBD9B5", mid: "#EDB583", dark: "#C48556" },
  { light: "#E8B98A", mid: "#C98E5D", dark: "#9A6137" },
  { light: "#C98F63", mid: "#A5683F", dark: "#744322" },
  { light: "#9A6A47", mid: "#74472A", dark: "#4E2C16" },
];

const HAIR_COLORS = ["#2b1608", "#5a3a1e", "#a8672e", "#e0b45a", "#8b8f9b", "#c8553d"];

const HAIR_STYLES = [
  { id: "long", label: "Long" },
  { id: "short", label: "Short" },
  { id: "bun", label: "Bun" },
  { id: "curly", label: "Curly" },
];

const BG_COLORS = [
  "#B7DED6",
  "#A8DADC",
  "#EAD7F0",
  "#FFD6A5",
  "#FFC8DD",
  "#BDE0FE",
  "#FDFFB6",
  "#CAFFBF",
];

const DEFAULT_AVATAR = {
  avatarHair: "long",
  avatarHairColor: HAIR_COLORS[0],
  avatarSkin: 1,
  avatarGlasses: false,
  avatarBg: BG_COLORS[0],
};

let avUid = 0;
const useAvUid = () => {
  const ref = useRef(null);
  if (ref.current === null) ref.current = `av3d${++avUid}`;
  return ref.current;
};

function Avatar3D({ hair = "long", hairColor = "#2b1608", skin = 1, glasses = false, size = 100 }) {
  const u = useAvUid();
  const sk = SKINS[skin] || SKINS[1];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <radialGradient id={`${u}-skin`} cx="35%" cy="28%" r="85%">
          <stop offset="0%" stopColor={sk.light} />
          <stop offset="55%" stopColor={sk.mid} />
          <stop offset="100%" stopColor={sk.dark} />
        </radialGradient>
        <radialGradient id={`${u}-shirt`} cx="35%" cy="28%" r="85%">
          <stop offset="0%" stopColor="#9BE0D6" />
          <stop offset="55%" stopColor="#4DB6AC" />
          <stop offset="100%" stopColor="#2B7F77" />
        </radialGradient>
      </defs>

      {/* hair behind the head */}
      {hair === "long" && (
        <path
          d="M26 44 C22 8 78 8 74 44 C74 62 80 74 72 84 L28 84 C20 74 26 62 26 44 Z"
          fill={hairColor}
        />
      )}
      {hair === "curly" &&
        [
          [27, 40, 11],
          [32, 26, 11],
          [46, 17, 12],
          [62, 19, 12],
          [72, 30, 11],
          [74, 44, 10],
        ].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={hairColor} />)}
      {hair === "bun" && <circle cx="50" cy="9" r="10" fill={hairColor} />}

      {/* shoulders + neck */}
      <path d="M8 102 C8 76 28 68 50 68 C72 68 92 76 92 102 Z" fill={`url(#${u}-shirt)`} />
      <rect x="43" y="54" width="14" height="18" rx="6" fill={sk.mid} />
      <path d="M41 68 L50 80 L59 68 Z" fill={sk.mid} />

      {/* head */}
      <circle cx="50" cy="42" r="22" fill={`url(#${u}-skin)`} />

      {/* hair in front */}
      {hair === "long" ? (
        <path d="M27 40 C25 10 75 10 73 40 C65 28 35 28 27 40 Z" fill={hairColor} />
      ) : (
        <path
          d="M27 38 C25 8 75 8 73 38 C71 27 60 21 50 21 C40 21 29 27 27 38 Z"
          fill={hairColor}
        />
      )}

      {/* face */}
      <circle cx="42" cy="45" r="2.8" fill="#2b1608" />
      <circle cx="58" cy="45" r="2.8" fill="#2b1608" />
      <circle cx="41" cy="44" r="0.9" fill="#fff" />
      <circle cx="57" cy="44" r="0.9" fill="#fff" />
      <path d="M43 54 q7 6 14 0" fill="none" stroke="#B5523E" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="34" cy="51" r="4" fill="#FF8FA3" opacity="0.35" />
      <circle cx="66" cy="51" r="4" fill="#FF8FA3" opacity="0.35" />

      {glasses && (
        <g fill="rgba(255,255,255,0.28)" stroke="#2b2b3a" strokeWidth="2.4" strokeLinecap="round">
          <circle cx="42" cy="45" r="8.5" />
          <circle cx="58" cy="45" r="8.5" />
          <path d="M50.5 44 Q50 42.5 49.5 44" fill="none" />
          <path d="M33.5 44 L28 42 M66.5 44 L72 42" fill="none" />
        </g>
      )}

      <ellipse cx="40" cy="30" rx="6" ry="2.5" fill="#fff" opacity="0.4" transform="rotate(-25 40 30)" />
    </svg>
  );
}

// Shows the uploaded photo if there is one, otherwise the avatar
function ProfilePic({ profile, size = 130 }) {
  const radius = Math.round(size * 0.32);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: profile.avatarBg,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(38,48,90,0.18)",
      }}
    >
      {profile.photo ? (
        <img
          src={profile.photo}
          alt="Profile"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Avatar3D
          hair={profile.avatarHair}
          hairColor={profile.avatarHairColor}
          skin={profile.avatarSkin}
          glasses={profile.avatarGlasses}
          size={size * 0.92}
        />
      )}
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const savedUser = JSON.parse(localStorage.getItem("user"));

  const [profile, setProfile] = useState({
    name: savedUser?.name || "",
    email: savedUser?.email || "",
    phone: "",
    age: "",
    gender: "",
    city: "",
    role: "MindCare User",
    emergencyName: "",
    emergencyPhone: "",
    // customization (saved to the database)
    nickname: savedUser?.nickname || "",
    bio: "",
    photo: savedUser?.photo || "",
    ...DEFAULT_AVATAR,
    avatarHair: savedUser?.avatarHair || DEFAULT_AVATAR.avatarHair,
    avatarHairColor: savedUser?.avatarHairColor || DEFAULT_AVATAR.avatarHairColor,
    avatarSkin: savedUser?.avatarSkin ?? DEFAULT_AVATAR.avatarSkin,
    avatarGlasses: !!savedUser?.avatarGlasses,
    avatarBg: savedUser?.avatarBg || DEFAULT_AVATAR.avatarBg,
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedMood, setSelectedMood] = useState("Calm");

  // ===========================
  // Responsive (mobile) detection
  // Uses ResizeObserver on the actual
  // page container width instead of
  // window.innerWidth, so it works
  // correctly inside the locked-width
  // ".app-screen" phone frame too
  // (window stays wide on desktop even
  // though the visible frame is narrow).
  // ===========================
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setIsMobile(width <= 768);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ===========================
  // Load real profile from backend
  // ===========================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);

      const res = await API.get("/auth/profile"); // ⚠️ adjust path if your authRoutes are mounted elsewhere

      if (res?.data) {
        const d = res.data;
        setProfile((prev) => ({
          ...prev,
          name: d.name || "",
          email: d.email || "",
          phone: d.phone || "",
          age: d.age ?? "",
          gender: d.gender || "",
          city: d.city || "",
          emergencyName: d.emergencyName || "",
          emergencyPhone: d.emergencyPhone || "",
          nickname: d.nickname || "",
          bio: d.bio || "",
          photo: d.photo || "",
          avatarHair: d.avatarHair || DEFAULT_AVATAR.avatarHair,
          avatarHairColor: d.avatarHairColor || DEFAULT_AVATAR.avatarHairColor,
          avatarSkin: d.avatarSkin ?? DEFAULT_AVATAR.avatarSkin,
          avatarGlasses: !!d.avatarGlasses,
          avatarBg: d.avatarBg || DEFAULT_AVATAR.avatarBg,
        }));
      }
    } catch (err) {
      console.log(err);
      alert("Couldn't load your profile. Showing saved local data instead.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const wellnessStats = [
    {
      title: "Mood Entries",
      value: "18",
      icon: "😊",
      color: "#FFD166",
    },
    {
      title: "Assessments",
      value: "06",
      icon: "📝",
      color: "#B7DED6",
    },
    {
      title: "Meditations",
      value: "12",
      icon: "🧘‍♀️",
      color: "#A8DADC",
    },
    {
      title: "Appointments",
      value: "03",
      icon: "📅",
      color: "#FFAFCC",
    },
  ];

  const moods = ["Happy", "Calm", "Tired", "Anxious", "Focused"];

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const setField = (key, value) => setProfile((p) => ({ ...p, [key]: value }));

  // Resize the chosen photo to a small square so it is light enough to store in the DB
  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const SIZE = 200;
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);
        setField("photo", canvas.toDataURL("image/jpeg", 0.78));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  // ===========================
  // Save profile to backend
  // (personal info + customization together)
  // ===========================

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await API.put("/auth/profile", {
        name: profile.name,
        phone: profile.phone,
        city: profile.city,
        age: profile.age,
        gender: profile.gender,
        emergencyName: profile.emergencyName,
        emergencyPhone: profile.emergencyPhone,
        nickname: profile.nickname,
        bio: profile.bio,
        photo: profile.photo,
        avatarHair: profile.avatarHair,
        avatarHairColor: profile.avatarHairColor,
        avatarSkin: profile.avatarSkin,
        avatarGlasses: profile.avatarGlasses,
        avatarBg: profile.avatarBg,
      });

      // Keep the locally-stored user (used for the dashboard greeting
      // etc.) in sync with what was just saved.
      const updatedUser = {
        ...savedUser,
        name: res?.data?.name || profile.name,
        email: res?.data?.email || profile.email,
        nickname: profile.nickname,
        photo: profile.photo,
        avatarHair: profile.avatarHair,
        avatarHairColor: profile.avatarHairColor,
        avatarSkin: profile.avatarSkin,
        avatarGlasses: profile.avatarGlasses,
        avatarBg: profile.avatarBg,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setIsEditing(false);
      alert("Profile updated successfully 💜");
    } catch (err) {
      console.log(err);
      alert("Failed to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Opens the phone dialer with the emergency contact's number
  // (works on phones; on desktop it opens whichever calling app is set up)
  const callEmergency = () => {
    const number = (profile.emergencyPhone || "").replace(/[^\d+]/g, "");

    if (number.length < 7) {
      alert("Please add a valid emergency contact number first.");
      return;
    }

    const who = profile.emergencyName || "your emergency contact";
    if (window.confirm(`Call ${who} at ${profile.emergencyPhone}?`)) {
      window.location.href = `tel:${number}`;
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ ...styles.page, padding: isMobile ? "16px" : "35px" }}
    >
      <Background />

      <div style={styles.container}>
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

            <h1 style={{ ...styles.title, fontSize: isMobile ? "26px" : "42px" }}>
              My Profile
            </h1>
            <p style={styles.subtitle}>
              Manage your personal details, emergency contact, and MindCare
              journey.
            </p>
          </div>

          {!isMobile && (
            <div style={styles.headerBadge}>👤 Personal Wellness Space</div>
          )}
        </div>

        {loadingProfile && (
          <div style={styles.loadingPill}>⏳ Loading your profile...</div>
        )}

        <div
          style={{
            ...styles.mainGrid,
            gridTemplateColumns: isMobile ? "1fr" : "0.85fr 1.55fr",
            gap: isMobile ? "18px" : "25px",
          }}
        >
          <div style={{ ...styles.leftPanel, gap: isMobile ? "18px" : "25px" }}>
            <div style={{ ...styles.profileCard, padding: isMobile ? "20px" : "30px" }}>
              <div style={styles.avatarWrapper}>
                <ProfilePic profile={profile} size={130} />
                <div style={styles.onlineDot}></div>
              </div>

              <h2 style={styles.profileName}>{profile.name || "User"}</h2>
              {profile.nickname && (
                <p style={styles.nickname}>@{profile.nickname}</p>
              )}
              <p style={styles.profileRole}>{profile.role}</p>
              {profile.bio && <p style={styles.bioText}>{profile.bio}</p>}

              <div style={styles.moodBadge}>Current Mood: {selectedMood}</div>

              <div style={styles.quickInfoGrid}>
                <div style={styles.quickInfoBox}>
                  <span style={styles.quickLabel}>City</span>
                  <strong style={styles.quickValue}>
                    {profile.city || "-"}
                  </strong>
                </div>

                <div style={styles.quickInfoBox}>
                  <span style={styles.quickLabel}>Age</span>
                  <strong style={styles.quickValue}>
                    {profile.age || "-"}
                  </strong>
                </div>
              </div>

              <button
                style={styles.editButton}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel Edit" : "Edit Profile"}
              </button>

              <button style={styles.logoutButton} onClick={handleLogout}>
                Logout
              </button>
            </div>

            <div style={{ ...styles.moodCard, padding: isMobile ? "18px" : "25px" }}>
              <h3 style={styles.smallTitle}>How do you feel now?</h3>

              <div style={styles.moodGrid}>
                {moods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    style={{
                      ...styles.moodButton,
                      background:
                        selectedMood === mood
                          ? "linear-gradient(135deg, #3B4A8C, #4DB6AC)"
                          : "rgba(255,255,255,0.7)",
                      color: selectedMood === mood ? "#FFFFFF" : "#26305A",
                    }}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ ...styles.rightPanel, gap: isMobile ? "18px" : "25px" }}>
            {/* ===================== CUSTOMIZE PROFILE ===================== */}
            <div style={{ ...styles.formCard, padding: isMobile ? "18px" : "30px" }}>
              <div style={{ ...styles.cardHeader, flexDirection: "column", gap: "6px" }}>
                <h2 style={styles.sectionTitle}>Customize Your Profile</h2>
                <p style={styles.sectionSubText}>
                  Make it yours. Choose a photo or build your own avatar. Everything
                  is saved to your account.
                </p>
              </div>

              <div style={styles.previewRow}>
                <ProfilePic profile={profile} size={110} />

                <div style={styles.photoButtons}>
                  <label style={styles.uploadButton}>
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhoto}
                      style={{ display: "none" }}
                    />
                  </label>

                  {profile.photo && (
                    <button
                      type="button"
                      style={styles.ghostButton}
                      onClick={() => setField("photo", "")}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>

              <label style={styles.label}>Nickname</label>
              <input
                style={styles.input}
                value={profile.nickname}
                maxLength={30}
                placeholder="What should we call you?"
                onChange={(e) => setField("nickname", e.target.value)}
              />

              <label style={{ ...styles.label, marginTop: "14px" }}>About Me</label>
              <textarea
                style={{ ...styles.textArea, minHeight: "80px" }}
                value={profile.bio}
                maxLength={150}
                placeholder="A short line about you or what keeps you calm..."
                onChange={(e) => setField("bio", e.target.value)}
              ></textarea>

              <div style={{ opacity: profile.photo ? 0.45 : 1, transition: "0.3s" }}>
                <div style={styles.optionTitle}>
                  Avatar Builder
                  {profile.photo && (
                    <span style={styles.hint}> (remove your photo to use the avatar)</span>
                  )}
                </div>

                <div style={styles.optionLabel}>Hair Style</div>
                <div style={styles.chipRow}>
                  {HAIR_STYLES.map((h) => (
                    <button
                      type="button"
                      key={h.id}
                      onClick={() => setField("avatarHair", h.id)}
                      style={{
                        ...styles.chip,
                        background:
                          profile.avatarHair === h.id
                            ? "linear-gradient(135deg, #3B4A8C, #4DB6AC)"
                            : "rgba(255,255,255,0.75)",
                        color: profile.avatarHair === h.id ? "#fff" : "#26305A",
                      }}
                    >
                      {h.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setField("avatarGlasses", !profile.avatarGlasses)}
                    style={{
                      ...styles.chip,
                      background: profile.avatarGlasses
                        ? "linear-gradient(135deg, #3B4A8C, #4DB6AC)"
                        : "rgba(255,255,255,0.75)",
                      color: profile.avatarGlasses ? "#fff" : "#26305A",
                    }}
                  >
                    Glasses
                  </button>
                </div>

                <div style={styles.optionLabel}>Hair Colour</div>
                <div style={styles.chipRow}>
                  {HAIR_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      aria-label={`Hair colour ${c}`}
                      onClick={() => setField("avatarHairColor", c)}
                      style={{
                        ...styles.swatch,
                        background: c,
                        border:
                          profile.avatarHairColor === c
                            ? "3px solid #3B4A8C"
                            : "3px solid rgba(255,255,255,0.9)",
                      }}
                    />
                  ))}
                </div>

                <div style={styles.optionLabel}>Skin Tone</div>
                <div style={styles.chipRow}>
                  {SKINS.map((s, i) => (
                    <button
                      type="button"
                      key={i}
                      aria-label={`Skin tone ${i + 1}`}
                      onClick={() => setField("avatarSkin", i)}
                      style={{
                        ...styles.swatch,
                        background: `radial-gradient(circle at 35% 30%, ${s.light}, ${s.mid} 60%, ${s.dark})`,
                        border:
                          profile.avatarSkin === i
                            ? "3px solid #3B4A8C"
                            : "3px solid rgba(255,255,255,0.9)",
                      }}
                    />
                  ))}
                </div>

                <div style={styles.optionLabel}>Background</div>
                <div style={styles.chipRow}>
                  {BG_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      aria-label={`Background ${c}`}
                      onClick={() => setField("avatarBg", c)}
                      style={{
                        ...styles.swatch,
                        background: c,
                        border:
                          profile.avatarBg === c
                            ? "3px solid #3B4A8C"
                            : "3px solid rgba(255,255,255,0.9)",
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                style={{ ...styles.saveButton, opacity: saving ? 0.7 : 1 }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Customization"}
              </button>
            </div>

            {/* ===================== PERSONAL INFORMATION ===================== */}
            <div style={{ ...styles.formCard, padding: isMobile ? "18px" : "30px" }}>
              <div
                style={{
                  ...styles.cardHeader,
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: isMobile ? "flex-start" : "center",
                  gap: isMobile ? "12px" : "16px",
                }}
              >
                <div>
                  <h2 style={styles.sectionTitle}>Personal Information</h2>
                  <p style={styles.sectionSubText}>
                    Keep your profile details updated for better support.
                  </p>
                </div>

                {!isMobile && <div style={styles.cardIcon}>🪪</div>}
              </div>

              <div
                style={{
                  ...styles.formGrid,
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                }}
              >
                <div>
                  <label style={styles.label}>Full Name</label>
                  <input
                    style={styles.input}
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label style={styles.label}>Email</label>
                  <input
                    style={styles.input}
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled
                    title="Email can't be changed here"
                  />
                </div>

                <div>
                  <label style={styles.label}>Phone</label>
                  <input
                    style={styles.input}
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label style={styles.label}>City</label>
                  <input
                    style={styles.input}
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label style={styles.label}>Age</label>
                  <input
                    style={styles.input}
                    name="age"
                    value={profile.age}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label style={styles.label}>Gender</label>
                  <input
                    style={styles.input}
                    name="gender"
                    value={profile.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <button
                  style={{ ...styles.saveButton, opacity: saving ? 0.7 : 1 }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>

            <div
              style={{
                ...styles.statsGrid,
                gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                gap: isMobile ? "12px" : "16px",
              }}
            >
              {wellnessStats.map((stat) => (
                <div
                  key={stat.title}
                  style={{ ...styles.statCard, padding: isMobile ? "14px" : "18px" }}
                >
                  <div
                    style={{
                      ...styles.statIcon,
                      backgroundColor: stat.color,
                    }}
                  >
                    {stat.icon}
                  </div>

                  <div>
                    <h3 style={styles.statValue}>{stat.value}</h3>
                    <p style={styles.statText}>{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ===================== EMERGENCY CONTACT ===================== */}
            <div style={{ ...styles.supportCard, padding: isMobile ? "18px" : "30px" }}>
              <div
                style={{
                  ...styles.cardHeader,
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: isMobile ? "flex-start" : "center",
                  gap: isMobile ? "12px" : "16px",
                }}
              >
                <div>
                  <h2 style={styles.sectionTitle}>Emergency Contact</h2>
                  <p style={styles.sectionSubText}>
                    Trusted person for urgent support.
                  </p>
                </div>
                {!isMobile && <div style={styles.cardIcon}>🚨</div>}
              </div>

              <label style={styles.label}>Contact Name</label>
              <input
                style={styles.input}
                name="emergencyName"
                value={profile.emergencyName}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <label style={{ ...styles.label, marginTop: "14px" }}>Contact Phone</label>
              <input
                style={styles.input}
                name="emergencyPhone"
                type="tel"
                placeholder="+94 77 123 4567"
                value={profile.emergencyPhone}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <button
                style={{
                  ...styles.callButton,
                  opacity: profile.emergencyPhone ? 1 : 0.5,
                  cursor: profile.emergencyPhone ? "pointer" : "not-allowed",
                }}
                onClick={callEmergency}
                disabled={!profile.emergencyPhone}
              >
                Call Emergency Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shared glass effect for all cards
const glass = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.78)",
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#EFEBDD",
    fontFamily: "Arial, sans-serif",
    position: "relative",
    overflowX: "hidden",
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
    border: "none",
    padding: "10px 16px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.65)",
    color: "#4F6272",
    fontWeight: "800",
    cursor: "pointer",
    marginBottom: "12px",
    boxShadow: "0 10px 24px rgba(38,48,90,0.1)",
  },

  title: {
    color: "#26305A",
    margin: "0 0 7px 0",
    fontWeight: "900",
  },

  subtitle: {
    color: "#4F6272",
    fontSize: "16px",
    margin: 0,
    lineHeight: "1.5",
  },

  headerBadge: {
    padding: "13px 22px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.55)",
    boxShadow: "0 12px 25px rgba(38,48,90,0.12)",
    color: "#4A4E69",
    fontWeight: "800",
  },

  loadingPill: {
    background: "#F1F6F5",
    borderRadius: "18px",
    padding: "14px",
    textAlign: "center",
    marginBottom: "20px",
    color: "#3B4A8C",
    fontWeight: "700",
  },

  mainGrid: {
    display: "grid",
    marginBottom: "25px",
  },

  leftPanel: {
    display: "grid",
    alignContent: "start",
  },

  rightPanel: {
    display: "grid",
  },

  profileCard: {
    ...glass,
    borderRadius: "34px",
    boxShadow: "0 25px 60px rgba(38,48,90,0.16)",
    textAlign: "center",
  },

  avatarWrapper: {
    width: "130px",
    height: "130px",
    margin: "0 auto 18px auto",
    position: "relative",
  },

  onlineDot: {
    position: "absolute",
    right: "7px",
    bottom: "7px",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "#70D6A4",
    border: "4px solid #FFFFFF",
  },

  profileName: {
    color: "#26305A",
    margin: "0 0 7px 0",
    fontSize: "26px",
    fontWeight: "900",
  },

  nickname: {
    color: "#3B4A8C",
    margin: "0 0 6px 0",
    fontWeight: "800",
    fontSize: "14px",
  },

  profileRole: {
    color: "#4F6272",
    margin: "0 0 14px 0",
    fontWeight: "800",
  },

  bioText: {
    color: "#4F6272",
    margin: "0 0 14px 0",
    fontSize: "14px",
    lineHeight: "1.5",
    fontStyle: "italic",
    wordBreak: "break-word",
  },

  moodBadge: {
    display: "inline-block",
    padding: "9px 16px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.75)",
    color: "#3B4A8C",
    fontWeight: "900",
    marginBottom: "18px",
  },

  quickInfoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "18px",
  },

  quickInfoBox: {
    background: "rgba(255,255,255,0.7)",
    borderRadius: "20px",
    padding: "14px",
  },

  quickLabel: {
    display: "block",
    color: "#7A8794",
    fontSize: "12px",
    fontWeight: "800",
    marginBottom: "5px",
  },

  quickValue: {
    color: "#26305A",
    fontSize: "15px",
  },

  editButton: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "23px",
    background: "linear-gradient(135deg, #3B4A8C, #4DB6AC)",
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: "900",
    cursor: "pointer",
    marginBottom: "12px",
    boxShadow: "0 18px 35px rgba(59,74,140,0.3)",
  },

  logoutButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "22px",
    background: "rgba(255,143,171,0.25)",
    color: "#B83256",
    fontSize: "15px",
    fontWeight: "900",
    cursor: "pointer",
  },

  moodCard: {
    ...glass,
    borderRadius: "34px",
    boxShadow: "0 20px 45px rgba(38,48,90,0.13)",
  },

  smallTitle: {
    color: "#26305A",
    margin: "0 0 16px 0",
    fontSize: "21px",
    fontWeight: "900",
  },

  moodGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  moodButton: {
    border: "none",
    padding: "11px 15px",
    borderRadius: "18px",
    fontWeight: "900",
    cursor: "pointer",
  },

  formCard: {
    ...glass,
    borderRadius: "34px",
    boxShadow: "0 25px 60px rgba(38,48,90,0.16)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "22px",
  },

  sectionTitle: {
    color: "#26305A",
    margin: "0 0 7px 0",
    fontSize: "24px",
    fontWeight: "900",
  },

  sectionSubText: {
    color: "#4F6272",
    margin: 0,
    lineHeight: "1.5",
    fontSize: "14px",
  },

  cardIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    background: "linear-gradient(135deg, #B7DED6, #EAD7F0)",
    boxShadow: "0 15px 30px rgba(38,48,90,0.15)",
    flexShrink: 0,
  },

  previewRow: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  photoButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  uploadButton: {
    display: "inline-block",
    textAlign: "center",
    padding: "12px 18px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #3B4A8C, #4DB6AC)",
    color: "#fff",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(59,74,140,0.25)",
  },

  ghostButton: {
    border: "none",
    padding: "11px 18px",
    borderRadius: "18px",
    background: "rgba(255,143,171,0.25)",
    color: "#B83256",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "pointer",
  },

  optionTitle: {
    color: "#26305A",
    fontWeight: "900",
    fontSize: "16px",
    margin: "20px 0 4px",
  },

  hint: {
    color: "#7A8794",
    fontWeight: "600",
    fontSize: "12px",
  },

  optionLabel: {
    color: "#4F6272",
    fontWeight: "800",
    fontSize: "13px",
    margin: "14px 0 8px",
  },

  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center",
  },

  chip: {
    border: "none",
    padding: "10px 16px",
    borderRadius: "16px",
    fontWeight: "800",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 8px 16px rgba(38,48,90,0.09)",
  },

  swatch: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    cursor: "pointer",
    padding: 0,
    boxShadow: "0 6px 12px rgba(38,48,90,0.15)",
    boxSizing: "border-box",
  },

  formGrid: {
    display: "grid",
    gap: "16px",
  },

  label: {
    display: "block",
    color: "#26305A",
    fontWeight: "800",
    margin: "0 0 8px 0",
  },

  input: {
    width: "100%",
    padding: "15px",
    border: "none",
    outline: "none",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.72)",
    color: "#26305A",
    fontSize: "15px",
    boxShadow: "inset 0 0 16px rgba(38,48,90,0.07)",
    boxSizing: "border-box",
  },

  textArea: {
    width: "100%",
    minHeight: "90px",
    resize: "none",
    padding: "16px",
    border: "none",
    outline: "none",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.72)",
    color: "#26305A",
    fontSize: "15px",
    boxShadow: "inset 0 0 16px rgba(38,48,90,0.07)",
    boxSizing: "border-box",
    marginBottom: "14px",
    fontFamily: "inherit",
  },

  saveButton: {
    width: "100%",
    marginTop: "20px",
    padding: "16px",
    border: "none",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #70D6A4, #A8E6CF)",
    color: "#1B5E40",
    fontSize: "16px",
    fontWeight: "900",
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid",
  },

  statCard: {
    ...glass,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderRadius: "26px",
    boxShadow: "0 18px 38px rgba(38,48,90,0.12)",
  },

  statIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "19px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    flexShrink: 0,
  },

  statValue: {
    color: "#26305A",
    margin: "0 0 4px 0",
    fontSize: "24px",
    fontWeight: "900",
  },

  statText: {
    color: "#4F6272",
    margin: 0,
    fontSize: "12px",
    fontWeight: "800",
  },

  supportCard: {
    ...glass,
    borderRadius: "34px",
    boxShadow: "0 25px 60px rgba(38,48,90,0.16)",
  },

  callButton: {
    width: "100%",
    marginTop: "16px",
    padding: "15px",
    border: "none",
    borderRadius: "23px",
    background: "linear-gradient(135deg, #E63946, #FF758F)",
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: "900",
    cursor: "pointer",
  },
};

export default Profile;
