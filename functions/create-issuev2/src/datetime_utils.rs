use chrono::{DateTime, Datelike, Duration, Utc, Weekday};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CampaignTiming {
    pub schedule_for: DateTime<Utc>,
    pub reference_moment: DateTime<Utc>,
}

impl CampaignTiming {
    /// Creates campaign timing based on current UTC time
    /// - schedule_for: Next Monday at 17:00 UTC
    /// - reference_moment: Start of day one week ago
    /// - week_number: ISO week number of current time
    /// - year: Current year
    pub fn new() -> Self {
        let now = Utc::now();

        // Calculate next Monday at 17:00:00 UTC
        let schedule_for = Self::next_monday_at_hour(&now, 17);

        // Reference moment: start of day one week ago
        let reference_moment = (now - Duration::weeks(1))
            .date_naive()
            .and_hms_opt(0, 0, 0)
            .unwrap()
            .and_utc();

        Self {
            schedule_for,
            reference_moment,
        }
    }

    /// Calculate next Monday at specified hour (UTC)
    fn next_monday_at_hour(from: &DateTime<Utc>, hour: u32) -> DateTime<Utc> {
        let mut target = *from + Duration::weeks(1);

        // Find the next Monday
        while target.weekday() != Weekday::Mon {
            target = target + Duration::days(1);
        }

        // Set to specified hour, 0 minutes, 0 seconds, 0 milliseconds
        target
            .date_naive()
            .and_hms_opt(hour, 0, 0)
            .unwrap()
            .and_utc()
    }

    /// Get schedule time formatted for ButtonDown API (ISO 8601)
    pub fn schedule_time_formatted(&self) -> String {
        self.schedule_for.to_rfc3339()
    }

    /// Get reference moment formatted for debugging
    pub fn reference_moment_formatted(&self) -> String {
        self.reference_moment.to_rfc3339()
    }
}


#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{TimeZone, Timelike};

    #[test]
    fn test_campaign_timing_creation() {
        let timing = CampaignTiming::new();

        // Verify that schedule_for is in the future
        assert!(timing.schedule_for > Utc::now());

        // Verify that schedule_for is on a Monday
        assert_eq!(timing.schedule_for.weekday(), Weekday::Mon);

        // Verify that schedule_for is at 17:00 UTC
        assert_eq!(timing.schedule_for.hour(), 17);
        assert_eq!(timing.schedule_for.minute(), 0);
        assert_eq!(timing.schedule_for.second(), 0);

        // Verify that reference_moment is in the past
        assert!(timing.reference_moment < Utc::now());
    }

    #[test]
    fn test_next_monday_calculation() {
        // Test with a known date (Thursday, Jan 2, 2025)
        let test_date = Utc.with_ymd_and_hms(2025, 1, 2, 10, 30, 0).unwrap();
        let next_monday = CampaignTiming::next_monday_at_hour(&test_date, 17);

        // Next Monday should be Jan 13, 2025 at 17:00
        assert_eq!(next_monday.weekday(), Weekday::Mon);
        assert_eq!(next_monday.day(), 13);
        assert_eq!(next_monday.month(), 1);
        assert_eq!(next_monday.hour(), 17);
    }


    #[test]
    fn test_formatting_methods() {
        let timing = CampaignTiming::new();

        let schedule_formatted = timing.schedule_time_formatted();
        let reference_formatted = timing.reference_moment_formatted();

        // Should be valid ISO 8601 format
        assert!(schedule_formatted.contains("T"));
        assert!(schedule_formatted.ends_with("Z") || schedule_formatted.contains("+"));
        assert!(reference_formatted.contains("T"));
        assert!(reference_formatted.ends_with("Z") || reference_formatted.contains("+"));
    }
}
