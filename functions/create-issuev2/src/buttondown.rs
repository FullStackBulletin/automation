use anyhow::{Context, Result};
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct CreateEmailRequest {
    pub subject: String,
    pub body: String,
    pub publish_date: String,
    pub status: String,
    pub slug: String,
    pub commenting_mode: String,
}

#[derive(Debug, Serialize)]
pub struct SendDraftRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subscribers: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub recipients: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct EmailResponse {
    pub id: String,
    pub status: String,
}

pub struct ButtonDownClient {
    client: Client,
    api_key: String,
    base_url: String,
}

impl ButtonDownClient {
    /// Create a new ButtonDown client with custom reqwest client (useful for Lambda with rustls)
    pub fn new(api_key: String, client: Client) -> Self {
        Self {
            client,
            api_key,
            base_url: "https://api.buttondown.com/v1".to_string(),
        }
    }

    /// Generate a slug from a title by converting to lowercase and replacing spaces/special chars with hyphens
    fn generate_slug(title: &str) -> String {
        title
            .to_lowercase()
            .chars()
            .map(|c| if c.is_alphanumeric() { c } else { '-' })
            .collect::<String>()
            .split('-')
            .filter(|s| !s.is_empty())
            .collect::<Vec<_>>()
            .join("-")
    }

    /// Create a scheduled email with the given subject, markdown body, publish date, issue number, and first link title
    pub async fn create_scheduled_email(
        &self,
        subject: String,
        body: String,
        publish_date: String,
        issue_number: u32,
        first_link_title: &str,
    ) -> Result<EmailResponse> {
        let first_link_slug = Self::generate_slug(first_link_title);
        let slug = format!("{}-{}", issue_number, first_link_slug);

        let request = CreateEmailRequest {
            subject,
            body,
            publish_date,
            status: "scheduled".to_string(),
            slug,
            commenting_mode: "enabled".to_string(),
        };

        self.create_email(request).await
    }

    /// Create an email with full control over all parameters
    pub async fn create_email(&self, request: CreateEmailRequest) -> Result<EmailResponse> {
        let url = format!("{}/emails", self.base_url);

        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Token {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await
            .context("Failed to send request to ButtonDown API")?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            return Err(anyhow::anyhow!(
                "ButtonDown API returned error {}: {}",
                status,
                error_text
            ));
        }

        let email_response: EmailResponse = response
            .json()
            .await
            .context("Failed to parse ButtonDown API response")?;

        Ok(email_response)
    }

    /// Send a draft email with full control over recipients
    pub async fn send_draft(&self, email_id: &str, request: SendDraftRequest) -> Result<()> {
        let url = format!("{}/emails/{}/send-draft", self.base_url, email_id);

        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Token {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await
            .context("Failed to send draft request to ButtonDown API")?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            return Err(anyhow::anyhow!(
                "ButtonDown API returned error {}: {}",
                status,
                error_text
            ));
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_email_request_serialization() {
        let request = CreateEmailRequest {
            subject: "Test Subject".to_string(),
            body: "Test body content".to_string(),
            publish_date: "2025-01-06T17:00:00Z".to_string(),
            status: "scheduled".to_string(),
            slug: "435-interactive-guide-svg-paths".to_string(),
            commenting_mode: "enabled".to_string(),
        };

        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("Test Subject"));
        assert!(json.contains("Test body content"));
        assert!(json.contains("scheduled"));
        assert!(json.contains("2025-01-06T17:00:00Z"));
        assert!(json.contains("435-interactive-guide-svg-paths"));
        assert!(json.contains("enabled"));
    }

    #[test]
    fn test_generate_slug() {
        assert_eq!(
            ButtonDownClient::generate_slug("An Interactive Guide to SVG Paths"),
            "an-interactive-guide-to-svg-paths"
        );
        assert_eq!(
            ButtonDownClient::generate_slug("React & TypeScript: Best Practices"),
            "react-typescript-best-practices"
        );
        assert_eq!(
            ButtonDownClient::generate_slug("Hello, World!"),
            "hello-world"
        );
        assert_eq!(
            ButtonDownClient::generate_slug("Multiple---dashes & spaces!!!"),
            "multiple-dashes-spaces"
        );
    }

    #[test]
    fn test_send_draft_request_serialization() {
        // Test empty request (send to all subscribers)
        let request = SendDraftRequest {
            subscribers: None,
            recipients: None,
        };
        let json = serde_json::to_string(&request).unwrap();
        assert_eq!(json, "{}"); // Should be empty due to skip_serializing_if

        // Test with recipients
        let request = SendDraftRequest {
            subscribers: None,
            recipients: Some(vec![
                "test1@example.com".to_string(),
                "test2@example.com".to_string(),
            ]),
        };
        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("recipients"));
        assert!(json.contains("test1@example.com"));
        assert!(!json.contains("subscribers"));

        // Test with subscribers
        let request = SendDraftRequest {
            subscribers: Some(vec!["uuid1".to_string(), "uuid2".to_string()]),
            recipients: None,
        };
        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("subscribers"));
        assert!(json.contains("uuid1"));
        assert!(!json.contains("recipients"));
    }

    // Note: Integration tests with actual API calls would require a test API key
    // and should be run separately from unit tests
}
