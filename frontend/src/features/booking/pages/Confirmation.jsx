import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import './Confirmation.css';

export default function Confirmation() {
  const { id } = useParams();
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(`ticket-${id || 'BK123456'}`, { width: 120, margin: 1 })
      .then(setQrUrl)
      .catch(console.error);
  }, [id]);

  return (
    <div className="confirmation-container">
      <div className="success-header">
        <div className="check-circle">✓</div>
        <h1 className="success-title">Booking Confirmed</h1>
      </div>
      
      <div className="ticket-wrapper">
        <div className="ticket-card glass-panel">
          <div className="ticket-top">
            <h2 className="ticket-movie">Interstellar</h2>
            <p className="ticket-meta">Sun, 24 Oct • 06:15 PM</p>
            <p className="ticket-meta">PVR: Nexus Mall • IMAX 2D</p>
            <p className="ticket-meta">Seats: E5, E6</p>
          </div>
          
          <div className="ticket-divider"></div>
          
          <div className="ticket-bottom">
            <div className="qr-container">
              {qrUrl ? (
                <img src={qrUrl} alt="Ticket QR" style={{ width: 120, height: 120, borderRadius: 8 }} />
              ) : (
                <div style={{ width: 120, height: 120 }} />
              )}
            </div>
            <p className="booking-id">ID: {id || 'BK123456'}</p>
          </div>
        </div>
      </div>
      
      <div className="action-buttons">
        <button className="btn-outline">Download Ticket</button>
        <Link to="/" className="btn-filled">Back to Home</Link>
      </div>
    </div>
  );
}