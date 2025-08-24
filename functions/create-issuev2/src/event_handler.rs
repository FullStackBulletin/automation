use lambda_runtime::{tracing, Error, LambdaEvent};
use serde_json::{json, Value};
use std::env;

use crate::buttondown::{ButtonDownClient, SendDraftRequest};
use crate::datetime_utils::CampaignTiming;
use crate::model::{Event, Link};
use crate::template::{generate_extra_content_title, TemplateRenderer};

pub(crate) struct HandlerConfig {
    pub(crate) buttondown_client: ButtonDownClient,
    pub(crate) template_renderer: TemplateRenderer,
    pub(crate) draft_subscriber_id: String,
    pub(crate) draft_recipient_email: String,
}

static EMOJIS: [&str; 32] = [
    "🔶", "📩", "🟢", "📧", "🔺", "🟡", "🧐", "💾", "🔷", "📋", "🟣", "🚩", "🔴", "🧶", "🤓", "✳️",
    "🟠", "🍭", "📨", "📫", "▶️", "🌀", "🍀", "🔵", "⚪️", "💬", "😎", "❇️", "🔸", "✉️", "📭", "🟤",
];

/// Main Lambda function handler for creating newsletter issues
pub(crate) async fn function_handler(
    event: LambdaEvent<Event>,
    config: &HandlerConfig,
) -> Result<Value, Error> {
    tracing::info!("Starting create-issue-v2 lambda");

    tracing::info!("Processing issue #{}", event.payload.next_issue.number);

    // Step 1: Calculate timing information
    let timing = CampaignTiming::new();
    let campaign_name = format!("fullstackBulletin-{}", event.payload.next_issue.number);
    let extra_content_title = generate_extra_content_title(event.payload.next_issue.number);

    tracing::info!(
        "Campaign timing calculated: schedule for {}",
        timing.schedule_time_formatted()
    );
    tracing::info!("Campaign name: {}", campaign_name);

    // Step 2: Extract data from event
    let quote = &event.payload.data.quote;
    let book = &event.payload.data.book;
    let links = &event.payload.data.links;
    let sponsor = &event.payload.data.sponsor;

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
    let rendered_content = config
        .template_renderer
        .render_newsletter(
            event.payload.next_issue.number,
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

    // Step 5: Prepare campaign settings
    let list_id = env::var("BUTTONDOWN_LIST_ID").unwrap_or_else(|_| "TODO_LIST_ID".to_string());
    let from_email =
        env::var("BUTTONDOWN_FROM_EMAIL").unwrap_or_else(|_| "TODO_FROM_EMAIL".to_string());
    let from_name =
        env::var("BUTTONDOWN_FROM_NAME").unwrap_or_else(|_| "TODO_FROM_NAME".to_string());
    let reply_to =
        env::var("BUTTONDOWN_REPLY_TO_EMAIL").unwrap_or_else(|_| "TODO_REPLY_TO".to_string());
    let test_emails = env::var("BUTTONDOWN_TEST_EMAILS")
        .unwrap_or_else(|_| "TODO_TEST_EMAILS".to_string())
        .split(',')
        .map(|s| s.trim().to_string())
        .collect::<Vec<_>>();

    // Generate subject line with rotating emoji
    let emoji_index = (event.payload.next_issue.number as usize) % EMOJIS.len();
    let selected_emoji = EMOJIS[emoji_index];

    let subject_line = format!(
        "{} {} — FullStack Bulletin #{}",
        selected_emoji,
        links
            .first()
            .map(|l| &l.title)
            .unwrap_or(&"Weekly Newsletter".to_string()),
        event.payload.next_issue.number
    );
    let preview_text = links
        .iter()
        .skip(1)
        .map(|link| link.title.as_str())
        .collect::<Vec<_>>()
        .join(", ");

    let campaign_settings = json!({
        "listId": list_id,
        "from": from_email,
        "fromName": from_name,
        "replyTo": reply_to,
        "campaignName": campaign_name,
        "subjectLine": subject_line,
        "previewText": preview_text,
        "scheduleTime": timing.schedule_time_formatted(),
        "testEmails": test_emails
    });

    // Step 6: Handle dry run mode
    if event.payload.config.dry_run {
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

    // Step 7: Create ButtonDown campaign
    tracing::info!("Creating ButtonDown campaign");
    tracing::info!(
        "Content rendered as markdown: {} characters",
        rendered_content.len()
    );
    tracing::info!(
        "Will schedule campaign for: {}",
        timing.schedule_time_formatted()
    );

    // Extract campaign settings for ButtonDown API
    let subject = campaign_settings
        .get("subjectLine")
        .and_then(|v| v.as_str())
        .unwrap_or("Newsletter Issue")
        .to_string();

    let schedule_time = campaign_settings
        .get("scheduleTime")
        .and_then(|v| v.as_str());

    tracing::info!("Creating ButtonDown email with subject: {}", subject);

    // Create email (draft or scheduled based on schedule_time)
    let email_response = match schedule_time {
        Some(schedule_time) => {
            tracing::info!("Creating scheduled email for: {}", schedule_time);
            config
                .buttondown_client
                .create_scheduled_email(
                    subject,
                    rendered_content.to_string(),
                    schedule_time.to_string(),
                )
                .await
                .map_err(|e| format!("Failed to create scheduled email: {}", e))?
        }
        None => {
            tracing::info!("Creating draft email");
            config
                .buttondown_client
                .create_draft_email(subject, rendered_content.to_string())
                .await
                .map_err(|e| format!("Failed to create draft email: {}", e))?
        }
    };

    let campaign_id = email_response.id.clone();

    tracing::info!("ButtonDown email created with ID: {}", email_response.id);
    tracing::info!("Email status: {}", email_response.status);

    // Send test emails if configured
    if let Some(test_emails) = campaign_settings
        .get("testEmails")
        .and_then(|v| v.as_array())
    {
        if !test_emails.is_empty() {
            let test_email_addresses: Vec<String> = test_emails
                .iter()
                .filter_map(|v| v.as_str())
                .map(|s| s.to_string())
                .collect();

            if !test_email_addresses.is_empty() {
                tracing::info!(
                    "Sending test email to {} addresses",
                    test_email_addresses.len()
                );

                // For scheduled emails, we create a separate draft to send as test
                // For draft emails, we can send the draft directly to test recipients
                match email_response.status.as_str() {
                    "draft" => {
                        let send_request = SendDraftRequest {
                            subscribers: None,
                            recipients: Some(test_email_addresses),
                        };
                        config
                            .buttondown_client
                            .send_draft(&email_response.id, send_request)
                            .await
                            .map_err(|e| format!("Failed to send test email: {}", e))?;
                        tracing::info!("Test email sent successfully");
                    }
                    "scheduled" => {
                        // For scheduled emails, we'd need to create a separate draft for testing
                        // This is a design decision - for now, we'll log that we can't send test emails for scheduled emails
                        tracing::warn!("Test emails not supported for scheduled emails - email is already scheduled to send at the specified time");
                    }
                    _ => {
                        tracing::warn!(
                            "Unknown email status '{}' - cannot send test email",
                            email_response.status
                        );
                    }
                }
            }
        }
    }

    tracing::info!(
        "ButtonDown campaign created successfully with ID: {}",
        campaign_id
    );

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

#[cfg(test)]
mod tests {
    // TODO: Add proper integration test with sample event data
    // This would require creating a valid Event structure with all required fields
}
