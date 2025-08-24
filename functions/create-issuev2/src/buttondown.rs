use anyhow::{Context, Result};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize)]
pub struct CreateEmailRequest {
    pub subject: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub body: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub publish_date: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub slug: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub commenting_mode: Option<String>,
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
    pub subject: String,
    pub body: Option<String>,
    pub status: String,
    pub slug: Option<String>,
    pub creation_date: String,
    pub publish_date: Option<String>,
    pub email_type: Option<String>,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
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

    /// Create a draft email with the given subject and markdown body
    pub async fn create_draft_email(&self, subject: String, body: String) -> Result<EmailResponse> {
        let request = CreateEmailRequest {
            subject,
            body: Some(body),
            status: Some("draft".to_string()),
            email_type: Some("regular".to_string()),
            publish_date: None,
            slug: None,
            metadata: None,
            commenting_mode: None,
        };

        self.create_email(request).await
    }

    /// Create a scheduled email with the given subject, markdown body, and publish date
    pub async fn create_scheduled_email(
        &self,
        subject: String,
        body: String,
        publish_date: String,
    ) -> Result<EmailResponse> {
        let request = CreateEmailRequest {
            subject,
            body: Some(body),
            status: Some("scheduled".to_string()),
            email_type: Some("regular".to_string()),
            publish_date: Some(publish_date),
            slug: None,
            metadata: None,
            commenting_mode: None,
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
            body: Some("Test body content".to_string()),
            status: Some("draft".to_string()),
            email_type: Some("regular".to_string()),
            publish_date: None,
            slug: None,
            metadata: None,
            commenting_mode: None,
        };

        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("Test Subject"));
        assert!(json.contains("Test body content"));
        assert!(json.contains("draft"));
        assert!(json.contains("regular"));
        // Should not contain null fields due to skip_serializing_if
        assert!(!json.contains("publish_date"));
        assert!(!json.contains("slug"));
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
