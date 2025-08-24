use chrono::{DateTime, Datelike, Duration, Timelike, Utc, Weekday};

/// Calculate next Monday at 17:00 UTC from a given reference time string
///
/// Logic:
/// - If reference time is Monday before 17:00 (5 PM), return the same day at 17:00
/// - Otherwise, calculate the following Monday and return that day at 17:00
///
/// # Arguments
/// * `reference_time` - ISO 8601 formatted time string (e.g., "2025-01-15T10:30:00Z")
///
/// # Returns
/// * `DateTime<Utc>` representing the next available Monday at 17:00:00 UTC
pub fn get_next_monday_from(reference_time: &str) -> Result<DateTime<Utc>, chrono::ParseError> {
    let parsed_time = reference_time.parse::<DateTime<Utc>>()?;

    // Check if reference time is Monday before 5 PM
    if parsed_time.weekday() == Weekday::Mon && parsed_time.hour() < 17 {
        // Return the same day at 17:00
        let same_monday = parsed_time
            .date_naive()
            .and_hms_opt(17, 0, 0)
            .unwrap()
            .and_utc();
        return Ok(same_monday);
    }

    // Otherwise, find the next Monday
    let mut target = parsed_time + Duration::days(1);
    while target.weekday() != Weekday::Mon {
        target = target + Duration::days(1);
    }

    // Set to 17:00:00 UTC
    let next_monday = target.date_naive().and_hms_opt(17, 0, 0).unwrap().and_utc();

    Ok(next_monday)
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{Datelike, Timelike};

    #[test]
    fn test_get_next_monday_from_thursday() {
        // Test with a Thursday (Jan 2, 2025 at 10:30:00 UTC)
        let reference_time = "2025-01-02T10:30:00Z";
        let next_monday = get_next_monday_from(reference_time).unwrap();

        // Next Monday should be Jan 6, 2025 at 17:00:00 UTC
        assert_eq!(next_monday.weekday(), Weekday::Mon);
        assert_eq!(next_monday.day(), 6);
        assert_eq!(next_monday.month(), 1);
        assert_eq!(next_monday.year(), 2025);
        assert_eq!(next_monday.hour(), 17);
        assert_eq!(next_monday.minute(), 0);
        assert_eq!(next_monday.second(), 0);
    }

    #[test]
    fn test_get_next_monday_from_monday_before_5pm() {
        // Test with a Monday before 5 PM (Jan 6, 2025 at 10:00:00 UTC)
        let reference_time = "2025-01-06T10:00:00Z";
        let next_monday = get_next_monday_from(reference_time).unwrap();

        // Should return the same day at 17:00:00 UTC
        assert_eq!(next_monday.weekday(), Weekday::Mon);
        assert_eq!(next_monday.day(), 6);
        assert_eq!(next_monday.month(), 1);
        assert_eq!(next_monday.year(), 2025);
        assert_eq!(next_monday.hour(), 17);
        assert_eq!(next_monday.minute(), 0);
        assert_eq!(next_monday.second(), 0);
    }

    #[test]
    fn test_get_next_monday_from_monday_after_5pm() {
        // Test with a Monday after 5 PM (Jan 6, 2025 at 18:30:00 UTC)
        let reference_time = "2025-01-06T18:30:00Z";
        let next_monday = get_next_monday_from(reference_time).unwrap();

        // Should return next Monday (Jan 13, 2025 at 17:00:00 UTC)
        assert_eq!(next_monday.weekday(), Weekday::Mon);
        assert_eq!(next_monday.day(), 13);
        assert_eq!(next_monday.month(), 1);
        assert_eq!(next_monday.year(), 2025);
        assert_eq!(next_monday.hour(), 17);
    }

    #[test]
    fn test_get_next_monday_from_monday_exactly_5pm() {
        // Test with a Monday exactly at 5 PM (Jan 6, 2025 at 17:00:00 UTC)
        let reference_time = "2025-01-06T17:00:00Z";
        let next_monday = get_next_monday_from(reference_time).unwrap();

        // Should return next Monday (Jan 13, 2025 at 17:00:00 UTC) because it's not before 5 PM
        assert_eq!(next_monday.weekday(), Weekday::Mon);
        assert_eq!(next_monday.day(), 13);
        assert_eq!(next_monday.month(), 1);
        assert_eq!(next_monday.year(), 2025);
        assert_eq!(next_monday.hour(), 17);
    }

    #[test]
    fn test_get_next_monday_from_invalid_time() {
        let invalid_time = "not-a-valid-time";
        let result = get_next_monday_from(invalid_time);
        assert!(result.is_err());
    }
}
