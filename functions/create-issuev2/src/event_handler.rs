use lambda_runtime::{tracing, Error, LambdaEvent};
use serde_json::{json, Value};
use std::env;

use crate::datetime_utils::{generate_extra_content_title, CampaignTiming};
use crate::model::{Event, Link};
use crate::template::TemplateRenderer;

/// Main Lambda function handler for creating newsletter issues
pub(crate) async fn function_handler(event: LambdaEvent<Value>) -> Result<Value, Error> {
    tracing::info!("Starting create-issue-v2 lambda");
    
    // Parse the incoming event
    let parsed_event: Event = serde_json::from_value(event.payload)
        .map_err(|e| format!("Failed to parse event: {}", e))?;
    
    tracing::info!("Processing issue #{}", parsed_event.next_issue.number);

    // Step 1: Calculate timing information
    let timing = CampaignTiming::new();
    let campaign_name = format!("fullstackBulletin-{}", parsed_event.next_issue.number);
    let extra_content_title = generate_extra_content_title(parsed_event.next_issue.number);
    
    tracing::info!("Campaign timing calculated: schedule for {}", timing.schedule_time_formatted());
    tracing::info!("Campaign name: {}", campaign_name);

    // Step 2: Extract data from event
    let quote = &parsed_event.data.quote;
    let book = &parsed_event.data.book;
    let links = &parsed_event.data.links;
    let sponsor = &parsed_event.data.sponsor;
    
    tracing::info!("Loaded quote: {}", quote.text);
    tracing::info!("Loaded book: {}", book.title);
    tracing::info!("Retrieved {} links", links.len());
    tracing::info!("Retrieved sponsor: {}", sponsor.customer);

    // Step 3: Prepare links (primary vs secondary vs extra)
    let primary_link = links.first().ok_or("No primary link available")?;
    let secondary_links: Vec<&Link> = links.iter().skip(1).take(6).collect();
    let extra_links: Vec<&Link> = links.iter().skip(7).collect();
    
    tracing::info!("Primary link: {}", primary_link.title);
    tracing::info!("Secondary links: {}", secondary_links.len());
    tracing::info!("Extra links: {}", extra_links.len());

    // Step 4: Render the newsletter template
    let template_renderer = TemplateRenderer::new()
        .map_err(|e| format!("Failed to create template renderer: {}", e))?;
    
    let rendered_content = template_renderer.render_newsletter(
        parsed_event.next_issue.number,
        timing.week_number,
        timing.year as u32,
        quote,
        book,
        primary_link,
        &secondary_links,
        &extra_links,
        &extra_content_title,
        Some(sponsor),
    )
    .map_err(|e| format!("Failed to render newsletter template: {}", e))?;
    
    tracing::info!("Newsletter template rendered successfully");

    // Step 5: Prepare ButtonDown campaign settings
    let campaign_settings = prepare_campaign_settings(&campaign_name, &timing, &links)?;
    
    // Step 6: Handle dry run mode
    if parsed_event.config.dry_run {
        tracing::info!("Dry run mode enabled - no campaign will be created");
        return Ok(json!({
            "quote": quote,
            "book": book,
            "links": links,
            "campaignSettings": campaign_settings,
            "renderedContent": rendered_content,
            "dryRun": true
        }));
    }

    // Step 7: Create ButtonDown campaign (placeholder)
    // TODO: Implement ButtonDown API integration
    tracing::info!("TODO: Create ButtonDown campaign");
    tracing::info!("TODO: Set campaign content with rendered markdown");
    tracing::info!("TODO: Schedule campaign for {}", timing.schedule_time_formatted());
    tracing::info!("TODO: Send test email to configured addresses");
    
    let campaign_id = create_buttondown_campaign(&campaign_settings, &rendered_content).await?;
    
    tracing::info!("ButtonDown campaign created successfully with ID: {}", campaign_id);

    // Step 8: Return success response
    Ok(json!({
        "quote": quote,
        "book": book, 
        "links": links,
        "campaignSettings": campaign_settings,
        "campaignId": campaign_id,
        "renderedContent": rendered_content
    }))
}

/// Prepare campaign settings for ButtonDown
fn prepare_campaign_settings(
    campaign_name: &str,
    timing: &CampaignTiming,
    links: &[crate::model::Link],
) -> Result<Value, lambda_runtime::Error> {
    // TODO: Update environment variable names for ButtonDown
    let list_id = env::var("BUTTONDOWN_LIST_ID").unwrap_or_else(|_| "TODO_LIST_ID".to_string());
    let from_email = env::var("BUTTONDOWN_FROM_EMAIL").unwrap_or_else(|_| "TODO_FROM_EMAIL".to_string());
    let from_name = env::var("BUTTONDOWN_FROM_NAME").unwrap_or_else(|_| "TODO_FROM_NAME".to_string());
    let reply_to = env::var("BUTTONDOWN_REPLY_TO_EMAIL").unwrap_or_else(|_| "TODO_REPLY_TO".to_string());
    let test_emails = env::var("BUTTONDOWN_TEST_EMAILS")
        .unwrap_or_else(|_| "TODO_TEST_EMAILS".to_string())
        .split(',')
        .map(|s| s.trim().to_string())
        .collect::<Vec<_>>();

    // Generate subject line and preview text
    let subject_line = format!("🤓 #{}: {}", 
        timing.week_number,
        links.first().map(|l| &l.title).unwrap_or(&"Weekly Newsletter".to_string())
    );
    let preview_text = links.iter()
        .skip(1)
        .map(|link| link.title.as_str())
        .collect::<Vec<_>>()
        .join(", ");

    Ok(json!({
        "listId": list_id,
        "from": from_email,
        "fromName": from_name,
        "replyTo": reply_to,
        "campaignName": campaign_name,
        "subjectLine": subject_line,
        "previewText": preview_text,
        "weekNumber": timing.week_number,
        "year": timing.year,
        "scheduleTime": timing.schedule_time_formatted(),
        "testEmails": test_emails
    }))
}

/// Create ButtonDown campaign - placeholder implementation
async fn create_buttondown_campaign(
    _campaign_settings: &Value,
    _rendered_content: &str,
) -> Result<String, lambda_runtime::Error> {
    // TODO: Implement actual ButtonDown API integration
    // This should:
    // 1. Create the campaign via ButtonDown API
    // 2. Set the markdown content
    // 3. Schedule the campaign
    // 4. Send test emails
    
    tracing::info!("PLACEHOLDER: Creating ButtonDown campaign");
    tracing::info!("PLACEHOLDER: Setting campaign content");
    tracing::info!("PLACEHOLDER: Scheduling campaign");
    tracing::info!("PLACEHOLDER: Sending test emails");
    
    // Return a placeholder campaign ID
    Ok("buttondown_campaign_placeholder_id".to_string())
}

#[cfg(test)]
mod tests {
    // TODO: Add proper integration test with sample event data
    // This would require creating a valid Event structure with all required fields
}
