use serde::Deserialize;
use std::collections::HashMap;

#[derive(Deserialize, Debug)]
pub struct Event {
    pub config: Config,
    #[serde(rename = "NextIssue")]
    pub next_issue: NextIssue,
    pub data: Data,
}

#[derive(Deserialize, Debug)]
pub struct Config {
    #[serde(rename = "dryRun")]
    pub dry_run: bool,
    #[serde(rename = "detail-type")]
    pub detail_type: String,
    pub resources: Vec<String>,
    pub id: String,
    pub source: String,
    pub time: String,
    pub detail: HashMap<String, serde_json::Value>,
    pub region: String,
    pub version: String,
    pub account: String,
}

#[derive(Deserialize, Debug)]
pub struct NextIssue {
    pub number: u32,
}

#[derive(Deserialize, Debug)]
pub struct Data {
    #[serde(rename = "Quote")]
    pub quote: Quote,
    #[serde(rename = "Book")]
    pub book: Book,
    #[serde(rename = "Sponsor")]
    pub sponsor: Sponsor,
    #[serde(rename = "Links")]
    pub links: Vec<Link>,
}

#[derive(Deserialize, Debug)]
pub struct Quote {
    pub id: u32,
    pub text: String,
    pub author: String,
    #[serde(rename = "authorDescription")]
    pub author_description: String,
    #[serde(rename = "authorUrl")]
    pub author_url: String,
}

#[derive(Deserialize, Debug)]
pub struct Book {
    pub id: String,
    pub title: String,
    pub author: String,
    pub links: BookLinks,
    #[serde(rename = "coverPicture")]
    pub cover_picture: String,
    pub description: String,
}

#[derive(Deserialize, Debug)]
pub struct BookLinks {
    pub us: String,
    pub uk: String,
}

#[derive(Deserialize, Debug)]
pub struct Sponsor {
    pub banner_html: String,
    pub sponsored_article_html: String,
    pub customer: String,
}

#[derive(Deserialize, Debug)]
pub struct Link {
    pub title: String,
    pub url: String,
    pub description: String,
    pub image: String,
    pub score: u32,
    #[serde(rename = "originalImage")]
    pub original_image: String,
    #[serde(rename = "campaignUrls")]
    pub campaign_urls: CampaignUrls,
}

#[derive(Deserialize, Debug)]
pub struct CampaignUrls {
    pub title: String,
    pub image: String,
    pub description: String,
}