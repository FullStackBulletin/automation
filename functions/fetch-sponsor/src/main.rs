use lambda_runtime::{run, service_fn, tracing, Error, LambdaEvent};
use reqwest::Url;
use serde::{Deserialize, Serialize};
use shared::Event;
use std::time::Duration;

#[derive(Deserialize, Clone, Debug, Default)]
struct Sponsor {
    #[serde(rename = "BannerHTML")]
    banner_html: Option<String>,
    #[serde(rename = "SponsoredArticleHTML")]
    sponsored_article_html: Option<String>,
    #[serde(rename = "Customer")]
    customer: Option<String>,
}

#[derive(Serialize, Clone, Debug, Default)]
struct SponsorResponse {
    banner_html: String,
    sponsored_article_html: String,
    customer: String,
}

impl From<Sponsor> for SponsorResponse {
    fn from(sponsor: Sponsor) -> Self {
        SponsorResponse {
            banner_html: sponsor.banner_html.unwrap_or_default(),
            sponsored_article_html: sponsor.sponsored_article_html.unwrap_or_default(),
            customer: sponsor.customer.unwrap_or_default(),
        }
    }
}

#[derive(Deserialize, Default)]
struct SponsorWrapper {
    fields: Sponsor,
}

#[derive(Deserialize)]
struct AirtableResponse {
    records: Vec<SponsorWrapper>,
}

static AIRTABLE_BASE_URL: &str = "https://api.airtable.com/v0";

struct Handler {
    airtable_table_id: String,
    airtable_api_key: String,
    client: reqwest::Client,
}

impl Handler {
    async fn handle(&self, event: LambdaEvent<Event>) -> Result<SponsorResponse, Error> {
        let url = Url::parse(&format!(
            "{}/{}/Sponsors",
            AIRTABLE_BASE_URL, self.airtable_table_id
        ))
        .unwrap()
        .query_pairs_mut()
        .append_pair("maxRecords", "1")
        .append_pair(
            "filterByFormula",
            format!("{{Issue}}={}", event.payload.next_issue.number).as_str(),
        )
        .finish()
        .to_string();

        let resp: AirtableResponse = self
            .client
            .get(&url)
            .header(
                "Authorization",
                format!("Bearer {}", self.airtable_api_key).as_str(),
            )
            .send()
            .await?
            .json()
            .await?;

        if resp.records.is_empty() {
            return Ok(SponsorResponse::default());
        }

        Ok(resp.records.into_iter().next().unwrap().fields.into())
    }
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing::init_default_subscriber();

    let airtable_table_id =
        std::env::var("AIRTABLE_TABLE_ID").expect("AIRTABLE_TABLE_ID must be set");
    let airtable_api_key = std::env::var("AIRTABLE_APIKEY").expect("AIRTABLE_APIKEY must be set");

    let client = reqwest::ClientBuilder::new()
        .timeout(Duration::from_secs(5))
        .build()?;

    let handler = &Handler {
        airtable_api_key,
        airtable_table_id,
        client,
    };

    run(service_fn(move |event| async move {
        handler.handle(event).await
    }))
    .await
}
