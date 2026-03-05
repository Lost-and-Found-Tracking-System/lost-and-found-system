/**
 * @module scripts/seed-zones
 * @description Seed script — inserts Amrita campus zones into MongoDB.
 * Skips zones that already exist (matched by zoneName).
 *
 * Run with:
 *   npx vite-node src/scripts/seed-zones.ts
 */

import { connectToDatabase } from '../config/database.js';
import { CampusZoneModel, UserModel } from '../models/index.js';

// Helper: build a rectangular GeoJSON Polygon from centre + half-widths (degrees)
function rect(
    lon: number, lat: number,
    dLon: number, dLat: number
): { type: 'Polygon'; coordinates: number[][][] } {
    return {
        type: 'Polygon',
        coordinates: [[
            [lon - dLon, lat - dLat],
            [lon + dLon, lat - dLat],
            [lon + dLon, lat + dLat],
            [lon - dLon, lat + dLat],
            [lon - dLon, lat - dLat],   // close the ring
        ]],
    }
}

// Amrita Vishwa Vidyapeetham, Coimbatore — approximate coordinates per zone
const ZONES = [
    {
        zoneName: 'Main Academic Block',
        geoBoundary: rect(76.9245, 10.9035, 0.0015, 0.0010),
    },
    {
        zoneName: 'Library & Learning Centre',
        geoBoundary: rect(76.9260, 10.9042, 0.0010, 0.0008),
    },
    {
        zoneName: 'Student Hostels (North)',
        geoBoundary: rect(76.9230, 10.9055, 0.0018, 0.0012),
    },
    {
        zoneName: 'Cafeteria & Food Court',
        geoBoundary: rect(76.9255, 10.9020, 0.0010, 0.0008),
    },
    {
        zoneName: 'Sports Complex & Ground',
        geoBoundary: rect(76.9270, 10.9030, 0.0012, 0.0010),
    },
    {
        zoneName: 'Auditorium & Admin Block',
        geoBoundary: rect(76.9240, 10.9015, 0.0012, 0.0009),
    },
]

async function seedZones() {
    try {
        await connectToDatabase()
        console.log('✅ Connected to database\n')

        // Find any existing admin/system user to use as createdBy
        const adminUser = await UserModel.findOne({ role: { $in: ['admin', 'delegated_admin'] } })
        if (!adminUser) {
            console.error('❌ No admin user found. Run seed-users.ts first.')
            process.exit(1)
        }
        console.log(`ℹ️  Using admin: ${adminUser.profile?.email} (${adminUser._id})\n`)

        let created = 0
        let skipped = 0

        for (const zone of ZONES) {
            const existing = await CampusZoneModel.findOne({ zoneName: zone.zoneName })
            if (existing) {
                console.log(`⏭️  Zone "${zone.zoneName}" already exists — skipping`)
                skipped++
                continue
            }

            await CampusZoneModel.create({
                zoneName: zone.zoneName,
                geoBoundary: zone.geoBoundary,
                isActive: true,
                createdBy: adminUser._id,
                updatedAt: new Date(),
            })

            console.log(`✅  Created zone: "${zone.zoneName}"`)
            created++
        }

        console.log(`\n🎉 Done! Created ${created}, skipped ${skipped}.`)
        process.exit(0)
    } catch (err) {
        console.error('Seeding failed:', err)
        process.exit(1)
    }
}

seedZones()
