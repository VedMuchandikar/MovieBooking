import React from 'react'
import { Sparkles, Award } from 'lucide-react'
import { seatId } from '@/lib/schedule'

/**
 * Vintage Theatre Armchair SVG Component
 * Faithfully matches the classic Scandinavian cinema armchair in the client-side UI.
 */
export function ArmchairSeatGraphic({ seatNumber }) {
  return (
    <svg viewBox="0 0 32 30" className="armchair-svg-icon" aria-hidden="true">
      {/* Rounded top backrest cushion */}
      <rect className="seat-backrest" x="5" y="2" width="22" height="14" rx="3.5" />
      {/* Main seat cushion */}
      <rect className="seat-cushion" x="6" y="13" width="20" height="14" rx="2.5" />
      {/* Left armrest wing */}
      <rect className="seat-armrest" x="1.5" y="9" width="4.5" height="18" rx="2" />
      {/* Right armrest wing */}
      <rect className="seat-armrest" x="26" y="9" width="4.5" height="18" rx="2" />
      {/* Center seat number */}
      <text className="seat-number-text" x="16" y="23" textAnchor="middle">
        {seatNumber}
      </text>
    </svg>
  )
}

function getTierIcon(tier) {
  switch (tier?.toLowerCase()) {
    case 'recliner':
      return <Sparkles size={14} className="tier-icon icon-amber" />
    case 'premium':
      return <Award size={14} className="tier-icon icon-purple" />
    default:
      return null
  }
}

function getTierLabel(tier) {
  switch (tier?.toLowerCase()) {
    case 'recliner':
      return 'VIP Recliner Experience'
    case 'premium':
      return 'Prime Executive Club'
    default:
      return 'Classic Normal'
  }
}

/**
 * 2D Cinema Seat Map Component identical to Client Side
 */
export function SeatGrid({
  rows = [],
  selectedSeats = [],
  bookedSeats = [],
  blockedSeats = [],
  pricing = {},
  onSeatClick,
  cellKind,
  titleFor,
  promptText,
  showPromptBanner = true,
  showLegend = true,
}) {
  const selectedSet = new Set(Array.isArray(selectedSeats) ? selectedSeats : Array.from(selectedSeats))
  const bookedSet = new Set(Array.isArray(bookedSeats) ? bookedSeats : Array.from(bookedSeats))
  const blockedSet = new Set(Array.isArray(blockedSeats) ? blockedSeats : Array.from(blockedSeats))

  // Compute live seat metrics
  const allSeats = rows.flatMap((r) => r.seats || [])
  const totalCount = allSeats.filter((s) => s.state !== 'aisle').length
  const selectedCount = selectedSet.size
  const bookedCount = allSeats.filter((s) => {
    const sId = seatId(rows.find(r => r.seats.includes(s)) || { label: '' }, s)
    return bookedSet.has(sId) || s.status === 'booked'
  }).length
  const blockedCount = allSeats.filter((s) => {
    const sId = seatId(rows.find(r => r.seats.includes(s)) || { label: '' }, s)
    return blockedSet.has(sId)
  }).length
  const availableCount = Math.max(0, totalCount - bookedCount - blockedCount - selectedCount)

  return (
    <div className="seat-map-2d-container">
      {/* Curved Screen Indicator */}
      <div className="cinema-screen-2d-wrap">
        <div className="screen-curve-beam" />
        <div className="screen-curved-bar">
          <span className="screen-label">ALL EYES THIS WAY • CINEMA SCREEN</span>
        </div>
      </div>

      {/* Club Amphitheater Arc Seating Viewport */}
      <div className="amphitheater-arc-wrapper">
        {rows.map((rowObj, rIndex) => {
          const rowLabel = rowObj.label || rowObj.row
          const isTierHeader = rIndex === 0 || rows[rIndex - 1].tier !== rowObj.tier
          const seatsCount = rowObj.seats?.length || 0
          const centerIndex = (seatsCount - 1) / 2

          return (
            <React.Fragment key={rowLabel}>
              {isTierHeader && (
                <div className={`tier-section-divider tier-${rowObj.tier}`}>
                  <div className="tier-divider-line" />
                  <div className="tier-divider-badge">
                    {getTierIcon(rowObj.tier)}
                    <span className="tier-name">{getTierLabel(rowObj.tier)}</span>
                    {pricing?.[rowObj.tier] ? (
                      <span className="tier-price-tag">₹{pricing[rowObj.tier]}</span>
                    ) : null}
                  </div>
                  <div className="tier-divider-line" />
                </div>
              )}

              <div className="seat-row-arc">
                {/* Left Row Letter */}
                <div className="row-letter-badge">{rowLabel}</div>

                {/* Curved Seats in Row */}
                <div className="seats-in-arc-row">
                  {rowObj.seats.map((seat, sIndex) => {
                    if (seat.state === 'aisle') {
                      return <span key={seat.n ?? sIndex} className="size-8" aria-hidden />
                    }

                    const sName = seatId(rowObj, seat)
                    const isSelected = selectedSet.has(sName)
                    const isBooked = bookedSet.has(sName) || seat.status === 'booked'
                    const isBlocked = blockedSet.has(sName) || seat.status === 'blocked'
                    const isDisabled = seat.state === 'disabled' || seat.state === 'broken'

                    let seatStateClass = 'available'
                    if (cellKind) {
                      seatStateClass = cellKind(rowObj, seat)
                    } else if (isSelected) {
                      seatStateClass = 'selected'
                    } else if (isBlocked) {
                      seatStateClass = 'blocked'
                    } else if (isBooked) {
                      seatStateClass = 'booked'
                    } else if (isDisabled) {
                      seatStateClass = 'disabled'
                    }

                    // Gentle amphitheater curvature geometry
                    const normalizedOffset = centerIndex > 0 ? (sIndex - centerIndex) / centerIndex : 0
                    const curveY = Math.pow(normalizedOffset, 2) * 8
                    const curveRot = normalizedOffset * 5

                    const defaultTitle = `${sName} · ${rowObj.tier ? rowObj.tier.toUpperCase() : ''} (${
                      isSelected
                        ? 'Selected'
                        : isBlocked
                        ? 'Admin Hold'
                        : isBooked
                        ? 'Booked'
                        : isDisabled
                        ? 'Disabled'
                        : 'Available'
                    })`

                    return (
                      <button
                        key={seat.n ?? sIndex}
                        type="button"
                        disabled={isBooked || isDisabled}
                        className={`armchair-seat-btn tier-${rowObj.tier} state-${seatStateClass}`}
                        style={{
                          transform: `translateY(${curveY}px) rotate(${curveRot}deg)`,
                        }}
                        onClick={() => onSeatClick?.(rowObj, seat, seatStateClass)}
                        title={titleFor?.(rowObj, seat, seatStateClass) ?? defaultTitle}
                        aria-label={`Seat ${sName} ${seatStateClass}`}
                      >
                        <ArmchairSeatGraphic seatNumber={seat.n ?? seat.number} />
                      </button>
                    )
                  })}
                </div>

                {/* Right Row Letter */}
                <div className="row-letter-badge">{rowLabel}</div>
              </div>
            </React.Fragment>
          )
        })}
      </div>

      {/* Status Alert Prompt Banner */}
      {showPromptBanner && (
        <div className="seat-status-prompt-banner">
          <span>
            {selectedCount > 0
              ? `${selectedCount} seat${selectedCount > 1 ? 's' : ''} selected • Click on a seat to select or change`
              : promptText || 'Click any seat to inspect or select'}
          </span>
        </div>
      )}

      {/* Tally Legend Strip at Bottom */}
      {showLegend && (
        <div className="seat-matrix-legend-row">
          <div className="legend-chip-box available">
            <span className="legend-count-badge">{availableCount}</span>
            <span>Available</span>
          </div>
          <div className="legend-chip-box selected">
            <span className="legend-count-badge">{selectedCount}</span>
            <span>Selected</span>
          </div>
          <div className="legend-chip-box booked">
            <span className="legend-count-badge">{bookedCount}</span>
            <span>Booked</span>
          </div>
          {blockedCount > 0 && (
            <div className="legend-chip-box blocked">
              <span className="legend-count-badge">{blockedCount}</span>
              <span>Admin Hold</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function SeatLegend({ items }) {
  return (
    <div className="seat-matrix-legend-row">
      {items.map(([kind, label]) => (
        <div key={kind} className={`legend-chip-box ${kind}`}>
          <span className="legend-count-badge">•</span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
