"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./adminNavbar.module.css";
import { useEffect, useState } from "react";
import NotificationBell from "../../../components/notifications/NotificationBell";

export default function AdminNavbar({ onToggleSidebar }) {

  const [profilePic, setProfilePic] = useState("/profile.png");

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const res = await fetch("/api/auth/profilePic");
        const data = await res.json();
        if (res.ok && data.profileImage) {
          setProfilePic(data.profileImage);
        }
      } catch (err) {
        console.error("Error fetching profile pic:", err);
      }
    };
    fetchProfilePic();
  }, []);

  return (
    <nav className={styles.navbar}>

      {/* ── Logo ── */}
      <div className={styles.logo}>
        <Link href="/adminPanel" className={styles.logoLink}>
          <Image
            src="/logo2.png"
            alt="ASSETRA"
            width={46}
            height={46}
            priority
            className={styles.logoImg}
          />
        </Link>
      </div>

      {/* ── Right Side Actions ── */}
      <div className={styles.desktopActions}>

        <NotificationBell buttonClassName={styles.notificationBtn} />

        {/* Profile Link */}
        <Link href="/adminPanel/profile">
          <div className={styles.profileLink}>
            <Image
              src={profilePic || "/profile.png"}
              alt="Profile"
              width={40}
              height={40}
              className={styles.profileImg}
              unoptimized
            />
          </div>
        </Link>

        {/* Hamburger — mobile only */}
        <button
          className={styles.hamburgerBtn}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
        </button>

      </div>
    </nav>
  );
}
