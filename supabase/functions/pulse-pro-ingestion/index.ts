// ============================================================================
// PULSE PRO API INGESTION - Supabase Edge Function
// Automated environmental data collection from Pulse Pro sensors
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// ============================================================================
// CONFIGURATION
// ============================================================================

const PULSE_PRO_API_URL = Deno.env.get("PULSE_PRO_API_URL") || "https://api.pulsegrow.com/v1";
const PULSE_PRO_API_KEY = Deno.env.get("PULSE_PRO_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Initialize Supabase client with service role (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============================================================================
// TYPES
// ============================================================================

interface PulseProReading {
    device_id: string;
    timestamp: string;
    temperature: number;
    humidity: number;
    vpd: number;
    co2: number;
    ppfd: number;
    light_on: boolean;
}

interface RoomMapping {
    room_id: string;
    pulse_device_id: string;
    room_name: string;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
    try {
        console.log("🌱 Starting Pulse Pro data ingestion...");

        // 1. Fetch device-to-room mappings from database
        const roomMappings = await getRoomMappings();

        if (roomMappings.length === 0) {
            console.warn("⚠️ No room mappings found. Configure pulse_device_id in rooms table.");
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "No room mappings configured"
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        console.log(`📍 Found ${roomMappings.length} room mappings`);

        // 2. Fetch latest readings from Pulse Pro API
        const pulseReadings = await fetchPulseProData(roomMappings);

        if (pulseReadings.length === 0) {
            console.log("ℹ️ No new readings from Pulse Pro API");
            return new Response(
                JSON.stringify({
                    success: true,
                    message: "No new readings",
                    inserted: 0
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }

        console.log(`📊 Received ${pulseReadings.length} readings from Pulse Pro`);

        // 3. Transform and insert into database
        const insertedCount = await insertEnvironmentalReadings(pulseReadings, roomMappings);

        console.log(`✅ Successfully inserted ${insertedCount} environmental readings`);

        return new Response(
            JSON.stringify({
                success: true,
                inserted: insertedCount,
                timestamp: new Date().toISOString()
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("❌ Error in Pulse Pro ingestion:", error);

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetch room-to-device mappings from database
 * Supports multiple sensor brands (Pulse Pro, Grocast, etc.)
 */
async function getRoomMappings(): Promise<RoomMapping[]> {
    const { data, error } = await supabase
        .from("rooms")
        .select("id, name, sensor_device_id, sensor_brand")
        .not("sensor_device_id", "is", null)
        .eq("is_active", true);

    if (error) {
        console.error("Error fetching room mappings:", error);
        throw new Error(`Database error: ${error.message}`);
    }

    return data.map((room) => ({
        room_id: room.id,
        pulse_device_id: room.sensor_device_id, // Keep same property name for compatibility
        room_name: room.name,
        sensor_brand: room.sensor_brand || 'pulse_pro',
    }));
}

/**
 * Fetch latest measurements from Pulse Pro API
 */
async function fetchPulseProData(
    roomMappings: RoomMapping[]
): Promise<PulseProReading[]> {

    if (!PULSE_PRO_API_KEY) {
        throw new Error("PULSE_PRO_API_KEY not configured");
    }

    const deviceIds = roomMappings.map((m) => m.pulse_device_id);
    const allReadings: PulseProReading[] = [];

    // Fetch data for each device
    for (const deviceId of deviceIds) {
        try {
            const response = await fetch(
                `${PULSE_PRO_API_URL}/devices/${deviceId}/measurements/latest`,
                {
                    headers: {
                        "Authorization": `Bearer ${PULSE_PRO_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                console.error(`Failed to fetch data for device ${deviceId}: ${response.statusText}`);
                continue;
            }

            const data = await response.json();

            // Transform Pulse Pro API response to our format
            const reading: PulseProReading = {
                device_id: deviceId,
                timestamp: data.timestamp || new Date().toISOString(),
                temperature: data.temperature,
                humidity: data.humidity,
                vpd: data.vpd || calculateVPD(data.temperature, data.humidity),
                co2: data.co2,
                ppfd: data.ppfd || data.par,
                light_on: data.light_status === "on" || data.ppfd > 50,
            };

            allReadings.push(reading);

        } catch (error) {
            console.error(`Error fetching device ${deviceId}:`, error);
            // Continue with other devices even if one fails
        }
    }

    return allReadings;
}

/**
 * Insert environmental readings into database
 */
async function insertEnvironmentalReadings(
    readings: PulseProReading[],
    roomMappings: RoomMapping[]
): Promise<number> {

    // Create lookup map for device_id -> room_id
    const deviceToRoom = new Map(
        roomMappings.map((m) => [m.pulse_device_id, m.room_id])
    );

    // Transform readings to database format
    const dbReadings = readings
        .filter((r) => deviceToRoom.has(r.device_id))
        .map((r) => ({
            timestamp: r.timestamp,
            room_id: deviceToRoom.get(r.device_id),
            temp_c: r.temperature,
            humidity: r.humidity,
            vpd: r.vpd,
            co2_ppm: r.co2,
            ppfd: r.ppfd,
            light_status: r.light_on ? "on" : "off",
            source: "pulse_pro",
        }));

    if (dbReadings.length === 0) {
        return 0;
    }

    // Bulk insert
    const { data, error } = await supabase
        .from("environmental_readings")
        .insert(dbReadings)
        .select();

    if (error) {
        console.error("Error inserting readings:", error);
        throw new Error(`Database insert error: ${error.message}`);
    }

    return data?.length || 0;
}

/**
 * Calculate VPD from temperature and humidity
 * VPD (kPa) = SVP × (1 - RH/100)
 * SVP = 0.6108 × exp(17.27 × T / (T + 237.3))
 */
function calculateVPD(tempC: number, humidity: number): number {
    const svp = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
    const vpd = svp * (1 - humidity / 100);
    return Math.round(vpd * 100) / 100; // Round to 2 decimals
}

// ============================================================================
// NOTES
// ============================================================================

/*
DEPLOYMENT INSTRUCTIONS:

1. Deploy to Supabase:
   supabase functions deploy pulse-pro-ingestion

2. Set environment variables in Supabase Dashboard:
   - PULSE_PRO_API_URL (optional, defaults to https://api.pulsegrow.com/v1)
   - PULSE_PRO_API_KEY (required)

3. Configure cron schedule in Supabase Dashboard:
   - Function: pulse-pro-ingestion
   - Schedule: */10 * * * * (every 10 minutes)
- Or use: 0, 10, 20, 30, 40, 50 * * * * for exact 10 - min intervals

4. Configure room mappings:
   UPDATE rooms 
   SET pulse_device_id = 'DEVICE_ID_FROM_PULSE_PRO'
   WHERE name = 'Flora A';

5. Test manually:
curl - X POST https://YOUR_PROJECT.supabase.co/functions/v1/pulse-pro-ingestion \
-H "Authorization: Bearer YOUR_ANON_KEY"

ERROR HANDLING:
- Individual device failures don't stop the entire ingestion
    - Errors are logged to Supabase Edge Function logs
        - Failed readings are skipped, successful ones are inserted

PERFORMANCE:
- Bulk insert for efficiency
    - Service role bypasses RLS for faster writes
        - Handles multiple rooms / devices in single execution
            */
