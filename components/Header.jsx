import React, { useState } from 'react';
import './Header.css'; // Assuming you have some styling for the header

function Header() {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="header">
            <div className="logo">
                <h1>Your Logo</h1>
            </div>
            <nav className={`nav ${isMobileMenuOpen ? 'open' : ''}`}>  
                <ul>
                    <li><a href="#">Home</a></li>
                    <li><a href="#">About</a></li>
                    <li><a href="#">Services</a></li>
                    <li><a href="#">Contact</a></li>
                </ul>
            </nav>
            <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
                {/* Add icon for mobile menu */}
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </div>
        </header>
    );
}

export default Header;