// Runnable check for the conflict engine: `node src/lib/schedule.check.js`
import assert from 'node:assert/strict'
import { findConflict, showEnd, movieStatus, buildLayout, capacity } from './schedule.js'

const at = (h, m = 0) => new Date(2030, 0, 1, h, m).toISOString()
const dune = { duration: 166 } // 2h46 -> blocks screen until 12:46 + 30 buffer when started 10:00
const shows = [{ id: 1, screenId: 7, start: at(10), movie: dune, status: 'SCHEDULED' }]
const c = (o) => findConflict(shows, { screenId: 7, duration: 120, ...o })

assert.equal(showEnd(at(10), 166).getHours(), 13) // 10:00 + 166 + 30 = 13:16
assert.ok(c({ start: at(13, 0) }), 'starts inside the cleaning buffer -> conflict')
assert.ok(c({ start: at(9, 0) }), 'new show runs into the existing one -> conflict')
assert.equal(c({ start: at(13, 16) }), undefined, 'starts exactly when the buffer ends -> ok')
assert.equal(c({ start: at(13, 0), screenId: 8 }), undefined, 'other screen -> ok')
assert.equal(c({ start: at(11), ignoreId: 1 }), undefined, 'editing the show itself -> ok')
shows[0].status = 'CANCELLED'
assert.equal(c({ start: at(11) }), undefined, 'cancelled shows free the screen')

assert.equal(movieStatus({ release_date: '2999-01-01' }, null), 'Upcoming')
assert.equal(movieStatus({ release_date: '2000-01-01' }, null), 'Now Showing')
assert.equal(movieStatus({ release_date: '2000-01-01' }, { archived: true }), 'Archived')

const screen = { rows: buildLayout(4, 10) }
assert.equal(capacity(screen), 4 * 9, 'one aisle gap per row')
console.log('schedule.check ok')
