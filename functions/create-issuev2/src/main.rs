mod buttondown;
mod datetime_utils;
mod event_handler;
mod model;
mod template;

use crate::{
    buttondown::ButtonDownClient, event_handler::HandlerConfig, template::TemplateRenderer,
};
use event_handler::function_handler;
use lambda_runtime::{run, service_fn, tracing, Error};

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing::init_default_subscriber();

    let draft_subscriber_id: String = std::env::var("DRAFT_SUBSCRIBER_ID")
        .expect("DRAFT_SUBSCRIBER_ID environment variable not set");
    let draft_recipient_email: String = std::env::var("DRAFT_RECIPIENT_EMAIL")
        .expect("DRAFT_RECIPIENT_EMAIL environment variable not set");
    let buttondown_api_key = std::env::var("BUTTONDOWN_API_KEY")
        .expect("BUTTONDOWN_API_KEY environment variable not set");
    let reqwest_client = reqwest::Client::builder()
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let buttondown_client = ButtonDownClient::new(buttondown_api_key, reqwest_client);
    let template_renderer = TemplateRenderer::new().expect("Failed to create template renderer");

    let handler_config = HandlerConfig {
        buttondown_client,
        template_renderer,
        draft_subscriber_id,
        draft_recipient_email,
    };

    run(service_fn(|event| function_handler(event, &handler_config))).await
}
