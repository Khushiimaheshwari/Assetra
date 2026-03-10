"use client";

import Link from "next/link";
import styles from "./profile.module.css";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/app/lab_technicianPanel/components/Lab_Technician_Sidebar.JS";

const Icons = {
  User:     () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Mail:     () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  Phone:    () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.74a16 16 0 0 0 6.29 6.29l.95-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  MapPin:   () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Calendar: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Clock:    () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Edit:     () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Logout:   () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Profile:  () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Shield:   () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Id:       () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
};

function SkeletonLoader() {
  return (
    <div style={{
      width:"calc(100% - 255px)",marginLeft:"255px",minHeight:"100vh",
      background:"linear-gradient(145deg,#EBF4F6 0%,#c8e4ea 40%,#D1F8EF 100%)",
      padding:"2.5rem 2rem",display:"flex",flexDirection:"column",
      alignItems:"center",boxSizing:"border-box",
    }}>
      {["60%","100%","100%"].map((w,i)=>(
        <div key={i} style={{
          maxWidth:"820px",width:w,borderRadius:"16px",marginBottom:"1.5rem",
          height:i===0?"28px":i===1?"180px":"340px",
          background:"linear-gradient(90deg,#D1F8EF 25%,#EBF4F6 50%,#D1F8EF 75%)",
          backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite",
        }}/>
      ))}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className={styles.infoItem}>
      <div className={styles.infoItemIcon}><Icon /></div>
      <div className={styles.infoItemContent}>
        <span className={styles.infoLabel}>{label}</span>
        <span className={styles.infoValue}>{value || "—"}</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: session }     = useSession();
  const router                = useRouter();

  const handleLogout = async () => {
    try {
      if (session) { await signOut({ redirect: false }); }
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) { console.error("Logout failed:", err); }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/profile", { method:"GET", credentials:"include" });
        if (res.ok) { const d = await res.json(); setUser(d.user); }
        else window.location.href = "/login";
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <><AdminSidebar /><SkeletonLoader /></>;
  if (!user)   return <><AdminSidebar /><div style={{marginLeft:"255px",padding:"3rem",color:"#176B87"}}>No user data found.</div></>;

  const initials   = (user.Name||"?").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  const memberDays = Math.floor((new Date()-new Date(user.createdAt))/86400000);

  return (
    <>
      <AdminSidebar />
      <div className={styles.profileContainer}>

        {/* Page Title */}
        <div className={styles.pageTitle}>
          <div className={styles.pageTitleIcon}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className={styles.pageTitleText}>
            <h1>My Profile</h1>
            <p>View and manage your account information</p>
          </div>
        </div>

        {/* Header Card */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrapper}>
            {user.ProfileImage ? (
              <img src={user.ProfileImage} alt="Profile" width={110} height={110} className={styles.avatar}/>
            ) : (
              <div className={styles.avatar} style={{
                display:"flex",alignItems:"center",justifyContent:"center",
                background:"linear-gradient(135deg,#088395,#176B87)",
                fontSize:"2rem",fontWeight:"800",color:"white",
                width:"110px",height:"110px",
              }}>{initials}</div>
            )}
            <div className={styles.avatarBadge}/>
          </div>

          <div className={styles.userInfo}>
            <h1 className={styles.userName}>{user.Name}</h1>
            <p className={styles.userEmail}>{user.Email}</p>
            <div className={styles.userRoleBadge}>
              <span className={styles.userRoleDot}/>
              {user.Role || "Active Member"}
            </div>
          </div>

          <div className={styles.headerStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{memberDays}</span>
              <span className={styles.statLabel}>Days Active</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{new Date(user.createdAt).getFullYear()}</span>
              <span className={styles.statLabel}>Joined</span>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className={styles.singleCardContainer}>
          <div className={styles.profileCard}>
            <h3 className={styles.cardTitle}>
              <div className={styles.cardTitleIcon}><Icons.Profile/></div>
              Profile Information
            </h3>
            <div className={styles.infoGrid}>
              <InfoItem icon={Icons.User}     label="Full Name"    value={user.Name}/>
              <InfoItem icon={Icons.Mail}     label="Email"        value={user.Email}/>
              <InfoItem icon={Icons.Phone}    label="Phone"        value={user.PhoneNumber}/>
              <InfoItem icon={Icons.MapPin}   label="Location"     value={user.Location}/>
              <InfoItem icon={Icons.Id}       label="Role"         value={user.Role}/>
              <InfoItem icon={Icons.Shield}   label="Department"   value={user.Department}/>
              <InfoItem icon={Icons.Calendar} label="Member Since" value={new Date(user.createdAt).toDateString()}/>
              <InfoItem icon={Icons.Clock}    label="Last Login"   value="2 hours ago"/>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className={styles.actionButtons}>
          <Link href="/edit-profile" className={styles.editBtn}>
            <Icons.Edit/> Edit Profile
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <Icons.Logout/> Logout
          </button>
        </div>

      </div>
    </>
  );
}