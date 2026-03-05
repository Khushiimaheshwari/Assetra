"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/navbar.module.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className={styles.navbar}>
      {/* Logo */}
      <div className={styles.logo}>
        <Link href="/">
          <Image
            src="/logo2.jpeg"
            alt="Assetra Logo"
            width={120}
            height={40}
            priority
            style={{ width: "auto", height: "40px" }}
          />
          <span className={styles.logoText}>ASSETRA</span>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <ul className={styles.desktopNavLinks}>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/#problems">Challenges</Link></li>
        <li><Link href="/#solutions">Modules</Link></li>
        <li><Link href="/#contact">Contact</Link></li>
      </ul>

      {/* Desktop Right Side: Login */}
      <div className={styles.desktopActions}>
        <Link href="/login">
          <button className={styles.loginBtn}>Login</button>
        </Link>
      </div>

      {/* Mobile Hamburger Button */}
      <button
        className={`${styles.mobileMenuBtn} ${menuOpen ? styles.active : ""}`}
        onClick={toggleMenu}
      >
        <span className={styles.hamburger}></span>
        <span className={styles.hamburger}></span>
        <span className={styles.hamburger}></span>
      </button>

      {/* Mobile Menu */}
      <ul className={`${styles.mobileNavLinks} ${menuOpen ? styles.active : ""}`}>
        <li><Link href="/"           onClick={() => setMenuOpen(false)}>Home</Link></li>
        <li><Link href="/#problems"  onClick={() => setMenuOpen(false)}>Challenges</Link></li>
        <li><Link href="/#solutions" onClick={() => setMenuOpen(false)}>Modules</Link></li>
        <li><Link href="/#contact"   onClick={() => setMenuOpen(false)}>Contact</Link></li>
        <li><Link href="/login"      onClick={() => setMenuOpen(false)}>Login / Signup</Link></li>
      </ul>

      {/* Mobile Overlay */}
      {menuOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </nav>
  );
}