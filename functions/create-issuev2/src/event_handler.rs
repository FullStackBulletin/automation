use lambda_runtime::{tracing, Error, LambdaEvent};
use serde_json::{json, Value};

use crate::buttondown::{self, ButtonDownClient};
use crate::datetime_utils::get_next_monday_from;
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
    let schedule_for = get_next_monday_from(&event.payload.config.time)
        .map_err(|e| format!("Failed to parse reference time: {}", e))?;
    let campaign_name = format!("fullstackBulletin-{}", event.payload.next_issue.number);
    let extra_content_title = generate_extra_content_title(event.payload.next_issue.number);

    tracing::info!(
        "Campaign timing calculated: schedule for {}",
        schedule_for.to_rfc3339()
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

    // Step 5: Handle dry run mode
    if event.payload.config.dry_run {
        tracing::info!("Dry run mode enabled - no campaign will be created");
        return Ok(json!({
            "quote": quote,
            "book": book,
            "links": links,
            "sponsor": sponsor,
            "subjectLine": subject_line,
            "renderedContent": rendered_content,
            "dryRun": true
        }));
    }

    // Step 6: Create ButtonDown campaign
    tracing::info!("Creating ButtonDown campaign");
    tracing::info!(
        "Content rendered as markdown: {} characters",
        rendered_content.len()
    );
    tracing::info!("Will schedule campaign for: {}", schedule_for.to_rfc3339());
    tracing::info!("Creating ButtonDown email with subject: {}", subject_line);

    // Create scheduled email
    tracing::info!(
        "Creating scheduled email for: {}",
        schedule_for.to_rfc3339()
    );
    let email_response = config
        .buttondown_client
        .create_scheduled_email(
            subject_line.clone(),
            rendered_content.to_string(),
            schedule_for.to_rfc3339(),
            event.payload.next_issue.number,
            &primary_link.title,
        )
        .await
        .map_err(|e| format!("Failed to create scheduled email: {}", e))?;

    let campaign_id = email_response.id.clone();

    tracing::info!("ButtonDown email created with ID: {}", email_response.id);
    tracing::info!("Email status: {}", email_response.status);

    // Send test emails if configured
    config
        .buttondown_client
        .send_draft(
            &email_response.id,
            buttondown::SendDraftRequest {
                subscribers: Some(vec![config.draft_subscriber_id.clone()]),
                recipients: Some(vec![config.draft_recipient_email.clone()]),
            },
        )
        .await
        .map_err(|e| format!("Failed to send draft email: {}", e))?;

    tracing::info!(
        "ButtonDown campaign created successfully with ID: {}",
        campaign_id
    );

    // Step 7: Return success response
    Ok(json!({
        "quote": quote,
        "book": book,
        "links": links,
        "sponsor": sponsor,
        "subjectLine": subject_line,
        "campaignId": campaign_id,
        "renderedContent": rendered_content,
        "emailId": email_response.id
    }))
}

#[cfg(test)]
mod tests {
    // TODO: Add proper integration test with sample event data
    // This would require creating a valid Event structure with all required fields
}
